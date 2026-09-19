'use client';
import { useActionState } from 'react';
import { retryCleanup } from '../app/admin/media-actions';
export default function CleanupButton() {
  const [state, action, pending] = useActionState(retryCleanup, { message: '' });
  return <form action={action}><button disabled={pending} className="rounded border px-4 py-2">{pending ? 'Temizleniyor…' : 'Bekleyen görselleri temizle'}</button>{state.message && <p role="status" className="mt-2">{state.message}</p>}</form>;
}
