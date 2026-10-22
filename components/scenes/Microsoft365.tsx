"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { beatSequence, enterTimeline, holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { ScrollMedia, type MediaHandle } from "@/components/ScrollMedia";
import { RevealText } from "@/components/RevealText";

// Cores aproximadas de cada app, apenas para o wireframe.
const APPS = [
  { name: "Word", letter: "W", color: "#185ABD", text: "Escreva e revise com outras pessoas no mesmo documento, ao mesmo tempo.", from: [-46, -38, -18, 1.3] },
  { name: "Excel", letter: "X", color: "#107C41", text: "Organize números e transforme planilhas em gráficos e decisões.", from: [-30, 44, 14, 0.8] },
  { name: "PowerPoint", letter: "P", color: "#C43E1C", text: "Monte apresentações que contam uma história, slide a slide.", from: [6, -52, -8, 1.5] },
  { name: "Outlook", letter: "O", color: "#0F6CBD", text: "E-mail e agenda no mesmo lugar, para planejar a semana.", from: [34, 40, 20, 0.9] },
  { name: "Teams", letter: "T", color: "#5B5FC7", text: "Chat, reuniões e arquivos de cada equipe em um só espaço.", from: [48, -30, -16, 1.2] },
] as const;

export function Microsoft365() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<MediaHandle>(null);

  useScene(root, ({ reduce }) => {
    const q = gsap.utils.selector(root);
    const tiles = q<HTMLElement>(".m365-tile");
    const k = reduce ? 0 : 1;

    const enter = enterTimeline(root.current!);
    enter.from(q(".m365-beat-0 .rw"), { yPercent: 110, stagger: 0.08, duration: 0.6, ease: "power3.out" }, 0.2);

    const tl = pinTimeline(root.current!, q(".m365-stage")[0], 3.4, (p) => media.current?.setProgress(p));

    tl// Os apps chegam de profundidades diferentes e se encaixam na barra.
      .fromTo(
        tiles,
        {
          xPercent: (i) => APPS[i].from[0] * 12 * k,
          yPercent: (i) => APPS[i].from[1] * 10 * k,
          rotate: (i) => APPS[i].from[2] * k,
          scale: (i) => (reduce ? 1 : APPS[i].from[3]),
        },
        { xPercent: 0, yPercent: 0, rotate: 0, scale: 1, duration: 2.2, ease: "power3.inOut", stagger: 0.1 },
        0,
      )
      .fromTo(q(".m365-doc"), { scale: reduce ? 1 : 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.8, ease: "power2.inOut" }, 0.8);

    // Destaque de cada app, em sequência.
    const start = 3.4;
    const step = 1.1;
    APPS.forEach((_, i) => {
      const t = start + i * step;
      tl.to(tiles, { opacity: (j) => (j === i ? 1 : 0.35), duration: 0.3 }, t)
        .to(tiles[i], { y: -14 * k, scale: 1.12, duration: 0.3, ease: "power2.out" }, t)
        .fromTo(q(`.m365-app-${i}`), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, t);
      if (i < APPS.length - 1) {
        tl.to(tiles[i], { y: 0, scale: 1, duration: 0.3 }, t + step - 0.15)
          .to(q(`.m365-app-${i}`), { autoAlpha: 0, duration: 0.3 }, t + step - 0.15);
      }
    });
    const end = start + APPS.length * step;
    tl.to(tiles, { opacity: 1, y: 0, scale: 1, duration: 0.4 }, end)
      .to(q(`.m365-app-${APPS.length - 1}`), { autoAlpha: 0, duration: 0.4 }, end);

    beatSequence(
      tl,
      q(".m365-beat"),
      [0, ...APPS.map((_, i) => start + i * step + 0.3), end + 0.6],
      { reduce, dur: 0.3 },
    );
    holdUntil(tl, end + 1.4);
  });

  return (
    <section ref={root} id="microsoft-365" aria-labelledby="m365-title">
      <div className="m365-stage relative grid h-svh grid-rows-[1fr_auto] items-center gap-6 overflow-hidden px-4 pt-20 pb-16 md:grid-cols-12 md:grid-rows-1 md:px-12 md:py-0">
        <div className="beats md:col-span-4 md:col-start-1 md:row-start-1">
          <div className="m365-beat m365-beat-0">
            <h2 id="m365-title" className="t-title">
              <RevealText text="Microsoft 365" />
            </h2>
            <p className="t-body mt-5">Os aplicativos que você já conhece, conectados pelos mesmos arquivos e pelas mesmas pessoas.</p>
          </div>
          {APPS.map((app) => (
            <div key={app.name} className="m365-beat">
              <h3 className="t-heading">{app.name}</h3>
              <p className="t-body mt-5">{app.text}</p>
            </div>
          ))}
          <div className="m365-beat">
            <h3 className="t-heading max-w-[16ch]">Tudo salvo na nuvem</h3>
            <p className="t-body mt-5">Comece no computador, continue no celular. O arquivo é o mesmo.</p>
          </div>
        </div>

        <div className="row-start-1 flex flex-col items-center gap-6 md:col-span-7 md:col-start-6 md:row-start-1 md:gap-8">
          <div className="m365-doc relative aspect-[4/3] w-full max-w-[min(100%,calc(62svh*4/3))]">
            <ScrollMedia ref={media} slot="M365_SUITE" className="h-full w-full" />
            {APPS.map((app, i) => (
              <div key={app.name} className={`m365-app-${i} invisible absolute inset-x-0 top-0`} aria-hidden>
                <div className="flex h-8 items-center gap-2 px-3 text-xs font-semibold text-white md:h-10 md:text-sm" style={{ background: app.color }}>
                  {app.name}
                </div>
              </div>
            ))}
          </div>

          <ul className="flex gap-3 md:gap-4" aria-label="Aplicativos">
            {APPS.map((app) => (
              <li
                key={app.name}
                className="m365-tile grid size-12 place-items-center rounded-xl text-lg font-bold text-white shadow-[0_10px_30px_-12px_rgba(20,35,58,0.45)] will-change-transform md:size-16 md:rounded-2xl md:text-2xl"
                style={{ background: app.color }}
                title={app.name}
              >
                <span aria-hidden>{app.letter}</span>
                <span className="sr-only">{app.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
