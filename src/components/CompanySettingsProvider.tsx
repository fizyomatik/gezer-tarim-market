'use client';

import { createContext, useContext } from 'react';
import type { CompanySettings } from '../lib/company-settings';

const CompanySettingsContext = createContext<{ settings: CompanySettings } | null>(null);
export function CompanySettingsProvider({ children, settings }: { children: React.ReactNode; settings: CompanySettings }) {
  return <CompanySettingsContext.Provider value={{ settings }}>{children}</CompanySettingsContext.Provider>;
}
export function useCompanySettings() {
  const context = useContext(CompanySettingsContext);
  if (!context) throw new Error('CompanySettingsProvider is required');
  return context;
} 
