'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCompanySettings } from '../../../components/CompanySettingsProvider';
import type { CompanySettings } from '../../../lib/company-settings';
import { saveCompanySettings } from './actions';

const fields: [keyof CompanySettings, string][] = [['companyName', 'Firma adı'], ['address', 'Adres'], ['phone', 'Telefon'],
  ['email', 'E-posta'], ['whatsapp', 'WhatsApp numarası (ülke kodu ile, boşluksuz)'], ['hours', 'Çalışma saatleri'], ['mapUrl', 'Harita bağlantısı']];

export default function AdminSettingsPage() {
  const { settings } = useCompanySettings();
  const [draft, setDraft] = useState(settings);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await saveCompanySettings(draft);
      setMessage(result.error || 'Firma bilgileri tüm ziyaretçiler için kaydedildi.');
      if (!result.error) router.refresh();
    } catch { setMessage('Firma bilgileri kaydedilemedi. Lütfen tekrar deneyin.'); }
    finally { setPending(false); }
  }

  return <div className="max-w-3xl space-y-8"><h1 className="text-3xl font-black text-[#174d32]">Firma bilgileri</h1>
    <form onSubmit={save} className="rounded-xl border bg-white p-6">
      <fieldset disabled={pending} className="grid gap-5 sm:grid-cols-2">
        {fields.map(([key, label]) => <label key={key}><span className="mb-1 block font-semibold">{label}</span>
          <input required value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
            type={key === 'email' ? 'email' : key === 'mapUrl' ? 'url' : 'text'}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5" />
        </label>)}
        <button className="rounded-lg bg-[#174d32] px-5 py-3 font-bold text-white">{pending ? 'Kaydediliyor…' : 'Bilgileri kaydet'}</button>
      </fieldset>
    </form>{message && <p role="status">{message}</p>}
  </div>;
}
