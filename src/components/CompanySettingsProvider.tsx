"use client";

import { createContext, useContext, useState } from "react";

export type CompanySettings = {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  hours: string;
  mapUrl: string;
};

export const defaultCompanySettings: CompanySettings = {
  companyName: "Gezer Tarım Market",
  address: "Konya, Türkiye",
  phone: "0555 555 55 55",
  email: "info@gezertarim.com",
  whatsapp: "905555555555",
  hours: "Pazartesi - Cumartesi / 08:00 - 18:00",
  mapUrl: "https://maps.google.com",
};

const CompanySettingsContext = createContext<{
  settings: CompanySettings;
  saveSettings: (settings: CompanySettings) => void;
} | null>(null);

export function CompanySettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<CompanySettings>(() => {
    if (typeof window === "undefined") return defaultCompanySettings;
    const saved = window.localStorage.getItem("gezer-company-settings");
    return saved ? { ...defaultCompanySettings, ...JSON.parse(saved) } : defaultCompanySettings;
  });

  const saveSettings = (nextSettings: CompanySettings) => {
    setSettings(nextSettings);
    window.localStorage.setItem("gezer-company-settings", JSON.stringify(nextSettings));
  };

  return <CompanySettingsContext.Provider value={{ settings, saveSettings }}>{children}</CompanySettingsContext.Provider>;
}

export function useCompanySettings() {
  const context = useContext(CompanySettingsContext);
  if (!context) throw new Error("useCompanySettings must be used inside CompanySettingsProvider");
  return context;
}
