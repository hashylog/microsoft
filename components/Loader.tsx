"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getLenis } from "@/lib/scroll";
import { markLoaded } from "@/lib/loader";
import { preload, preloadProgress } from "@/lib/preload";
import { MEDIA } from "@/lib/media";

/** Tempo mínimo da contagem 0 → 100, mesmo com tudo já em cache. */
const MIN_MS = 2400;

// Mesma ordem e posição dos quadrados do Hero: ao sair, o loader se funde com ele.
const SQUARES = [
  { color: "var(--ms-red)", col: 0, row: 0 },
  { color: "var(--ms-green)", col: 1, row: 0 },
  { color: "var(--ms-blue)", col: 0, row: 1 },
  { color: "var(--ms-yellow)", col: 1, row: 1 },
];

const HERO_SRC = MEDIA.HERO_VIDEO.source.src;

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * Tela de carregamento. Aparece em toda visita, volta a página ao topo e trava
 * o scroll. A porcentagem segue o download real do vídeo do Hero (inteiro, para
 * a memória) e das fontes, mas nunca anda mais rápido que uma curva suave de
 * MIN_MS: com tudo em cache, a contagem ainda vai de 0 a 100 sem saltos.
 */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    const fills = q<HTMLElement>(".ld-fill");
    const count = q(".ld-count")[0] as HTMLElement;
    const bar = q(".ld-bar")[0] as HTMLElement;

    // Sempre começa do início, com o scroll travado.
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const lenis = getLenis();
    lenis?.scrollTo(0, { immediate: true, force: true });
    lenis?.stop();
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    preload(HERO_SRC);
    let fontsReady = false;
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      fontsReady = true;
    });

    const start = performance.now();
    let shown = 0;
    let raf = 0;
    let exit: gsap.core.Timeline | null = null;

    const render = (p: number) => {
      const pct = Math.round(p * 100);
      count.textContent = String(pct).padStart(3, "0");
      el.setAttribute("aria-valuenow", String(pct));
      bar.style.transform = `scaleX(${p})`;
      fills.forEach((f, i) => {
        f.style.transform = `scale(${Math.min(1, Math.max(0, p * 4 - i))})`;
      });
    };

    const finish = () => {
      exit = gsap
        .timeline({
          onComplete: () => {
            html.style.overflow = prevOverflow;
            getLenis()?.start();
            ScrollTrigger.refresh();
            setGone(true);
          },
        })
        .to(q(".ld-meta"), { autoAlpha: 0, y: -8, duration: 0.45, ease: "power2.in" }, 0.25)
        .add(markLoaded, 0.55)
        .to(el, { autoAlpha: 0, duration: 0.9, ease: "power2.inOut" }, 0.55);
    };

    const tick = () => {
      const real = preloadProgress(HERO_SRC) * 0.95 + (fontsReady ? 0.05 : 0);
      const pace = easeInOut(Math.min(1, (performance.now() - start) / MIN_MS));
      const target = Math.min(real, pace);
      shown += (target - shown) * 0.14;
      if (target >= 1 && shown > 0.998) shown = 1;
      render(shown);
      if (shown >= 1) finish();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      exit?.kill();
      html.style.overflow = prevOverflow;
      getLenis()?.start();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={root}
      className="hero-stage fixed inset-0 z-[100] bg-black text-[#EEF2F5]"
      role="progressbar"
      aria-label="Carregando"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {SQUARES.map((sq, i) => (
        <div
          key={i}
          aria-hidden
          className="absolute outline outline-1 -outline-offset-1 outline-white/15"
          style={{
            width: "var(--s)",
            height: "var(--s)",
            left: sq.col ? "calc(50% + var(--g) / 2)" : "calc(50% - var(--g) / 2 - var(--s))",
            top: sq.row ? "calc(38% + var(--g) / 2)" : "calc(38% - var(--g) / 2 - var(--s))",
          }}
        >
          <span className="ld-fill block h-full w-full scale-0" style={{ background: sq.color }} />
        </div>
      ))}

      <div className="ld-meta absolute inset-x-0 top-[38%] flex translate-y-[calc(var(--s)+var(--g)+2.5rem)] flex-col items-center gap-3">
        <span className="ld-count font-mono text-sm tracking-[0.3em] tabular-nums">000</span>
        <span className="font-mono text-[10px] tracking-[0.45em] text-white/45 uppercase">Carregando</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" aria-hidden>
        <span className="ld-bar block h-full w-full origin-left scale-x-0 bg-white/70" />
      </div>
    </div>
  );
}
