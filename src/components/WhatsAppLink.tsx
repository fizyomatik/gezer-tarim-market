"use client";

import { useCompanySettings } from "./CompanySettingsProvider";

export default function WhatsAppLink({ message, children, className, title }: { message: string; children: React.ReactNode; className?: string; title?: string }) {
  const { settings } = useCompanySettings();
  return <a title={title} href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className={className}>{children}</a>;
}
