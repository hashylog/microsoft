"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { ScrollMedia, type MediaHandle } from "@/components/ScrollMedia";
import { RevealText } from "@/components/RevealText";

// Duração do scroll, em alturas de tela.
const INTRO_SCREENS = 1.6; // logo se abre e o vídeo entra
const VIDEO_SCREENS = 20; // percorre o vídeo inteiro (90 s ≈ 4,5 s de vídeo por tela)
const END_HOLD_SCREENS = 0.6; // pausa no frame final (logo sobre preto)

// Trecho do progresso da cena em que o vídeo vai do primeiro ao último frame.
const VIDEO_TOTAL = INTRO_SCREENS + VIDEO_SCREENS + END_HOLD_SCREENS;
const VIDEO_RANGE: [number, number] = [INTRO_SCREENS / VIDEO_TOTAL, (INTRO_SCREENS + VIDEO_SCREENS) / VIDEO_TOTAL];

const QUADS = [
  { color: "var(--ms-red)", col: 0, row: 0 },
  { color: "var(--ms-green)", col: 1, row: 0 },
  { color: "var(--ms-blue)", col: 0, row: 1 },
  { color: "var(--ms-yellow)", col: 1, row: 1 },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<MediaHandle>(null);

  useScene(root, ({ reduce }) => {
    const q = gsap.utils.selector(root);
    const stage = q(".hero-stage")[0] as HTMLElement;
    const quads = q<HTMLElement>(".hero-quad");

    // Abertura: o único movimento que não depende do scroll.
    const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
    intro
      .from(q(".hero-quad-fill"), { scale: 0, duration: 1.1, stagger: 0.08 })
      .from(q(".hero-title .rw"), { yPercent: 110, duration: 1.2, stagger: 0.06 }, 0.25)
      .from(q(".hero-sub"), { autoAlpha: 0, y: reduce ? 0 : 12, duration: 1 }, 0.7);
    if (reduce) intro.progress(1);

    // Cada quadrado do logo cresce até ocupar um quarto da tela.
    const toQuadrant = (i: number) => {
      const el = quads[i];
      const W = stage.clientWidth / 2;
      const H = stage.clientHeight / 2;
      return {
        x: QUADS[i].col * W - el.offsetLeft,
        y: QUADS[i].row * H - el.offsetTop,
        scaleX: W / el.offsetWidth,
        scaleY: H / el.offsetHeight,
      };
    };

    // Cada unidade da timeline equivale a uma altura de tela de scroll.
    const total = INTRO_SCREENS + VIDEO_SCREENS + END_HOLD_SCREENS;
    const tl = pinTimeline(root.current!, stage, total, (p) => media.current?.setProgress(p));
    tl.to(q(".hero-title"), { yPercent: reduce ? 0 : -40, autoAlpha: 0, duration: 0.4 }, 0)
      .fromTo(q(".hero-sub"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25, immediateRender: false }, 0)
      .to(
        quads,
        {
          x: (i) => toQuadrant(i).x,
          y: (i) => toQuadrant(i).y,
          scaleX: (i) => toQuadrant(i).scaleX,
          scaleY: (i) => toQuadrant(i).scaleY,
          duration: INTRO_SCREENS * 0.7,
          ease: "power3.inOut",
          stagger: 0.05,
        },
        0.1,
      )
      .fromTo(
        q(".hero-media"),
        { autoAlpha: 0, scale: reduce ? 1 : 1.08 },
        { autoAlpha: 1, scale: 1, duration: INTRO_SCREENS * 0.25, ease: "power2.out" },
        INTRO_SCREENS * 0.75,
      );
    holdUntil(tl, total);
  });

  return (
    <section ref={root} id="inicio" aria-label="Início">
      <div className="hero-stage relative h-svh overflow-hidden bg-black text-[#EEF2F5]">
        {QUADS.map((quad, i) => (
          <div
            key={i}
            aria-hidden
            className="hero-quad absolute origin-top-left will-change-transform"
            style={{
              width: "var(--s)",
              height: "var(--s)",
              left: quad.col ? "calc(50% + var(--g) / 2)" : "calc(50% - var(--g) / 2 - var(--s))",
              top: quad.row ? "calc(38% + var(--g) / 2)" : "calc(38% - var(--g) / 2 - var(--s))",
            }}
          >
            <span className="hero-quad-fill block h-full w-full" style={{ background: quad.color }} />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-x-0 top-[38%] flex translate-y-[calc(var(--s)+var(--g)+2rem)] flex-col items-center px-4 text-center">
          <h1 className="hero-title t-display">
            <RevealText text="Microsoft" />
          </h1>
          <p className="hero-sub t-body mt-6 text-center">
            Uma história de cinquenta anos.
          </p>
        </div>

        <div className="hero-media invisible absolute inset-0 bg-black">
          <ScrollMedia ref={media} slot="HERO_VIDEO" range={VIDEO_RANGE} tone="dark" className="h-full w-full bg-black" />
        </div>
      </div>
    </section>
  );
}
