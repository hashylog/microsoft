"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { RevealText } from "@/components/RevealText";
import { scrollToTarget } from "@/lib/scroll";

/** Montagem final (o filme antigo do Hero), tocando sozinha em loop enquanto a cena está na tela. */
const MONTAGE_SRC = "/videos/future_montage.mp4";

// Cada quadrado vem de um canto distante e volta ao lugar no logo.
const SQUARES = [
  { color: "var(--ms-red)", from: [-70, -60, -40] },
  { color: "var(--ms-green)", from: [75, -55, 35] },
  { color: "var(--ms-blue)", from: [-65, 70, 30] },
  { color: "var(--ms-yellow)", from: [70, 65, -45] },
] as const;

export function Future() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useScene(root, ({ reduce }) => {
    const q = gsap.utils.selector(root);
    const k = reduce ? 0 : 1;

    const tl = pinTimeline(root.current!, q(".ft-stage")[0], 2.4);

    tl.fromTo(q(".ft-media"), { scale: reduce ? 1 : 1.06 }, { scale: 1, duration: 1.6 }, 0)
      .to(q(".ft-media"), { autoAlpha: 0, scale: reduce ? 1 : 0.9, duration: 1.2 }, 2.4)
      .fromTo(
        q(".ft-square"),
        {
          x: (i) => `${SQUARES[i].from[0] * k}vw`,
          y: (i) => `${SQUARES[i].from[1] * k}vh`,
          rotate: (i) => SQUARES[i].from[2] * k,
          scale: reduce ? 1 : 4,
          autoAlpha: reduce ? 0 : 1,
        },
        { x: 0, y: 0, rotate: 0, scale: 1, autoAlpha: 1, duration: 3, ease: "power3.inOut", stagger: 0.12 },
        1.2,
      )
      .from(q(".ft-title .rw"), { yPercent: 110, duration: 0.8, stagger: 0.06, ease: "power3.out" }, 4.2)
      .fromTo(q(".ft-cta"), { autoAlpha: 0, y: reduce ? 0 : 16 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 5);
    holdUntil(tl, 6.4);

    const v = video.current;
    ScrollTrigger.create({
      trigger: root.current,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        if (!v) return;
        if (self.isActive) v.play().catch(() => {});
        else v.pause();
      },
    });
  });

  return (
    <section ref={root} id="futuro" aria-labelledby="futuro-title">
      <div className="ft-stage relative grid h-svh place-items-center overflow-hidden px-4">
        <div className="ft-media absolute inset-4 md:inset-12">
          <video
            ref={video}
            className="h-full w-full bg-black object-cover"
            src={MONTAGE_SRC}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
          />
        </div>

        <div className="relative flex flex-col items-center text-center">
          <div className="grid grid-cols-2 gap-[6px] md:gap-2" aria-hidden>
            {SQUARES.map((sq) => (
              <span key={sq.color} className="ft-square block size-12 will-change-transform md:size-20" style={{ background: sq.color }} />
            ))}
          </div>
          <h2 id="futuro-title" className="ft-title t-title mt-10 max-w-[14ch] md:mt-14">
            <RevealText text="O próximo capítulo ainda está sendo escrito." />
          </h2>
          {/* Os dois botões entram juntos (.ft-cta no grupo). */}
          <div className="ft-cta mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollToTarget(0)}
              className="group inline-flex items-center gap-3 rounded-full border border-[var(--fg)] px-6 py-3 text-sm font-semibold transition-colors hover:bg-[var(--fg)] hover:text-[var(--bg)]"
            >
              <span className="grid grid-cols-2 gap-px transition-transform duration-500 group-hover:rotate-90" aria-hidden>
                {SQUARES.map((sq) => (
                  <span key={sq.color} className="size-1.5" style={{ background: sq.color }} />
                ))}
              </span>
              Ver a história de novo
            </button>
            <Link
              href="/quiz"
              className="group inline-flex items-center gap-3 rounded-full border border-[var(--fg)] bg-[var(--fg)] px-6 py-3 text-sm font-semibold text-[var(--bg)] transition-colors hover:bg-transparent hover:text-[var(--fg)]"
            >
              Fazer o quiz
              <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
