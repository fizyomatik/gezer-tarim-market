import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { validateImages, validateProduct, isInternalLink, MAX_IMAGE_BYTES } from '../src/lib/validation.ts';
import { validateCompanySettings } from '../src/lib/company-settings.ts';
import { drainStorageCleanup } from '../src/lib/storage.ts';

test('uploads reject SVG, oversized files and excessive counts before network activity', () => {
  assert.equal(validateImages([{ type: 'image/png', size: MAX_IMAGE_BYTES }]), '');
  for (const files of [[{ type: 'image/svg+xml', size: 100 }], [{ type: 'image/png', size: MAX_IMAGE_BYTES + 1 }], Array(11).fill({ type: 'image/jpeg', size: 10 })]) assert.ok(validateImages(files));
});
test('product validation preserves category/status and rejects malformed data on updates', () => {
  const form = new FormData();
  for (const [key, value] of Object.entries({ name: 'Tohum', price: '12.50', categorySlug: 'tohum', active: 'on', featured: 'on' })) form.set(key, value);
  assert.equal(validateProduct(form).value.category_slug, 'tohum');
  assert.equal(validateProduct(form).value.active, true);
  form.set('price', ''); assert.equal(validateProduct(form).value.product_price, null);
  for (const price of ['-1', 'NaN', '1.234', '1e10', '10000000000']) { form.set('price', price); assert.ok(validateProduct(form).error); }
  form.set('price', '12.50'); form.append('imagePath', '../../private'); assert.ok(validateProduct(form).error);
});
test('links and shared contact details reject executable URLs and invalid phone data', () => {
  assert.ok(isInternalLink('/products?category=tohum'));
  for (const href of ['javascript:alert(1)', '//evil.example', '/\\evil.example', '/\n/evil.example']) assert.equal(isInternalLink(href), false);
  const settings = { companyName: 'Gezer', address: 'Adıyaman', phone: '+905454904928', email: 'info@example.com', whatsapp: '+905454904928', hours: '08–18', mapUrl: 'https://maps.google.com' };
  assert.ok(validateCompanySettings(settings));
  assert.equal(validateCompanySettings({ ...settings, mapUrl: 'javascript:alert(1)' }), false);
  assert.equal(validateCompanySettings({ ...settings, whatsapp: 'abc' }), false);
});

