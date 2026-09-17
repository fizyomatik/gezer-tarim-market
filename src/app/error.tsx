'use client';

export default function ErrorPage({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <main className="mx-auto max-w-xl px-5 py-24 text-center" role="alert">
    <h1 className="text-2xl font-bold">Bilgiler şu anda yüklenemiyor.</h1>
    <p className="my-5">Lütfen kısa bir süre sonra tekrar deneyin.</p>
    <button onClick={retry} className="rounded-lg bg-[#174d32] px-5 py-3 text-white">Tekrar dene</button>
  </main>;
}
