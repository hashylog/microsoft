"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { beatSequence, enterTimeline, holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { ScrollMedia, type MediaHandle } from "@/components/ScrollMedia";
import { RevealText } from "@/components/RevealText";

const PROMPT = "Resuma a reunião de ontem e sugira os próximos passos.";

// Conteúdo fictício, só para demonstrar a interação.
const REPLY = [
  "Decisão: lançar a versão beta na segunda quinzena do mês.",
  "Pendente: revisar o orçamento com a equipe de finanças.",
  "Próximo passo: marcar uma retomada para quinta-feira.",
];

const BEATS = [
  { title: "Copilot", text: "Um assistente de IA presente no Windows, no Microsoft 365 e no Edge." },
  { title: "Você pede em linguagem natural", text: "Sem fórmula, sem menu: descreva o que precisa e o Copilot busca nos seus e-mails, arquivos e reuniões." },
  { title: "Você continua decidindo", text: "A resposta vem com as fontes, para conferir antes de usar." },
];

export function Copilot() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<MediaHandle>(null);

  useScene(root, ({ reduce }) => {
    const q = gsap.utils.selector(root);
    const typed = q(".cp-typed")[0] as HTMLElement;
    const chars = { n: 0 };

    const enter = enterTimeline(root.current!);
    enter.from(q(".cp-beat-0 .rw"), { yPercent: 110, stagger: 0.08, duration: 0.6, ease: "power3.out" }, 0.2);

    const tl = pinTimeline(root.current!, q(".cp-stage")[0], 3.4, (p) => media.current?.setProgress(p));

    enter
      .fromTo(q(".cp-orb"), { scale: reduce ? 1 : 0.4 }, { scale: 1, duration: 0.8, ease: "power2.out" }, 0)
      .fromTo(q(".cp-composer"), { autoAlpha: 0, y: reduce ? 0 : 60 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power2.out" }, 0.1);

    tl.fromTo(q(".cp-orb"), { rotate: 0 }, { rotate: reduce ? 0 : 140, duration: 2 }, 0)
      // O texto é "digitado" pelo scroll, e apagado ao voltar.
      .fromTo(
        chars,
        { n: 0 },
        {
          n: PROMPT.length,
          duration: 2.2,
          onUpdate: () => {
            typed.textContent = PROMPT.slice(0, Math.round(chars.n));
          },
        },
        0.4,
      )
      .to(q(".cp-orb"), { rotate: reduce ? 0 : 420, duration: 3 }, 2)
      .fromTo(q(".cp-reply"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 3.6)
      .fromTo(q(".cp-skeleton"), { scaleX: 0 }, { scaleX: 1, duration: 0.4, stagger: 0.15, ease: "power2.out" }, 3.6)
      .to(q(".cp-skeleton"), { autoAlpha: 0, duration: 0.3 }, 4.5)
      .fromTo(q(".cp-line"), { autoAlpha: 0, y: reduce ? 0 : 10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.35 }, 4.6)
      .fromTo(q(".cp-source"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 5.8)
      // Saída: o orbe cresce e vira a transição para o capítulo final.
      .to(q(".cp-composer, .cp-text"), { autoAlpha: 0, duration: 0.6 }, 7.4)
      .to(q(".cp-orb"), { scale: reduce ? 1 : 9, autoAlpha: reduce ? 0 : 1, duration: 1.6, ease: "power2.in" }, 7.4)
      .to(q(".cp-orb"), { autoAlpha: 0, duration: 0.6 }, 8.4);

    beatSequence(tl, q(".cp-beat"), [0, 2.6, 6.2], { reduce });
    holdUntil(tl, 9.2);
  });

  return (
    <section ref={root} id="copilot" aria-labelledby="copilot-title">
      <div className="cp-stage relative grid h-svh grid-rows-[1fr_auto] items-center gap-6 overflow-hidden px-4 pt-20 pb-16 md:grid-cols-12 md:grid-rows-1 md:px-12 md:py-0">
        <div className="cp-text beats md:col-span-4 md:col-start-1 md:row-start-1">
          {BEATS.map((beat, i) => (
            <div key={i} className={`cp-beat cp-beat-${i}`}>
              {i === 0 ? (
                <h2 id="copilot-title" className="t-title">
                  <RevealText text={beat.title} />
                </h2>
              ) : (
                <h3 className="t-heading max-w-[16ch]">{beat.title}</h3>
              )}
              <p className="t-body mt-5">{beat.text}</p>
            </div>
          ))}
        </div>

        <div className="row-start-1 flex flex-col items-center gap-6 md:col-span-6 md:col-start-6 md:row-start-1 md:gap-8">
          <div className="cp-orb relative size-[min(30vw,22svh)] will-change-transform md:size-[min(18vw,24svh)]">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full blur-xl"
              style={{ background: "conic-gradient(var(--ms-blue), var(--ms-green), var(--ms-yellow), var(--ms-red), var(--ms-blue))" }}
            />
            <div className="absolute inset-[6%] overflow-hidden rounded-full">
              <ScrollMedia ref={media} slot="COPILOT_ANIMATION" tone="dark" compact className="h-full w-full" />
            </div>
          </div>

          <div className="cp-composer w-full max-w-xl">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-4 md:p-5">
              <p className="min-h-[3em] text-base leading-snug md:text-lg" aria-label={PROMPT}>
                <span className="cp-typed" aria-hidden />
                <span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.2em] animate-pulse bg-[var(--ms-blue)]" aria-hidden />
              </p>
              <div className="cp-reply invisible mt-4 border-t border-[var(--line)] pt-4">
                <div className="grid">
                  <div className="col-start-1 row-start-1 space-y-2.5 pt-1" aria-hidden>
                    {[92, 78, 85].map((w) => (
                      <span key={w} className="cp-skeleton block h-3 origin-left rounded-full bg-[var(--surface)]" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <ul className="col-start-1 row-start-1 space-y-2 text-sm leading-snug md:text-base">
                    {REPLY.map((line) => (
                      <li key={line} className="cp-line flex gap-2.5">
                        <span className="mt-[0.45em] size-1.5 shrink-0 bg-[var(--ms-blue)]" aria-hidden />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="cp-source mt-4 text-xs text-[var(--mute)]">Fontes: ata da reunião, 2 e-mails, planilha de orçamento</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
