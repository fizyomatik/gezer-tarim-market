import { cache } from 'react';
import { createSupabaseServerClient } from './supabase/server';
import type { CompanySettings } from './company-settings';

export const getCompanySettings = cache(async (): Promise<CompanySettings> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('company_settings').select('company_name,address,phone,email,whatsapp,hours,map_url').eq('id', true).single();
  if (error) {
    console.error('Company settings query failed:', error);
    if (error.code === 'PGRST205' || error.code === '42P01') {
      throw new Error('Firma bilgileri tablosu bulunamadı. Supabase veritabanına 20260916000000_security_and_reliability.sql migration dosyasını uygulayın.');
    }
    throw new Error('Firma bilgileri yüklenemedi.', { cause: error });
  }
  if (!data) throw new Error('Firma bilgileri kaydı bulunamadı.');
  return { companyName: data.company_name, address: data.address, phone: data.phone, email: data.email,
    whatsapp: data.whatsapp, hours: data.hours, mapUrl: data.map_url };
});
