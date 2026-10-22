"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { beatSequence, enterTimeline, holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { ScrollMedia, type MediaHandle } from "@/components/ScrollMedia";
import { RevealText } from "@/components/RevealText";

// A timeline desta cena é medida em segundos do vídeo M365_SUITE.
const VIDEO_SECONDS = 49.67;
const END_HOLD = 1.6; // pausa no frame final, depois que a miniatura cobre a tela
const SCREENS = 10.4; // altura total de scroll da cena (~5 s de vídeo por tela)

type AppKey = "word" | "excel" | "powerpoint";

const APPS: Record<AppKey, { name: string; letter: string; color: string; tint: string }> = {
  word: { name: "Word", letter: "W", color: "#185ABD", tint: "rgba(24, 90, 189, 0.12)" },
  excel: { name: "Excel", letter: "X", color: "#107C41", tint: "rgba(16, 124, 65, 0.12)" },
  powerpoint: { name: "PowerPoint", letter: "P", color: "#C43E1C", tint: "rgba(196, 62, 28, 0.12)" },
};

// Qual app está em cena em cada trecho do vídeo (mapeado pelos cortes de cena).
const SEGMENTS: { from: number; to: number; app: AppKey | null }[] = [
  { from: 0, to: 1.43, app: "word" },
  { from: 1.43, to: 2.8, app: "excel" },
  { from: 2.8, to: 5.77, app: "powerpoint" },
  { from: 5.77, to: 9.97, app: "excel" },
  { from: 9.97, to: 15.93, app: "word" },
  { from: 15.93, to: 20.97, app: "excel" },
  { from: 20.97, to: 25.5, app: "powerpoint" },
  { from: 25.5, to: 30.87, app: "word" },
  { from: 30.87, to: 35.97, app: "powerpoint" },
  { from: 35.97, to: 40.5, app: "excel" },
  { from: 40.5, to: 43.17, app: "powerpoint" },
  { from: 43.17, to: 45.77, app: "word" },
  { from: 45.77, to: VIDEO_SECONDS, app: null }, // logo da Microsoft
];

type Side = "left" | "right" | "center";

// Capítulos de texto. `frame` é o lado da miniatura; o texto fica do lado oposto.
const CHAPTERS: { at: number; frame: Side; title: string; text: string }[] = [
  {
    at: 0,
    frame: "right",
    title: "Microsoft 365",
    text: "Word, Excel e PowerPoint, conectados pelos mesmos arquivos e pelas mesmas pessoas.",
  },
  {
    at: 6.6,
    frame: "left",
    title: "Do dado ao documento",
    text: "A planilha vira gráfico, o gráfico vira relatório. Sem copiar, colar e reformatar.",
  },
  {
    at: 16.6,
    frame: "right",
    title: "Várias pessoas, o mesmo arquivo",
    text: "Cada colega aparece com o próprio cursor e as mudanças surgem na hora, para todo mundo.",
  },
  {
    at: 26.6,
    frame: "left",
    title: "Comentários que viram conversa",
    text: "Marque alguém com @, atribua uma tarefa e resolva a dúvida dentro do próprio arquivo.",
  },
  {
    at: 36.6,
    frame: "center",
    title: "Um pacote, três ferramentas",
    text: "Escrever, calcular e apresentar, com a mesma conta e na nuvem.",
  },
];

