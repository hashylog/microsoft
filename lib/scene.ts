"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "./gsap";

export type SceneContext = {
  /** Usuário pediu menos movimento: manter crossfades, zerar deslocamentos. */
  reduce: boolean;
  mobile: boolean;
};

/**
 * Monta as animações de uma cena dentro de um gsap.matchMedia, para que tudo
 * seja recriado ao trocar de breakpoint ou de preferência de movimento.
 */
export function useScene(
  scope: RefObject<HTMLElement | null>,
  build: (ctx: SceneContext) => void,
) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          all: "(min-width: 0px)",
          reduce: "(prefers-reduced-motion: reduce)",
          mobile: "(max-width: 767px)",
        },
        (c) => {
          const { reduce, mobile } = c.conditions ?? {};
          build({ reduce: !!reduce, mobile: !!mobile });
        },
      );
      return () => mm.revert();
    },
    { scope },
  );
}

/**
 * Timeline fixada (pinned) e controlada pelo scroll (scrub).
 * `screens` é a duração da cena em alturas de viewport.
 * `onProgress` recebe 0–1 e é o ponto de sincronização para mídia (vídeo/frames).
 */
export function pinTimeline(
  section: Element,
  stage: Element,
  screens: number,
  onProgress?: (p: number) => void,
) {
  return gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: section,
      pin: stage,
      start: "top top",
      end: () => `+=${window.innerHeight * screens}`,
      scrub: true,
      invalidateOnRefresh: true,
      anticipatePin: 1,
      onUpdate: onProgress ? (s) => onProgress(s.progress) : undefined,
    },
  });
}

/**
 * Timeline da entrada da cena: roda enquanto a seção sobe até o topo,
 * terminando exatamente quando o pin começa.
 */
export function enterTimeline(section: Element) {
  return gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: section, start: "top 85%", end: "top top", scrub: true },
  });
}

/**
 * Troca blocos de texto empilhados ("beats") em momentos definidos da timeline.
 * `at[i]` é a posição em que o beat i fica totalmente visível.
 */
export function beatSequence(
  tl: gsap.core.Timeline,
  beats: Element[],
  at: number[],
  { reduce, dur = 0.5 }: { reduce: boolean; dur?: number },
) {
  const shift = reduce ? 0 : 32;
  beats.forEach((beat, i) => {
    if (i > 0) {
      tl.fromTo(
        beat,
        { autoAlpha: 0, y: shift },
        { autoAlpha: 1, y: 0, duration: dur, ease: "power2.out" },
        at[i] - dur,
      );
    }
    if (i < beats.length - 1) {
      tl.to(
        beat,
        { autoAlpha: 0, y: -shift, duration: dur * 0.8, ease: "power2.in" },
        at[i + 1] - dur - dur * 0.8,
      );
    }
  });
}

/** Garante que a timeline dure exatamente `total`, mantendo o fim em repouso. */
export function holdUntil(tl: gsap.core.Timeline, total: number) {
  const rest = total - tl.duration();
  if (rest > 0) tl.to({}, { duration: rest });
}
