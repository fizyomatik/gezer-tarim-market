"use client";

import { useCompanySettings } from "./CompanySettingsProvider";

export default function WhatsAppLink({ message, children, className, title }: { message: string; children: React.ReactNode; className?: string; title?: string }) {
  const { settings } = useCompanySettings();
  return <a title={title} href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`} onClick={(event) => {
    const absoluteMessage = message.replace(/(^|\s)\/products\/([^\s]+)/g, `$1${window.location.origin}/products/$2`);
    event.currentTarget.href = `https://wa.me/${settings.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(absoluteMessage)}`;
  }} target="_blank" rel="noreferrer" className={className}>{children}</a>;
}
