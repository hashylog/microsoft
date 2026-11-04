"use client";

import { gsap } from "@/lib/gsap";
import { RevealText } from "@/components/RevealText";

/** Tinta escura para as cenas claras (lilás) do vídeo. */
const INK = "#1E1B3F";

/** Divide em letras animáveis (`.ch`), mantendo os espaços. */
function Chars({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {[...text].map((c, i) => (
        <span key={i} aria-hidden className="ch inline-block will-change-transform">
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}

const CHIPS = ["Pessoas", "conectadas", "em qualquer lugar"];

/**
 * Legendas que acompanham o vídeo do Hero. Cada uma aparece num trecho do
 * filme (em segundos de vídeo) e tem uma animação ligada ao que está em cena.
 */
export function HeroCaptions() {
  return (
    <div className="hero-captions pointer-events-none absolute inset-0 will-change-transform">
      {/* 1–8 s: dunas lilás */}
      <div className="cap-imagine absolute bottom-[16svh] left-4 md:left-[6vw]" style={{ color: INK }}>
        <p className="cap-imagine-word text-[clamp(4rem,14vw,12.5rem)] leading-[0.85] font-[750] tracking-[-0.05em]">
          <Chars text="Imagine" />
        </p>
        <RevealText
          as="p"
          className="cap-imagine-sub mt-5 max-w-[26ch] text-[clamp(1.05rem,1.8vw,1.5rem)] leading-snug font-medium"
          text="um lugar onde a tecnologia se molda a você."
        />
      </div>

      {/* 10–14 s: escultura de cristal */}
      <p
        className="cap-flow absolute top-[18svh] left-4 text-[clamp(2.4rem,6.5vw,6rem)] leading-none font-[700] tracking-[-0.045em] md:left-[6vw]"
        style={{ color: INK }}
      >
        <Chars text="Tecnologia que flui." />
      </p>

      {/* 16–24 s: sala calma */}
      <div
        className="cap-focus absolute right-4 bottom-[18svh] text-right text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.95] font-[750] tracking-[-0.045em] md:right-[7vw]"
        style={{ color: INK }}
      >
        <RevealText as="p" className="cap-focus-a" text="Menos ruído." />
        <RevealText as="p" className="cap-focus-b" text="Mais foco." />
      </div>

      {/* 39–51 s: mãos e mensagens flutuando */}
      <div className="cap-chips absolute inset-x-4 top-[20svh] flex flex-wrap items-center justify-center gap-3 md:gap-4">
        {CHIPS.map((word) => (
          <span key={word} className="cap-chip inline-block">
            <span
              className="cap-chip-float inline-block rounded-full border border-white/70 bg-white/45 px-5 py-2.5 text-[clamp(1.3rem,3.2vw,2.6rem)] font-semibold tracking-[-0.02em] shadow-[0_12px_40px_rgba(30,27,63,0.18)] backdrop-blur-md md:px-7 md:py-3"
              style={{ color: INK }}
            >
              {word}
            </span>
          </span>
        ))}
      </div>

      {/* 52–55 s: fundo escuro com rabiscos */}
      <p className="cap-create absolute top-1/2 left-4 -translate-y-1/2 text-[clamp(3rem,9vw,8.5rem)] leading-none font-[800] tracking-[-0.05em] md:left-[6vw]">
        <span className="cap-create-stroke block text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.9)]">
          <Chars text="Crie sem limites." />
        </span>
        <span className="cap-create-fill absolute inset-0 block text-white" aria-hidden>
          Crie sem limites.
        </span>
      </p>

      {/* 69–77 s: prismas de cristal */}
      <p
        className="cap-prism absolute inset-x-4 top-[14svh] text-center text-[clamp(2.4rem,7vw,6.5rem)] leading-none font-[750] tracking-[-0.045em]"
        aria-label="Do software ao hardware."
      >
        <span className="cap-prism-r absolute inset-0 text-[#FF3B5C] mix-blend-screen" aria-hidden>
          Do software ao hardware.
        </span>
        <span className="cap-prism-c absolute inset-0 text-[#2DE2FF] mix-blend-screen" aria-hidden>
          Do software ao hardware.
        </span>
        <span className="cap-prism-w relative text-white" aria-hidden>
          Do software ao hardware.
        </span>
      </p>

      {/* 86 s → fim: logo sobre preto */}
      <p className="cap-since absolute inset-x-0 top-[calc(50%+3.2rem)] text-center font-mono text-xs tracking-[0.5em] text-white/70 uppercase md:text-sm">
        <Chars text="Desde 1975" />
      </p>
    </div>
  );
}

type Opts = {
  /** Converte segundos do vídeo em posição na timeline da cena. */
  at: (seconds: number) => number;
  /** Converte uma duração em segundos de vídeo em duração na timeline. */
  span: (seconds: number) => number;
  reduce: boolean;
};

/** Monta as animações das legendas na timeline fixada do Hero (controlada pelo scroll). */
export function animateCaptions(tl: gsap.core.Timeline, root: HTMLElement, { at, span, reduce }: Opts) {
  const q = gsap.utils.selector(root);
  const m = reduce ? 0 : 1; // zera deslocamentos com "reduzir movimento"
  const blur = (px: number) => `blur(${px * m}px)`;
  const hidden = { autoAlpha: 0 };
  const shown = { autoAlpha: 1, duration: span(0.6) };

  // 1. Imagine: letras saem do desfoque e o espaçamento se fecha.
  tl.fromTo(
    q(".cap-imagine-word"),
    { letterSpacing: m ? "0.35em" : "-0.05em" },
    { letterSpacing: "-0.05em", duration: span(3), ease: "power3.out" },
    at(1),
  )
    .fromTo(
      q(".cap-imagine-word .ch"),
      { ...hidden, filter: blur(24), yPercent: 20 * m },
      { autoAlpha: 1, filter: blur(0), yPercent: 0, duration: span(2), stagger: span(0.18), ease: "power2.out" },
      at(1),
    )
    .fromTo(
      q(".cap-imagine-sub .rw"),
      { yPercent: 110 },
      { yPercent: 0, duration: span(1.2), stagger: span(0.12), ease: "power3.out" },
      at(3.4),
    )
    .to(q(".cap-imagine"), { autoAlpha: 0, filter: blur(14), y: -40 * m, duration: span(1.2), ease: "power2.in" }, at(7.2));

  // 2. Tecnologia que flui: letras entram em onda e saem pelo alto.
  tl.fromTo(
    q(".cap-flow .ch"),
    { ...hidden, yPercent: 110 * m, rotate: 14 * m },
    { autoAlpha: 1, yPercent: 0, rotate: 0, duration: span(1), stagger: { each: span(0.05), ease: "sine.inOut" }, ease: "back.out(1.6)" },
    at(9.9),
  ).to(
    q(".cap-flow .ch"),
    { autoAlpha: 0, yPercent: -90 * m, rotate: -10 * m, duration: span(0.8), stagger: span(0.03), ease: "power2.in" },
    at(13),
  );

  // 3. Menos ruído / Mais foco: a primeira linha "apaga" quando a segunda chega.
  tl.fromTo(q(".cap-focus-a .rw"), { yPercent: 110 }, { yPercent: 0, duration: span(1), stagger: span(0.15), ease: "power3.out" }, at(16.4))
    .to(q(".cap-focus-a"), { opacity: 0.22, filter: blur(5), duration: span(1.2) }, at(19.4))
    .fromTo(
      q(".cap-focus-b .rw"),
      { yPercent: 110, scale: 1 + 0.15 * m },
      { yPercent: 0, scale: 1, duration: span(1.1), stagger: span(0.15), ease: "power3.out" },
      at(19.6),
    )
    .to(q(".cap-focus"), { autoAlpha: 0, y: -30 * m, duration: span(1), ease: "power2.in" }, at(23.3));

  // 4. Balões de vidro: voam de pontos espalhados, flutuam e se espalham de novo.
  const chips = q<HTMLElement>(".cap-chip");
  const scatter = (i: number, k: number) => ({
    x: m * k * [-34, 30, -18][i] * (window.innerWidth / 100),
    y: m * k * [26, -22, 30][i] * (window.innerHeight / 100),
    rotate: m * k * [-18, 14, -9][i],
  });
  chips.forEach((chip, i) => {
    tl.fromTo(
      chip,
      { ...hidden, ...scatter(i, 1), scale: 0.6 },
      { autoAlpha: 1, x: 0, y: 0, rotate: 0, scale: 1, duration: span(2.2), ease: "expo.out" },
      at(39.6 + i * 1.1),
    ).to(chip, { autoAlpha: 0, ...scatter(i, -1.3), scale: 0.8, duration: span(1.6), ease: "power2.in" }, at(49 + i * 0.35));
  });

  // 5. Crie sem limites: o contorno aparece e o preenchimento passa por cima.
  tl.fromTo(
    q(".cap-create-stroke .ch"),
    { ...hidden, scale: 1 + 0.5 * m, filter: blur(10) },
    { autoAlpha: 1, scale: 1, filter: blur(0), duration: span(0.7), stagger: span(0.035), ease: "power3.out" },
    at(52.6),
  )
    .fromTo(q(".cap-create-fill"), { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: span(1.3), ease: "power2.inOut" }, at(53.4))
    .to(q(".cap-create"), { autoAlpha: 0, filter: blur(10), duration: span(0.5), ease: "power2.in" }, at(54.9));

  // 6. Do software ao hardware: cores separadas como num prisma e depois alinhadas.
  const split = 0.06 * window.innerWidth * m;
  tl.fromTo(q(".cap-prism"), hidden, { ...shown, duration: span(0.8) }, at(69.3))
    .fromTo(q(".cap-prism-r"), { x: -split, filter: blur(6) }, { x: 0, filter: blur(0), duration: span(2.4), ease: "power3.out" }, at(69.3))
    .fromTo(q(".cap-prism-c"), { x: split, filter: blur(6) }, { x: 0, filter: blur(0), duration: span(2.4), ease: "power3.out" }, at(69.3))
    .fromTo(q(".cap-prism-w"), { opacity: 0 }, { opacity: 1, duration: span(1.4) }, at(70.6))
    .to(q(".cap-prism-r"), { x: split * 0.6, duration: span(1.2), ease: "power2.in" }, at(76))
    .to(q(".cap-prism-c"), { x: -split * 0.6, duration: span(1.2), ease: "power2.in" }, at(76))
    .to(q(".cap-prism"), { autoAlpha: 0, filter: blur(8), duration: span(1.2), ease: "power2.in" }, at(76.2));

  // 7. Desde 1975, letra a letra abaixo do logo.
  tl.fromTo(
    q(".cap-since .ch"),
    { ...hidden, y: 10 * m },
    { autoAlpha: 1, y: 0, duration: span(0.8), stagger: span(0.12), ease: "power2.out" },
    at(86),
  );
}

/** Balões flutuando sozinhos, mesmo com o scroll parado. Devolve os tweens. */
export function floatChips(root: HTMLElement) {
  const q = gsap.utils.selector(root);
  return q<HTMLElement>(".cap-chip-float").map((el, i) =>
    gsap.to(el, {
      y: [-10, 8, -6][i],
      rotate: [1.5, -1.2, 1][i],
      duration: 2.6 + i * 0.7,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    }),
  );
}
