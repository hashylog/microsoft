"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { ScrollMedia, type MediaHandle } from "@/components/ScrollMedia";
import { RevealText } from "@/components/RevealText";

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

    const tl = pinTimeline(root.current!, stage, 2.6, (p) => media.current?.setProgress(p));
    tl.to(q(".hero-title"), { yPercent: reduce ? 0 : -40, autoAlpha: 0, duration: 1.2 }, 0)
      .fromTo(q(".hero-sub"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.6, immediateRender: false }, 0)
      .to(
        quads,
        {
          x: (i) => toQuadrant(i).x,
          y: (i) => toQuadrant(i).y,
          scaleX: (i) => toQuadrant(i).scaleX,
          scaleY: (i) => toQuadrant(i).scaleY,
          duration: 3,
          ease: "power3.inOut",
          stagger: 0.12,
        },
        0.3,
      )
      .fromTo(
        q(".hero-media"),
        { autoAlpha: 0, scale: reduce ? 1 : 1.12 },
        { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power2.out" },
        3.9,
      )
      .from(q(".hero-headline .rw"), { yPercent: 110, duration: 1, stagger: 0.08, ease: "power3.out" }, 4.8)
      .to(q(".hero-media"), { scale: reduce ? 1 : 0.94, duration: 1.4, ease: "power1.inOut" }, 6.9);
    holdUntil(tl, 8.6);
  });

  return (
    <section ref={root} id="inicio" aria-label="Início">
      <div className="hero-stage relative h-svh overflow-hidden">
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
            Uma história de cinquenta anos contada em quatro cores. Role para começar.
          </p>
        </div>

        <div className="hero-media invisible absolute inset-0">
          <ScrollMedia ref={media} slot="HERO_VIDEO" tone="dark" className="h-full w-full" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0D1B2E]/90 to-transparent px-4 pt-32 pb-14 md:px-12 md:pb-16">
            <h2 className="hero-headline t-statement max-w-[18ch] text-[#EEF2F5]">
              <RevealText text="Desde 1975, a aposta é a mesma: software que amplia o que as pessoas conseguem fazer." />
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}
