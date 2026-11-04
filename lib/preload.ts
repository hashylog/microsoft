"use client";

/**
 * Baixa um vídeo inteiro para a memória (Blob) e devolve uma URL local.
 * Com o arquivo completo na memória, o scrub pelo scroll não depende da rede:
 * cada busca de frame é decodificada direto, sem esperar download.
 *
 * Chamadas repetidas com o mesmo `src` reaproveitam o mesmo download.
 * Se algo falhar, devolve o próprio `src` (o vídeo carrega pela rede, como antes).
 */
type Entry = { loaded: number; total: number; done: boolean; promise: Promise<string> };

const entries = new Map<string, Entry>();

export function preload(src: string): Promise<string> {
  const existing = entries.get(src);
  if (existing) return existing.promise;

  const entry: Entry = { loaded: 0, total: 0, done: false, promise: Promise.resolve(src) };
  entry.promise = (async () => {
    try {
      const res = await fetch(src);
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      entry.total = Number(res.headers.get("content-length")) || 0;
      const reader = res.body.getReader();
      const chunks: BlobPart[] = [];
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        entry.loaded += value.byteLength;
      }
      return URL.createObjectURL(new Blob(chunks, { type: res.headers.get("content-type") || "video/mp4" }));
    } catch {
      return src;
    } finally {
      entry.done = true;
    }
  })();
  entries.set(src, entry);
  return entry.promise;
}

/** Progresso 0–1 de um download iniciado com `preload`. */
export function preloadProgress(src: string) {
  const e = entries.get(src);
  if (!e) return 0;
  if (e.done) return 1;
  return e.total ? Math.min(1, e.loaded / e.total) : 0;
}
