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
  address: "Adıyaman, Türkiye",
  phone: "+90 545 490 49 28",
  email: "info@gezertarim.com",
  whatsapp: "+90 5454904928",
  hours: "Pazartesi - Cumartesi / 08:00 - 19:00",
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
