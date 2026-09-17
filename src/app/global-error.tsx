'use client';

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <html lang="tr"><body><main style={{ maxWidth: 600, margin: '80px auto', padding: 24 }}>
    <h1>Site şu anda yüklenemiyor.</h1><p>Lütfen kısa bir süre sonra tekrar deneyin.</p><button onClick={retry}>Tekrar dene</button>
  </main></body></html>;
}
