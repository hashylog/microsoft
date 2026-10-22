"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { beatSequence, enterTimeline, holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { SurfaceModel, SURFACE_POSE_CLOSED, type SurfaceModelHandle, type SurfacePose } from "@/components/SurfaceModel";
import { RevealText } from "@/components/RevealText";

const MODES = [
  { name: "Laptop", text: "Tela aberta sobre a capa-teclado, pronta para escrever." },
  { name: "Tablet", text: "Capa solta, só a tela na mão." },
  { name: "Suporte", text: "Kickstand aberto para a tela ficar em pé na mesa." },
];

// Momentos (em unidades da timeline) em que cada modo fica ativo.
const MODE_AT = [1.6, 4.4, 6.6];

const BEATS = [
  {
    title: "Surface",
    text: "Hardware desenhado pela mesma empresa que escreve o software. Lançado em 2012, junto com o Windows 8.",
  },
  {
    title: "Uma capa que também é teclado",
    text: "A Touch Cover tem 3 mm de espessura, se prende por ímãs e protege a tela quando fechada.",
  },
  {
    title: "Suporte embutido",
    text: "O kickstand na traseira deixa a tela em pé sobre a mesa, sem nenhum acessório.",
  },
];

export function Surface() {
  const root = useRef<HTMLElement>(null);
  const model = useRef<SurfaceModelHandle>(null);
  // Objeto mutável animado pela timeline; o modelo lê esses valores a cada quadro.
  const [pose] = useState<SurfacePose>(() => ({ ...SURFACE_POSE_CLOSED }));

  useScene(root, ({ reduce }) => {
    const q = gsap.utils.selector(root);
    const p = pose;
    const items = q<HTMLElement>(".sf-mode");
    const redraw = () => model.current?.invalidate();

    const enter = enterTimeline(root.current!);
    enter
      .from(q(".sf-beat-0 .rw"), { yPercent: 110, stagger: 0.08, duration: 0.6, ease: "power3.out" }, 0.2)
      .fromTo(q(".sf-canvas"), { autoAlpha: 0, y: reduce ? 0 : 80 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, 0);

    const tl = pinTimeline(root.current!, q(".sf-stage")[0], 3.6);
    tl.eventCallback("onUpdate", redraw);
    const ease = "power2.inOut";

    // Garante a pose inicial ao voltar o scroll até o começo.
    tl.fromTo(p, { ...SURFACE_POSE_CLOSED }, { ...SURFACE_POSE_CLOSED, duration: 0.01 }, 0)
      // 1. Laptop: a tampa abre e o suporte se apoia na mesa.
      .to(p, { lid: 75, camAz: 30, camEl: 18, camDist: 0.95, duration: 2.2, ease }, 0.3)
      .to(p, { stand: 40, duration: 0.8, ease }, 1.8)
      .fromTo(q(".sf-modes"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 1.2)
      // 2. Tablet: a capa-teclado desliza para fora e a câmera vai para a frente.
      .to(p, { keyboard: 1, focus: 1, duration: 1.6, ease: "power2.in" }, 3.2)
      .to(p, { camAz: 12, camEl: 8, camDist: 0.78, duration: 1.8, ease }, 3.2)
      // 3. Suporte: o aparelho gira e mostra o kickstand fechando e abrindo.
      .to(p, { spin: reduce ? 150 : 155, camEl: 14, duration: 1.6, ease }, 5.2)
      .to(p, { stand: 2, duration: 0.6, ease }, 6.0)
      .to(p, { stand: 40, duration: 0.6, ease }, 6.8)
      // 4. Volta para a pose principal com o teclado encaixado.
      .to(p, { spin: 0, keyboard: 0, focus: 0, camAz: 30, camEl: 18, camDist: 0.95, duration: 1.8, ease }, 7.8);

    // Indicador de modo ativo; no fim volta para "Laptop".
    [...MODE_AT, 8.8].forEach((t, i) => {
      const idx = i % MODES.length;
      tl.to(items, { opacity: (j) => (j === idx ? 1 : 0.35), duration: 0.4 }, t)
        .to(q(".sf-indicator"), { y: () => items[idx].offsetTop, duration: 0.4, ease }, t);
    });

    beatSequence(tl, q(".sf-beat"), [0, 4.2, 6.4], { reduce });
    holdUntil(tl, 10);
    redraw();
  });

  return (
    <section ref={root} id="surface" aria-labelledby="surface-title">
      <div className="sf-stage relative grid h-svh grid-rows-[1fr_auto] items-center gap-6 overflow-hidden px-4 pt-20 pb-16 md:grid-cols-12 md:grid-rows-1 md:px-12 md:py-0">
        <div className="md:col-span-4 md:col-start-1 md:row-start-1">
          <div className="beats">
            {BEATS.map((beat, i) => (
              <div key={beat.title} className={`sf-beat sf-beat-${i}`}>
                {i === 0 ? (
                  <h2 id="surface-title" className="t-title">
                    <RevealText text={beat.title} />
                  </h2>
                ) : (
                  <h3 className="t-heading max-w-[14ch]">{beat.title}</h3>
                )}
                <p className="t-body mt-5">{beat.text}</p>
              </div>
            ))}
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

        <div className="sf-canvas relative row-start-1 h-full min-h-0 md:col-span-8 md:col-start-5 md:row-start-1 md:h-[86svh]">
          {/* Sombra suave sob o aparelho. */}
          <div
            className="pointer-events-none absolute inset-x-[18%] bottom-[16%] h-[10%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(20,35,58,0.28),transparent)] blur-md"
            aria-hidden
          />
          <SurfaceModel ref={model} pose={pose} className="h-full w-full" />
        </div>
      </div>
    </section>
  );
}
