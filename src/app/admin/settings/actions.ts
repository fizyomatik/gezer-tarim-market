'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '../../../lib/auth';
import { validateCompanySettings, type CompanySettings } from '../../../lib/company-settings';

export async function saveCompanySettings(settings: CompanySettings) {
  const { supabase } = await requireAdmin();
  if (!settings || !validateCompanySettings(settings)) return { error: 'Firma bilgilerini kontrol edin. Harita bağlantısı HTTPS olmalıdır.' };
  const { data, error } = await supabase.from('company_settings').update({
    company_name: settings.companyName.trim(), address: settings.address.trim(), phone: settings.phone.trim(),
    email: settings.email.trim(), whatsapp: settings.whatsapp.trim(), hours: settings.hours.trim(), map_url: settings.mapUrl.trim(),
    updated_at: new Date().toISOString(),
  }).eq('id', true).select('id').single();
  if (error || !data) return { error: 'Firma bilgileri kaydedilemedi.' };
  revalidatePath('/', 'layout');
  return { error: '' };
}