export function Microsoft365() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<MediaHandle>(null);

  useScene(root, ({ reduce, mobile }) => {
    const q = gsap.utils.selector(root);
    const stage = q(".m365-stage")[0] as HTMLElement;
    const frame = q(".m365-frame")[0] as HTMLElement;

    // Posição horizontal da miniatura (frame usa left: 0 no CSS).
    const margin = () => (mobile ? 16 : 48);
    const xFor = (side: Side) => () => {
      const free = stage.clientWidth - frame.offsetWidth;
      if (mobile || side === "center") return free / 2;
      return side === "left" ? margin() : free - margin();
    };
    // Escala e deslocamento para a miniatura cobrir a tela no final.
    const cover = () => Math.max(stage.clientWidth / frame.offsetWidth, stage.clientHeight / frame.offsetHeight) * 1.02;
    const coverY = () => (mobile ? stage.clientHeight / 2 - (frame.offsetTop + frame.offsetHeight / 2) : 0);

    const enter = enterTimeline(root.current!);
    enter.from(q(".m365-beat-0 .rw"), { yPercent: 110, stagger: 0.08, duration: 0.6, ease: "power3.out" }, 0.2);

    const total = VIDEO_SECONDS + END_HOLD;
    const tl = pinTimeline(root.current!, stage, SCREENS, (p) => media.current?.setProgress(p));

    tl.fromTo(
      frame,
      { x: xFor("right"), y: 0, yPercent: mobile ? 0 : -50, scale: 1 },
      { x: xFor("right"), duration: 0.01 },
      0,
    );

    // A miniatura troca de lado a cada capítulo e chega antes de o novo texto aparecer.
    CHAPTERS.slice(1).forEach((ch) => {
      tl.to(
        frame,
        { x: xFor(ch.frame), scale: ch.frame === "center" && !reduce && !mobile ? 1.12 : 1, duration: 1, ease: "power3.inOut" },
        ch.at - 1.6,
      );
    });

    // Fundo, rótulo e ícones acompanham o app que está em cena no vídeo.
    SEGMENTS.forEach((seg) => {
      tl.to(q(".m365-tint"), { backgroundColor: seg.app ? APPS[seg.app].tint : "rgba(255, 255, 255, 0)", duration: 0.5 }, seg.from);
      (Object.keys(APPS) as AppKey[]).forEach((key) => {
        const on = key === seg.app;
        tl.to(q(`.m365-label-${key}`), { autoAlpha: on ? 1 : 0, duration: 0.3 }, seg.from);
        // Nos primeiros 6 s os ícones acendem um de cada vez, junto com os logos do vídeo.
        if (seg.from < 5.77) tl.to(q(`.m365-chip-${key}`), { opacity: on ? 1 : 0.25, duration: 0.3 }, seg.from);
      });
    });
    tl.to(q(".m365-chip"), { opacity: 1, duration: 0.4 }, 5.77);

    // Agulha da régua andando com o vídeo.
    tl.fromTo(q(".m365-head"), { xPercent: -100 }, { xPercent: 0, duration: VIDEO_SECONDS }, 0);

    beatSequence(tl, q(".m365-beat"), CHAPTERS.map((ch) => ch.at), { reduce, dur: 0.6 });

    // Final: o logo sobre branco ocupa a tela e leva ao capítulo seguinte.
    tl.to(q(".m365-beat-4"), { autoAlpha: 0, duration: 0.5 }, 45.2)
      .to(q(".m365-rail"), { autoAlpha: 0, duration: 0.5 }, 45.4)
      .to(frame, { x: xFor("center"), y: coverY, scale: cover, duration: 1.6, ease: "power2.inOut" }, 45.8)
      .to(q(".m365-video"), { borderRadius: 0, duration: 1.6, ease: "power2.inOut" }, 45.8);
    holdUntil(tl, total);
  });

  return (
    <section ref={root} id="microsoft-365" aria-labelledby="m365-title">
      <div className="m365-stage relative h-svh overflow-hidden">
        <div className="m365-tint absolute inset-0" aria-hidden />

        {CHAPTERS.map((ch, i) => (
          <div
            key={ch.title}
            className={`m365-beat m365-beat-${i} absolute inset-x-4 bottom-16 md:inset-x-auto md:bottom-auto ${
              ch.frame === "right"
                ? "md:top-1/2 md:left-12 md:w-[min(34vw,30rem)] md:-translate-y-1/2"
                : ch.frame === "left"
                  ? "md:top-1/2 md:right-12 md:w-[min(34vw,30rem)] md:-translate-y-1/2"
                  : "md:top-[7svh] md:left-1/2 md:w-[min(60vw,44rem)] md:-translate-x-1/2 md:text-center"
            }`}
          >
            {i === 0 ? (
              <>
                <h2 id="m365-title" className="t-title">
                  <RevealText text={ch.title} />
                </h2>
                <ul className="mt-6 flex gap-2.5" aria-label="Aplicativos">
                  {(Object.keys(APPS) as AppKey[]).map((key) => (
                    <li
                      key={key}
                      className={`m365-chip m365-chip-${key} grid size-10 place-items-center rounded-lg text-base font-bold text-white md:size-12 md:rounded-xl md:text-lg`}
                      style={{ background: APPS[key].color }}
                    >
                      <span aria-hidden>{APPS[key].letter}</span>
                      <span className="sr-only">{APPS[key].name}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <h3 className={`t-heading ${ch.frame === "center" ? "" : "max-w-[16ch]"}`}>{ch.title}</h3>
            )}
            <p className={`t-body mt-5 ${ch.frame === "center" ? "md:mx-auto" : ""}`}>{ch.text}</p>
          </div>
        ))}

        {/* Miniatura + régua se movem juntas; o tamanho do contêiner é o do vídeo. */}
        <div className="m365-frame absolute top-[14svh] left-0 aspect-video w-[calc(100%-2rem)] will-change-transform md:top-1/2 md:w-[min(52vw,calc(60svh*16/9))]">
          <div className="m365-video h-full w-full overflow-hidden rounded-2xl shadow-[0_40px_80px_-40px_rgba(20,35,58,0.55)]">
            <ScrollMedia
              ref={media}
              slot="M365_SUITE"
              range={[0, VIDEO_SECONDS / (VIDEO_SECONDS + END_HOLD)]}
              className="h-full w-full bg-white"
            />
          </div>

          <div className="m365-rail absolute inset-x-0 top-full pt-4" aria-hidden>
            <div className="mb-2 grid h-4 text-xs font-semibold">
              {(Object.keys(APPS) as AppKey[]).map((key) => (
                <span key={key} className={`m365-label-${key} invisible col-start-1 row-start-1 flex items-center gap-1.5`}>
                  <span className="size-2" style={{ background: APPS[key].color }} />
                  {APPS[key].name}
                </span>
              ))}
            </div>
            <div className="relative flex h-1.5 gap-[2px]">
              {SEGMENTS.map((seg) => (
                <span
                  key={seg.from}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${((seg.to - seg.from) / VIDEO_SECONDS) * 100}%`,
                    background: seg.app ? APPS[seg.app].color : "var(--line)",
                  }}
                />
              ))}
              <span className="m365-head absolute inset-0">
                <span className="absolute -top-1.5 right-0 h-[18px] w-[3px] translate-x-1/2 rounded-full bg-[var(--fg)]" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
