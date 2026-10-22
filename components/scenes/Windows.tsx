"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { beatSequence, enterTimeline, holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { ScrollMedia, type MediaHandle } from "@/components/ScrollMedia";
import { RevealText } from "@/components/RevealText";

type Rect = [x: number, y: number, w: number, h: number];

// Posições dos quatro painéis, em frações da área da tela.
const SNAP_A: Rect[] = [
  [0.03, 0.05, 0.55, 0.8],
  [0.6, 0.05, 0.37, 0.25],
  [0.6, 0.32, 0.37, 0.25],
  [0.6, 0.59, 0.37, 0.26],
];
const SNAP_B: Rect[] = [
  [0.03, 0.05, 0.45, 0.8],
  [0.5, 0.05, 0.47, 0.39],
  [0.5, 0.46, 0.225, 0.39],
  [0.745, 0.46, 0.225, 0.39],
];

const BEATS = [
  { title: "Windows", text: "A janela virou o jeito de trabalhar com um computador, e o nome ficou." },
  { title: "Uma tela, várias tarefas", text: "Snap Layouts organiza janelas lado a lado com um gesto, do notebook ao monitor ultrawide." },
  { title: "A base de mais de um bilhão de dispositivos", text: "Do PC de casa às estações de trabalho, com segurança integrada desde o início." },
];

export function Windows() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<MediaHandle>(null);

  useScene(root, ({ reduce }) => {
    const q = gsap.utils.selector(root);
    const screen = q(".win-screen")[0] as HTMLElement;
    const panes = q<HTMLElement>(".win-pane");

    // Painéis são elementos do tamanho da tela escalados via transform.
    const logo = (i: number) => {
      const W = screen.clientWidth;
      const H = screen.clientHeight;
      const s = H * 0.24;
      const g = s * 0.06;
      const col = i % 2;
      const row = Math.floor(i / 2);
      return {
        x: W / 2 + (col ? g / 2 : -g / 2 - s),
        y: H / 2 + (row ? g / 2 : -g / 2 - s),
        scaleX: s / W,
        scaleY: s / H,
      };
    };
    const snap = (layout: Rect[]) => ({
      x: (i: number) => layout[i][0] * screen.clientWidth,
      y: (i: number) => layout[i][1] * screen.clientHeight,
      scaleX: (i: number) => layout[i][2],
      scaleY: (i: number) => layout[i][3],
    });

    const enter = enterTimeline(root.current!);
    enter.from(q(".win-beat-0 .rw"), { yPercent: 110, stagger: 0.08, duration: 0.6, ease: "power3.out" }, 0.2);

    const tl = pinTimeline(root.current!, q(".win-stage")[0], 3.2, (p) => media.current?.setProgress(p));

    tl.fromTo(
        q(".win-tilt"),
        { rotateY: reduce ? 0 : -38, rotateX: reduce ? 0 : 8, scale: reduce ? 1 : 0.86 },
        { rotateY: 0, rotateX: 0, scale: 1, duration: 2.2, ease: "power2.inOut" },
        0,
      )
      .fromTo(
        panes,
        {
          transformOrigin: "0 0",
          x: (i: number) => logo(i).x,
          y: (i: number) => logo(i).y,
          scaleX: (i: number) => logo(i).scaleX,
          scaleY: (i: number) => logo(i).scaleY,
        },
        { ...snap(SNAP_A), duration: 1.8, ease: "power3.inOut", stagger: 0.08 },
        2,
      )
      .to(panes, { backgroundColor: "rgba(238, 242, 245, 0.92)", duration: 1 }, 2.6)
      .fromTo(q(".win-chrome"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 2.4)
      .fromTo(q(".win-wallpaper"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 2.4)
      .fromTo(q(".win-taskbar"), { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: "power2.out" }, 3)
      .to(panes, { ...snap(SNAP_B), duration: 1.6, ease: "power3.inOut", stagger: { each: 0.08, from: "end" } }, 5.4);

    beatSequence(tl, q(".win-beat"), [0, 3.6, 6.6], { reduce });
    holdUntil(tl, 8);
  });

  return (
    <section ref={root} id="windows" aria-labelledby="windows-title">
      <div className="win-stage relative grid h-svh grid-rows-[1fr_auto] items-center gap-6 overflow-hidden px-4 pt-20 pb-16 md:grid-cols-12 md:grid-rows-1 md:px-12 md:py-0">
        <div className="beats md:col-span-4 md:col-start-1 md:row-start-1">
          {BEATS.map((beat, i) => (
            <div key={i} className={`win-beat win-beat-${i}`}>
              {i === 0 ? (
                <h2 id="windows-title" className="t-title">
                  <RevealText text={beat.title} />
                </h2>
              ) : (
                <h3 className="t-heading max-w-[16ch]">{beat.title}</h3>
              )}
              <p className="t-body mt-5">{beat.text}</p>
            </div>
          ))}
        </div>

        <div className="row-start-1 [perspective:1400px] md:col-span-7 md:col-start-6 md:row-start-1">
          <div className="win-tilt [transform-style:preserve-3d]">
            <div className="win-screen relative aspect-[16/10] w-full">
              <div className="win-wallpaper absolute inset-0">
                <ScrollMedia ref={media} slot="WINDOWS_SHOWCASE" tone="dark" className="h-full w-full" />
              </div>
              <div className="win-chrome pointer-events-none absolute -inset-2 border border-[var(--line)] md:-inset-3" aria-hidden />
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  aria-hidden
                  className="win-pane absolute top-0 left-0 h-full w-full bg-[var(--ms-blue)] will-change-transform"
                />
              ))}
              <div className="absolute inset-x-0 bottom-0 overflow-hidden" aria-hidden>
                <div className="win-taskbar flex h-[7%] min-h-5 items-center justify-center gap-1.5 bg-[#0D1B2E]/80 backdrop-blur-sm">
                  <span className="grid grid-cols-2 gap-px">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className="size-1.5 bg-[var(--ms-blue)]" />
                    ))}
                  </span>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="size-3 rounded-[3px] bg-white/25" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