function storageMock({ referenced = false, removeFails = false, queryFails = false } = {}) {
  const removed = []; const cleared = [];
  return {
    removed, cleared,
    rpc: async () => ({ data: [{ bucket: 'product-images', path: 'old.jpg' }], error: null }),
    from(table) {
      if (table === 'storage_cleanup') return {
        select: () => ({ lte: () => ({ limit: async () => ({ data: [{ bucket: 'product-images', path: 'old.jpg' }], error: null }) }) }),
        delete: () => ({ eq: () => ({ eq: async () => { cleared.push('old.jpg'); return { error: null }; } }) }),
      };
      return { select: () => ({ eq: () => ({ limit: async () => ({ data: referenced ? [{ id: 'p' }] : [], error: queryFails ? {} : null }) }) }) };
    },
    storage: { from: () => ({ remove: async (paths) => { removed.push(...paths); return { error: removeFails ? {} : null }; } }) },
  };
}
test('deleted media is removed and acknowledged, but referenced files survive lost save responses', async () => {
  const orphan = storageMock(); await drainStorageCleanup(orphan);
  assert.deepEqual(orphan.removed, ['old.jpg']); assert.deepEqual(orphan.cleared, ['old.jpg']);
  const attached = storageMock({ referenced: true }); await drainStorageCleanup(attached);
  assert.deepEqual(attached.removed, []); assert.deepEqual(attached.cleared, ['old.jpg']);
});
test('storage or reference-query failures preserve cleanup jobs for retry', async () => {
  for (const options of [{ removeFails: true }, { queryFails: true }]) {
    const client = storageMock(options); await drainStorageCleanup(client); assert.deepEqual(client.cleared, []);
  }
});
test('proxy invokes auth refresh and forwards refreshed cookies to both rendering and browser', async () => {
  let calls = 0;
  const source = readFileSync(new URL('../src/proxy.ts', import.meta.url), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  const responseCookies = new Map(); const requestCookies = new Map([['token', 'expired']]);
  const imports = {
    '@supabase/ssr': { createServerClient: (_url, _key, { cookies }) => ({ auth: { getUser: async () => {
      calls++; assert.equal(cookies.getAll()[0].value, 'expired');
      cookies.setAll([{ name: 'token', value: 'refreshed', options: { httpOnly: true } }]);
      return { data: { user: { id: 'customer' } } };
    } } }) },
    'next/server': { NextResponse: { next: () => ({ cookies: { set: (name, value, options) => responseCookies.set(name, { value, options }) }, headers: new Headers() }) } },
    './lib/supabase/config': { getSupabaseConfig: () => ({ url: 'https://example.test', key: 'public-test-key' }) },
  };
  vm.runInNewContext(output, { exports, require: (name) => { assert.ok(imports[name], name); return imports[name]; } });
  const response = await exports.proxy({ cookies: { getAll: () => [...requestCookies].map(([name, value]) => ({ name, value })), set: (name, value) => requestCookies.set(name, value) } });
  assert.equal(calls, 1); assert.equal(requestCookies.get('token'), 'refreshed');
  assert.equal(responseCookies.get('token').value, 'refreshed');
  assert.equal(responseCookies.get('token').options.httpOnly, true);
  assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
});


test('site-media cleanup checks both slides and categories before removing a file', async () => {
  const client = storageMock();
  client.rpc = async () => ({ data: [{ bucket: 'site-media', path: 'category.jpg' }], error: null });
  const originalFrom = client.from;
  client.from = (table) => table === 'categories'
    ? { select: () => ({ eq: () => ({ limit: async () => ({ data: [{ id: 'category' }], error: null }) }) }) }
    : originalFrom(table);
  await drainStorageCleanup(client);
  assert.deepEqual(client.removed, []);
  assert.equal(client.cleared.length, 1);
});

test('login admits admins and signs out non-admin or unverifiable profiles', async () => {
  const source = readFileSync(new URL('../src/app/actions.ts', import.meta.url), 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  for (const scenario of ['admin', 'customer', 'missing-profile', 'profile-error', 'invalid-password']) {
    let signedOut = false;
    const exports = {};
    const client = {
      auth: {
        signInWithPassword: async () => ({ data: { user: scenario === 'invalid-password' ? null : { id: 'user' } }, error: scenario === 'invalid-password' ? {} : null }),
        signOut: async () => { signedOut = true; return { error: null }; },
      },
      from: () => ({ select: () => ({ eq: () => ({ single: async () => ({
        data: scenario === 'missing-profile' ? null : { role: scenario === 'customer' ? 'customer' : 'admin' },
        error: scenario === 'profile-error' ? {} : null,
      }) }) }) }),
    };
    const imports = {
      'next/navigation': { redirect: (path) => { throw new Error(`redirect:${path}`); } },
      '../lib/supabase/server': { createSupabaseServerClient: async () => client },
    };
    vm.runInNewContext(output, { exports, require: (name) => { assert.ok(imports[name], name); return imports[name]; } });
    const form = new FormData();
    form.set('email', 'admin@example.test'); form.set('password', 'test-password');
    if (scenario === 'admin') {
      await assert.rejects(exports.handleLogin({}, form), /redirect:\/admin/);
      assert.equal(signedOut, false);
    } else {
      const result = await exports.handleLogin({}, form);
      assert.equal(result.error, scenario === 'invalid-password' ? 'E-posta adresi veya şifre hatalı.' : 'Bu giriş yalnızca yöneticiler içindir.');
      assert.equal(signedOut, scenario !== 'invalid-password');
    }
  }
});
