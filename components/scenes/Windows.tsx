"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { beatSequence, enterTimeline, holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { ScrollMedia, type MediaHandle } from "@/components/ScrollMedia";
import { RevealText } from "@/components/RevealText";

// Timeline em unidades (total TOTAL); cada vídeo ocupa um trecho dela.
const TOTAL = 10;
const START_END = 3.8; // windows-start: logo surge e fica parado
const FADE_AT = 3.2; // troca suave: o logo cresce e some enquanto o Bloom aparece
const FADE_DUR = 1.2;
const BLOOM_FROM = 3.4; // windows-bloom: a flor nasce e gira
const BLOOM_END = 9.2;
const BEAT_AT = [5, 6.8, 8.6];

const START_RANGE: [number, number] = [0, START_END / TOTAL];
const BLOOM_RANGE: [number, number] = [BLOOM_FROM / TOTAL, BLOOM_END / TOTAL];

const BEATS = [
  { title: "Windows", text: "A janela virou o jeito de trabalhar com um computador, e o nome ficou." },
  { title: "Uma tela, várias tarefas", text: "Snap Layouts organiza janelas lado a lado com um gesto, do notebook ao monitor ultrawide." },
  { title: "A base de mais de um bilhão de dispositivos", text: "Do PC de casa às estações de trabalho, com segurança integrada desde o início." },
];

export function Windows() {
  const root = useRef<HTMLElement>(null);
  const start = useRef<MediaHandle>(null);
  const bloom = useRef<MediaHandle>(null);

  useScene(root, ({ reduce }) => {
    const q = gsap.utils.selector(root);

    // O Hero termina em preto: a cena entra coberta e o véu some enquanto ela sobe.
    const enter = enterTimeline(root.current!);
    enter.fromTo(q(".win-veil"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3 }, 0.7);

    const tl = pinTimeline(root.current!, q(".win-stage")[0], 4.2, (p) => {
      start.current?.setProgress(p);
      bloom.current?.setProgress(p);
    });

    // Os vídeos não se encaixam perfeitamente: crossfade com leve zoom no logo.
    tl.fromTo(q(".win-start"), { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: reduce ? 1 : 1.06, duration: FADE_DUR, ease: "power1.inOut" }, FADE_AT)
      .fromTo(q(".win-bloom"), { autoAlpha: 0, scale: reduce ? 1 : 1.04 }, { autoAlpha: 1, scale: 1, duration: FADE_DUR, ease: "power1.inOut" }, FADE_AT)
      // Primeiro texto entra só depois que o Bloom já está em cena.
      .fromTo(q(".win-beat-0"), { autoAlpha: 0, y: reduce ? 0 : 24 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" }, BEAT_AT[0] - 0.6)
      .from(q(".win-beat-0 .rw"), { yPercent: 110, stagger: 0.08, duration: 0.6, ease: "power3.out" }, BEAT_AT[0] - 0.6);

    beatSequence(tl, q(".win-beat"), BEAT_AT, { reduce });
    holdUntil(tl, TOTAL);
  });

  return (
    <section ref={root} id="windows" aria-labelledby="windows-title">
      <div className="win-stage relative h-svh overflow-hidden bg-[#F4F4F4]">
        <div className="win-bloom invisible absolute inset-0 will-change-transform">
          <ScrollMedia ref={bloom} slot="WINDOWS_BLOOM" range={BLOOM_RANGE} objectPosition="50% 100%" tone="none" className="h-full w-full bg-[#BCD0E2]" />
          {/* Clareia o canto dos textos: no fim do vídeo a flor chega até ali. */}
          <div
            className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(236,242,248,0.92),rgba(236,242,248,0.7)_22%,transparent_42%)] md:bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,rgba(236,242,248,0.9),rgba(236,242,248,0.55)_45%,transparent_75%)]"
            aria-hidden
          />
        </div>
        <div className="win-start absolute inset-0 will-change-transform">
          {/* Fundo do vídeo é um cinza liso (#F4F4F4): mostrado inteiro, sem cortar o logo no celular. */}
          <ScrollMedia ref={start} slot="WINDOWS_START" range={START_RANGE} objectFit="contain" tone="none" className="h-full w-full bg-[#F4F4F4]" />
        </div>

        <div className="beats absolute inset-x-4 top-24 md:inset-x-auto md:top-[16svh] md:left-12 md:w-[min(34vw,32rem)]">
          {BEATS.map((beat, i) => (
            <div key={i} className={`win-beat win-beat-${i} ${i === 0 ? "invisible" : ""} text-[#14233A]`}>
              {i === 0 ? (
                <h2 id="windows-title" className="t-title">
                  <RevealText text={beat.title} />
                </h2>
              ) : (
                <h3 className="t-heading max-w-[16ch]">{beat.title}</h3>
              )}
              <p className="t-body mt-5 text-[#14233A]/75">{beat.text}</p>
            </div>
          ))}
        </div>

        <div className="win-veil pointer-events-none absolute inset-0 bg-black" aria-hidden />
      </div>
    </section>
  );
}
