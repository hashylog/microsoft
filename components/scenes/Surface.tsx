"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { beatSequence, enterTimeline, holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { ScrollMedia, type MediaHandle } from "@/components/ScrollMedia";
import { RevealText } from "@/components/RevealText";

const MODES = [
  { name: "Laptop", text: "Teclado encaixado para escrever, programar e estudar." },
  { name: "Tablet", text: "Teclado removido, tela na mão, leitura em pé ou deitado." },
  { name: "Estúdio", text: "Tela inclinada e caneta para desenhar, anotar e assinar." },
];

const STROKE = "M40 140 C 70 60, 110 60, 120 110 S 160 170, 190 100 S 240 40, 262 92";

export function Surface() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<MediaHandle>(null);

  useScene(root, ({ reduce }) => {
    const q = gsap.utils.selector(root);
    const k = reduce ? 0 : 1;
    const screen = q(".sf-screen")[0];
    const items = q<HTMLElement>(".sf-mode");
    const stroke = root.current!.querySelector<SVGPathElement>(".sf-stroke")!;

    gsap.set(q(".sf-kb"), { rotateX: 76, transformOrigin: "50% 0%" });

    const enter = enterTimeline(root.current!);
    enter.from(q(".sf-beat-0 .rw"), { yPercent: 110, stagger: 0.08, duration: 0.6, ease: "power3.out" }, 0.2);

    const tl = pinTimeline(root.current!, q(".sf-stage")[0], 3.2, (p) => media.current?.setProgress(p));

    // Laptop: a tampa abre sobre o teclado.
    enter.fromTo(q(".sf-device"), { y: 120 * k, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "power2.out" }, 0);

    tl.fromTo(screen, { rotateX: 78 * k }, { rotateX: -6 * k, duration: 1.6, ease: "power2.inOut" }, 0)
      .fromTo(q(".sf-modes"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.2)
      // Tablet: teclado sai, tela gira para retrato.
      .to(q(".sf-kb"), { y: 140 * k, autoAlpha: 0, duration: 1, ease: "power2.in" }, 3)
      .to(screen, { rotateX: 0, duration: 1.4, ease: "power3.inOut" }, 3.3)
      .to(q(".sf-turn"), { rotate: 90, scale: 0.66, duration: 1.4, ease: "power3.inOut" }, 3.3)
      // Estúdio: volta para paisagem e deita como uma prancheta.
      .to(q(".sf-turn"), { rotate: 0, scale: 0.92, duration: 1.4, ease: "power3.inOut" }, 5.6)
      .to(screen, { rotateX: 34 * k, duration: 1.4, ease: "power3.inOut" }, 5.6)
      .fromTo(q(".sf-ink"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 6.8)
      .fromTo(q(".sf-stroke"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6 }, 7)
      .to(
        q(".sf-pen"),
        {
          motionPath: { path: stroke, align: stroke, alignOrigin: [0.5, 1] },
          duration: 1.6,
        },
        7,
      );

    // Indicador de modo ativo.
    [0, 3.4, 5.9].forEach((t, i) => {
      tl.to(items, { opacity: (j) => (j === i ? 1 : 0.35), duration: 0.4 }, t + 0.8)
        .to(q(".sf-indicator"), { y: () => items[i].offsetTop, duration: 0.4, ease: "power2.inOut" }, t + 0.8);
    });

    beatSequence(tl, q(".sf-beat"), [0, 4.4], { reduce });
    holdUntil(tl, 9.2);
  });

  return (
    <section ref={root} id="surface" aria-labelledby="surface-title">
      <div className="sf-stage relative grid h-svh grid-rows-[1fr_auto] items-center gap-6 overflow-hidden px-4 pt-20 pb-16 md:grid-cols-12 md:grid-rows-1 md:px-12 md:py-0">
        <div className="md:col-span-4 md:col-start-1 md:row-start-1">
          <div className="beats">
            <div className="sf-beat sf-beat-0">
              <h2 id="surface-title" className="t-title">
                <RevealText text="Surface" />
              </h2>
              <p className="t-body mt-5">Hardware desenhado pela mesma empresa que escreve o software. Um aparelho, vários jeitos de usar.</p>
            </div>
            <div className="sf-beat">
              <h3 className="t-heading max-w-[14ch]">Tela 3:2, pensada para páginas</h3>
              <p className="t-body mt-5">Mais altura útil para documentos e leitura do que uma tela widescreen comum.</p>
            </div>
          </div>

          <ol className="sf-modes relative mt-8 hidden space-y-3 border-l border-[var(--line)] pl-5 md:block" aria-label="Modos de uso">
            <span className="sf-indicator absolute top-0 -left-[5px] block size-[9px] bg-[var(--ms-yellow)]" aria-hidden />
            {MODES.map((mode) => (
              <li key={mode.name} className="sf-mode opacity-35">
                <p className="text-base leading-none font-semibold">{mode.name}</p>
                <p className="mt-1.5 max-w-[32ch] text-sm text-[var(--mute)]">{mode.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="row-start-1 flex justify-center [perspective:1600px] md:col-span-7 md:col-start-6 md:row-start-1">
          <div className="sf-device w-full max-w-[min(100%,calc(56svh*1.5))] [transform-style:preserve-3d]">
            <div className="sf-turn relative [transform-style:preserve-3d]">
              <div className="sf-screen relative aspect-[3/2] origin-bottom rounded-[10px] bg-[#14233A] p-[1.6%] shadow-[0_40px_60px_-30px_rgba(20,35,58,0.55)] will-change-transform">
                <div className="relative h-full w-full overflow-hidden rounded-[4px]">
                  <ScrollMedia ref={media} slot="SURFACE_DEVICE_RENDER" tone="dark" className="h-full w-full" />
                  <svg className="sf-ink invisible absolute inset-0 h-full w-full" viewBox="0 0 300 200" aria-hidden>
                    <path
                      className="sf-stroke"
                      d={STROKE}
                      pathLength={1}
                      fill="none"
                      stroke="var(--ms-yellow)"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeDasharray="1"
                    />
                    <g className="sf-pen">
                      <rect x="-3" y="-44" width="6" height="44" rx="3" fill="#EEF2F5" />
                      <rect x="-3" y="-8" width="6" height="8" rx="1" fill="var(--ms-yellow)" />
                    </g>
                  </svg>
                </div>
              </div>
              <div className="sf-kb absolute inset-x-[3%] top-full aspect-[3/1] origin-top [transform:rotateX(76deg)] rounded-b-[10px] bg-[#C9D0D7] p-[3%]" aria-hidden>
                <div className="h-[72%] w-full rounded-sm bg-[repeating-linear-gradient(90deg,#AEB7C0_0_6.5%,transparent_6.5%_7.5%)] opacity-70" />
                <div className="mx-auto mt-[2%] h-[20%] w-[34%] rounded-sm bg-[#AEB7C0]" />
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
