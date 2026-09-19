import type { Database } from './database.types';
import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from './config';

export function createSupabaseBrowserClient() {
  const { url, key } = getSupabaseConfig();
  return createBrowserClient<Database>(url, key);
}