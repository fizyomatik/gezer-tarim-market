export type CompanySettings = {
  companyName: string; address: string; phone: string; email: string;
  whatsapp: string; hours: string; mapUrl: string;
};

export function validateCompanySettings(settings: CompanySettings) {
  const limits: Record<keyof CompanySettings, number> = { companyName: 120, address: 500, phone: 30, email: 254, whatsapp: 16, hours: 200, mapUrl: 2048 };
  if (Object.entries(limits).some(([key, max]) => {
    const value = settings[key as keyof CompanySettings];
    return typeof value !== 'string' || !value.trim() || value.length > max;
  })) return false;
  try {
    const url = new URL(settings.mapUrl);
    return url.protocol === 'https:' && !url.username && !url.password &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email) && /^\+?[0-9]{7,15}$/.test(settings.whatsapp) && settings.phone.length >= 7;
  } catch { return false; }
}
