"use client";

import { useState } from "react";
import { defaultCompanySettings, useCompanySettings } from "../../../components/CompanySettingsProvider";

export default function AdminSettingsPage() {
  const { settings, saveSettings } = useCompanySettings();
  const [saved, setSaved] = useState(false);

  const update = (key: keyof typeof defaultCompanySettings, value: string) => saveSettings({ ...settings, [key]: value });
  const save = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveSettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return <div className="max-w-3xl space-y-8"><div><p className="text-sm font-bold uppercase tracking-[0.15em] text-[#a5c63b]">Site ayarları</p><h1 className="mt-2 text-3xl font-black text-[#174d32]">Firma bilgileri</h1><p className="mt-2 text-sm text-gray-500">Kaydettiğiniz bilgiler bu tarayıcıdaki footer ve WhatsApp bağlantılarına hemen uygulanır.</p></div><form onSubmit={save} className="grid gap-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm sm:grid-cols-2">{([ ["companyName", "Firma adı"], ["address", "Adres"], ["phone", "Telefon"], ["email", "E-posta"], ["whatsapp", "WhatsApp numarası (ülke kodu ile)"], ["hours", "Çalışma saatleri"], ["mapUrl", "Harita bağlantısı"] ] as const).map(([key, label]) => <label key={key} className={key === "mapUrl" ? "sm:col-span-2" : ""}><span className="mb-1 block text-sm font-semibold text-gray-700">{label}</span><input value={settings[key]} onChange={(event) => update(key, event.target.value)} type={key === "email" ? "email" : "text"} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 outline-none focus:border-[#174d32]" /></label>)}<div className="flex items-center gap-4 sm:col-span-2"><button type="submit" className="rounded-lg bg-[#174d32] px-5 py-3 font-bold text-white hover:bg-[#123d27]">Bilgileri kaydet</button>{saved && <span className="text-sm font-semibold text-green-700">Kaydedildi</span>}</div></form></div>;
}
