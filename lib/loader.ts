"use client";

/** Sinal de "tela de carregamento terminou", para as cenas iniciarem suas animações. */
let loaded = false;
const listeners = new Set<() => void>();

/** Chama `cb` quando o carregamento terminar (ou na hora, se já terminou). Devolve o cancelamento. */
export function whenLoaded(cb: () => void) {
  if (loaded) {
    cb();
    return () => {};
  }
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function markLoaded() {
  loaded = true;
  listeners.forEach((cb) => cb());
  listeners.clear();
}
