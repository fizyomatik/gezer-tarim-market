import { PGlite } from '@electric-sql/pglite';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export async function createTestDatabase() {
  // In-memory PostgreSQL only. No environment variables or remote credentials.
  const db = new PGlite();
  const bootstrap = await readFile(new URL('../supabase/tests/bootstrap.sql', import.meta.url), 'utf8');
  await db.exec(bootstrap.replace(/^\\.*$/gm, '').replace("current_database() <> 'gezer_review_test'", "current_database() <> 'postgres'"));
  const directory = new URL('../supabase/migrations/', import.meta.url);
  for (const file of (await readdir(directory)).filter((name) => name.endsWith('.sql')).sort()) {
    const sql = await readFile(new URL(file, directory), 'utf8');
    // gen_random_uuid is built into PostgreSQL; the pgcrypto extension is not
    // included in this WASM runtime and no migration uses its other functions.
    await db.exec(sql.replace('create extension if not exists "pgcrypto";', ''));
  }
  return db;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = await createTestDatabase();
  try {
    for (const file of ['security.sql', 'catalog.sql']) {
      const sql = await readFile(new URL(`../supabase/tests/${file}`, import.meta.url), 'utf8');
      await db.exec(sql.replace(/^\\.*$/gm, ''));
      console.log(`${file}: passed`);
    }
  } finally { await db.close(); }
}
