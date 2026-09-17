import { createSupabaseServerClient } from './supabase/server';
import type { CompanySettings } from './company-settings';

export async function getCompanySettings(): Promise<CompanySettings> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('company_settings').select('company_name,address,phone,email,whatsapp,hours,map_url').eq('id', true).single();
  if (error || !data) throw new Error('Firma bilgileri yüklenemedi.');
  return { companyName: data.company_name, address: data.address, phone: data.phone, email: data.email,
    whatsapp: data.whatsapp, hours: data.hours, mapUrl: data.map_url };
}
