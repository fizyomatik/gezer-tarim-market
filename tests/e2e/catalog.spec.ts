import { expect, test, type Page } from '@playwright/test';

const configured = !!process.env.E2E_BASE_URL;
test.skip(!configured, 'Set E2E_BASE_URL to an app connected to a migrated, disposable Supabase project.');

test('public catalog, category filtering, old account URLs and admin protection', async ({ page }) => {
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'Ürünler', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Ürün, marka veya kategori ara' }).or(page.getByRole('searchbox', { name: 'Ürün, marka veya kategori ara' })).fill('no-matching-product-92847');
  await page.getByRole('button', { name: 'Filtrele' }).click();
  await expect(page).toHaveURL(/q=no-matching-product-92847/);
  await expect(page.getByText('Aramanızla eşleşen ürün bulunamadı.')).toBeVisible();
  for (const route of ['/register', '/account', '/admin/products', '/admin/categories', '/admin/slides', '/admin/settings']) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Yönetici girişi' })).toBeVisible();
  }
});

test('mobile navigation and shared contact links', async ({ page, isMobile }) => {
  await page.goto('/contact');
  await expect(page.getByRole('link', { name: 'Haritada aç' })).toHaveAttribute('href', /^https:\/\//);
  await expect(page.locator('main a[href^="tel:"]')).toBeVisible();
  await expect(page.locator('main a[href^="mailto:"]')).toBeVisible();
  await expect(page.locator('main a[href^="https://wa.me/"]')).toHaveAttribute('href', /\?text=/);
  if (isMobile) {
    await page.getByRole('button', { name: 'Menüyü aç' }).click();
    await page.getByRole('navigation', { name: 'Mobil menü' }).getByRole('link', { name: 'Ürünler', exact: true }).click();
    await expect(page).toHaveURL(/\/products$/);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-posta Adresi').fill(email!);
  await page.getByLabel('Şifre', { exact: true }).fill(password!);
  await page.getByRole('button', { name: 'Giriş Yap', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
async function removeNamed(page: Page, name: string) {
  const row = page.locator('article, .divide-y > div').filter({ has: page.getByText(name, { exact: true }) });
  if (await row.count()) {
    page.once('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: 'Sil', exact: true }).click();
    await expect(row).toHaveCount(0);
  }
}

test('admin changes reach anonymous visitors; media, inquiries and category restrictions work', async ({ page, browser, baseURL }) => {
  test.skip(!email || !password, 'Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD for a disposable project.');
  test.setTimeout(180_000);
  const marker = `Test ${Date.now()}`;
  const product = `${marker} ürün`;
  const category = `${marker} kategori`;
  const slide = `${marker} slayt`;
  const visitor = await browser.newContext({ baseURL });
  const publicPage = await visitor.newPage();
  await login(page);
  try {
    await page.goto('/admin/categories');
    await page.getByLabel('Kategori adı').fill(category);
    await page.getByRole('button', { name: 'Kategori ekle', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Kategori kaydedildi.');
    await page.goto('/admin/products');
    await page.getByLabel('Ürün adı').fill(product);
    await page.getByLabel('Kategori', { exact: true }).selectOption({ label: category });
    await page.getByLabel('Görsel ekle', { exact: false }).setInputFiles([{ name: 'first.png', mimeType: 'image/png', buffer: png }, { name: 'second.png', mimeType: 'image/png', buffer: png }]);
    await page.getByRole('button', { name: 'Ürün ekle', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Ürün kaydedildi.');
    await publicPage.goto('/products');
    await publicPage.getByLabel('Kategori', { exact: true }).selectOption({ label: category });
    await publicPage.getByRole('button', { name: 'Filtrele' }).click();
    const card = publicPage.locator('article').filter({ hasText: product });
    await expect(card).toContainText('Fiyat için iletişime geçin');
    await card.getByRole('button', { name: `${product} listeye ekle` }).click();
    await publicPage.goto('/cart');
    await expect(publicPage.locator('main')).toContainText(product);
    await expect(publicPage.locator('main')).not.toContainText('Tahmini toplam');
    await publicPage.reload();
    await expect(publicPage.locator('main')).toContainText(product);
    await expect(publicPage.locator('main a[href^="https://wa.me/"]')).toHaveAttribute('href', /products/);
    await publicPage.goto('/products');
    await publicPage.getByRole('link', { name: product, exact: true }).click();
    await expect(publicPage.getByRole('button', { name: '2. görseli göster' })).toBeVisible();
    await publicPage.getByRole('button', { name: '2. görseli göster' }).click();
    await expect(publicPage.getByRole('button', { name: '2. görseli göster' })).toHaveAttribute('aria-pressed', 'true');
    const productUrl = publicPage.url();
    await page.locator('.divide-y > div').filter({ hasText: product }).getByRole('button', { name: 'Düzenle' }).click();
    await page.getByRole('button', { name: '2. görseli önceye taşı' }).click();
    await page.getByRole('button', { name: 'Kaldır', exact: true }).last().click();
    await page.getByLabel('Fiyat (₺, isteğe bağlı)').fill('0');
    await page.getByRole('button', { name: 'Ürünü güncelle', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Ürün kaydedildi.');
    await publicPage.goto(productUrl);
    await expect(publicPage.getByRole('button', { name: '2. görseli göster' })).toHaveCount(0);
    await page.goto('/admin/categories');
    let row = page.locator('article').filter({ hasText: category });
    page.once('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: 'Sil', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Bu kategoride ürünler var');
    await row.getByRole('button', { name: 'Düzenle' }).click();
    await page.getByLabel('Yayında', { exact: false }).uncheck();
    await page.getByRole('button', { name: 'Kategori güncelle', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Kategori kaydedildi.');
    await publicPage.goto(productUrl);
    await expect(publicPage.getByRole('heading', { name: product, exact: true })).toHaveCount(0);
    await page.goto('/admin/slides');
    await page.getByLabel('Başlık', { exact: true }).fill(slide);
    await page.getByLabel('Görsel', { exact: false }).setInputFiles({ name: 'slide.png', mimeType: 'image/png', buffer: png });
    await page.getByRole('button', { name: 'Slayt ekle', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Slayt kaydedildi.');
    row = page.locator('article').filter({ hasText: slide });
    await row.getByRole('button', { name: 'Düzenle' }).click();
    await page.getByLabel('Açıklama', { exact: true }).fill('Edited without a new image');
    await page.getByRole('button', { name: 'Slayt güncelle', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Slayt kaydedildi.');
  } finally {
    await visitor.close();
    await page.goto('/admin/slides'); await removeNamed(page, slide);
    await page.goto('/admin/products'); await removeNamed(page, product);
    await page.goto('/admin/categories'); await removeNamed(page, category);
  }
});
