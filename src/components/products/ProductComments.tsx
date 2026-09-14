"use client";

import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";

type Comment = { name: string; text: string; date: string };

export default function ProductComments({ productId }: { productId: string }) {
  const storageKey = `gezer-comments-${productId}`;
  const [comments, setComments] = useState<Comment[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !text.trim()) return;
    const next = [{ name: name.trim(), text: text.trim(), date: new Date().toLocaleDateString("tr-TR") }, ...comments];
    setComments(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    setName("");
    setText("");
  };

  return <section className="mx-auto mt-16 max-w-6xl border-t border-gray-200 px-5 pt-12 lg:px-8"><div className="flex items-center gap-3"><MessageSquare className="text-[#174d32]" /><h2 className="text-2xl font-black text-[#174d32]">Müşteri yorumları</h2></div><form onSubmit={submit} className="mt-6 grid gap-3 rounded-2xl bg-white p-5 md:grid-cols-[180px_1fr_auto]"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Adınız" aria-label="Adınız" className="rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-[#174d32]" /><input value={text} onChange={(event) => setText(event.target.value)} placeholder="Bu ürün hakkında yorumunuz..." aria-label="Yorumunuz" className="rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-[#174d32]" /><button title="Yorumu gönder" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#174d32] px-5 py-3 font-bold text-white hover:bg-[#123d27]"><Send size={16} /> Gönder</button></form><div className="mt-6 space-y-3">{comments.length === 0 ? <p className="text-sm text-gray-500">Henüz yorum yok. İlk yorumu siz yazın.</p> : comments.map((comment, index) => <article key={`${comment.date}-${index}`} className="rounded-xl border border-gray-200 bg-white p-5"><div className="flex justify-between gap-4"><strong className="text-[#174d32]">{comment.name}</strong><time className="text-xs text-gray-400">{comment.date}</time></div><p className="mt-2 text-gray-600">{comment.text}</p></article>)}</div></section>;
}