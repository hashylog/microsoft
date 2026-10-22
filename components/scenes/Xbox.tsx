"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { beatSequence, enterTimeline, holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { ScrollMedia, type MediaHandle } from "@/components/ScrollMedia";
import { RevealText } from "@/components/RevealText";

const BEATS = [
  { title: "Xbox", text: "Jogue no console, no PC e na nuvem, com o mesmo perfil e o mesmo progresso." },
  { title: "Uma biblioteca, não uma prateleira", text: "Com o Game Pass, centenas de jogos ficam disponíveis por assinatura, incluindo lançamentos." },
  { title: "Sem console, também dá", text: "Com o jogo na nuvem, a partida roda em servidores e chega à tela que você já tem." },
];

const ROWS = [6, 6];

export function Xbox() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<MediaHandle>(null);

  useScene(root, ({ reduce, mobile }) => {
    const q = gsap.utils.selector(root);
    const k = reduce ? 0 : 1;

    const enter = enterTimeline(root.current!);
    enter.from(q(".xb-beat-0 .rw"), { yPercent: 110, stagger: 0.08, duration: 0.6, ease: "power3.out" }, 0.2);

    const tl = pinTimeline(root.current!, q(".xb-stage")[0], 3.2, (p) => media.current?.setProgress(p));

    tl.fromTo(q(".xb-sphere"), { scale: reduce ? 1 : 0.35 }, { scale: 1, duration: 2.2, ease: "power3.out" }, 0)
      .fromTo(q(".xb-ring"), { rotate: 0 }, { rotate: 300 * k, duration: 8 }, 0)
      .fromTo(q(".xb-ring"), { scale: reduce ? 1 : 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.6, ease: "power2.out" }, 0.3)
      // Faixas de jogos atravessam a tela em direções opostas (parallax por velocidade).
      .fromTo(q(".xb-reel"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 2.4)
      .fromTo(q(".xb-row-0"), { xPercent: 10 * k }, { xPercent: -45 * k, duration: 5 }, 2.4)
      .fromTo(q(".xb-row-1"), { xPercent: -40 * k }, { xPercent: 5 * k, duration: 5 }, 2.4)
      .to(q(".xb-sphere"), { scale: reduce ? 1 : mobile ? 1.5 : 1.9, xPercent: reduce ? 0 : mobile ? 0 : 18, duration: 2.4, ease: "power2.inOut" }, 5.6)
      .to(q(".xb-reel"), { autoAlpha: 0.25, duration: 1 }, 6);

    beatSequence(tl, q(".xb-beat"), [0, 3.2, 6.6], { reduce });
    holdUntil(tl, 8.4);
  });

  return (
    <section ref={root} id="xbox" aria-labelledby="xbox-title">
      <div className="xb-stage relative h-svh overflow-hidden">
        <div className="absolute inset-0 grid place-items-center md:place-items-center md:pl-[30vw]" aria-hidden>
          <div className="relative size-[min(70vw,52svh)]">
            <svg className="xb-ring absolute -inset-[12%] h-[124%] w-[124%]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="49" fill="none" stroke="var(--ms-green)" strokeWidth="0.35" strokeDasharray="0.6 2.4" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--line)" strokeWidth="0.25" />
              <rect x="49" y="0" width="2" height="2" fill="var(--ms-green)" />
            </svg>
            <div className="xb-sphere relative h-full w-full overflow-hidden rounded-full bg-[var(--ms-green)] will-change-transform">
              <div className="absolute inset-[9%] overflow-hidden rounded-full">
                <ScrollMedia ref={media} slot="XBOX_GAMEPLAY_REEL" tone="dark" className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="xb-reel pointer-events-none invisible absolute inset-x-0 bottom-[10svh] space-y-3 md:bottom-[8svh] md:space-y-4" aria-hidden>
          {ROWS.map((count, r) => (
            <div key={r} className={`xb-row-${r} flex w-max gap-3 will-change-transform md:gap-4`}>
              {Array.from({ length: count }, (_, i) => (
                <ScrollMedia
                  key={i}
                  slot="XBOX_GAME_COVERS"
                  index={r * count + i}
                  compact
                  tone="dark"
                  className="aspect-[16/9] w-[42vw] shrink-0 md:w-[19vw]"
                />
              ))}
            </div>
          ))}
        </div>

        <div className="relative z-10 flex h-full flex-col justify-start px-4 pt-24 md:justify-center md:px-12 md:pt-0">
          <div className="beats md:max-w-[34vw]">
            {BEATS.map((beat, i) => (
              <div key={i} className={`xb-beat xb-beat-${i}`}>
                {i === 0 ? (
                  <h2 id="xbox-title" className="t-title">
                    <RevealText text={beat.title} />
                  </h2>
                ) : (
                  <h3 className="t-heading max-w-[16ch]">{beat.title}</h3>
                )}
                <p className="t-body mt-5">{beat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
