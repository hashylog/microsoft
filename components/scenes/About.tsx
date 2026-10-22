"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useScene } from "@/lib/scene";
import { ScrollMedia } from "@/components/ScrollMedia";
import { RevealText } from "@/components/RevealText";
import type { MediaSlotId } from "@/lib/media";

const MILESTONES: { year: string; title: string; text: string; slot: MediaSlotId; color: string }[] = [
  {
    year: "1975",
    title: "Fundação",
    text: "Bill Gates e Paul Allen fundam a Microsoft em Albuquerque, no Novo México.",
    slot: "TIMELINE_1975",
    color: "var(--ms-red)",
  },
  {
    year: "1985",
    title: "Windows 1.0",
    text: "Janelas, mouse e ícones chegam ao PC com a primeira versão do Windows.",
    slot: "TIMELINE_1985",
    color: "var(--ms-blue)",
  },
  {
    year: "1990",
    title: "Office",
    text: "Word, Excel e PowerPoint passam a ser vendidos juntos como uma suíte.",
    slot: "TIMELINE_1990",
    color: "var(--ms-red)",
  },
  {
    year: "2001",
    title: "Xbox",
    text: "A Microsoft entra no mercado de consoles com o primeiro Xbox.",
    slot: "TIMELINE_2001",
    color: "var(--ms-green)",
  },
  {
    year: "2010",
    title: "Azure",
    text: "A plataforma de nuvem é lançada comercialmente, ainda como Windows Azure.",
    slot: "TIMELINE_2010",
    color: "var(--ms-blue)",
  },
  {
    year: "2012",
    title: "Surface",
    text: "Primeiro hardware de computação pessoal projetado pela própria Microsoft.",
    slot: "TIMELINE_2012",
    color: "var(--ms-yellow)",
  },
  {
    year: "2023",
    title: "Copilot",
    text: "A IA generativa passa a fazer parte do Windows, do Microsoft 365 e do Edge.",
    slot: "TIMELINE_2023",
    color: "var(--ms-green)",
  },
];

export function About() {
  const root = useRef<HTMLElement>(null);

  useScene(root, ({ reduce, mobile }) => {
    const q = gsap.utils.selector(root);

    // Missão: cada palavra acende conforme o scroll.
    gsap.fromTo(
      q(".mission .rw"),
      { opacity: 0.14 },
      {
        opacity: 1,
        ease: "none",
        stagger: 0.1,
        scrollTrigger: { trigger: q(".mission")[0], start: "top 75%", end: "bottom 55%", scrub: true },
      },
    );

    if (!reduce) {
      gsap.fromTo(
        q(".about-parallax"),
        { yPercent: 12 },
        {
          yPercent: -12,
          ease: "none",
          scrollTrigger: { trigger: q(".about-intro")[0], start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }

    // Linha do tempo horizontal guiada pelo scroll vertical.
    const stage = q(".timeline-stage")[0] as HTMLElement;
    const track = q(".timeline-track")[0] as HTMLElement;
    const distance = () => Math.max(0, track.scrollWidth - stage.clientWidth);

    const horizontal = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: q(".timeline")[0],
        pin: stage,
        start: "top top",
        end: () => `+=${distance() * (mobile ? 1 : 1.1)}`,
        scrub: true,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    gsap.fromTo(
      q(".timeline-fill"),
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: q(".timeline")[0],
          start: "top top",
          end: () => `+=${distance() * (mobile ? 1 : 1.1)}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );

    // Cada marco se monta ao cruzar a tela, dentro do movimento horizontal.
    q<HTMLElement>(".milestone").forEach((card) => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: card,
          containerAnimation: horizontal,
          start: "left 95%",
          end: "left 55%",
          scrub: true,
        },
      });
      tl.fromTo(card.querySelector(".milestone-mark"), { scale: 0, rotate: reduce ? 0 : -90 }, { scale: 1, rotate: 0 }, 0)
        .fromTo(card.querySelector(".milestone-year"), { yPercent: reduce ? 0 : 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1 }, 0.1)
        .fromTo(card.querySelector(".milestone-media"), { scale: reduce ? 1 : 0.85, autoAlpha: 0.2 }, { scale: 1, autoAlpha: 1 }, 0)
        .fromTo(card.querySelector(".milestone-text"), { autoAlpha: 0 }, { autoAlpha: 1 }, 0.4);
    });
  });

  return (
    <section ref={root} id="sobre" aria-labelledby="sobre-title">
      <div className="about-intro grid gap-12 px-4 pt-[18svh] pb-[14svh] md:grid-cols-12 md:gap-8 md:px-12 md:pt-[26svh] md:pb-[22svh]">
        <div className="md:col-span-4 md:col-start-1 md:pt-3">
          <h2 id="sobre-title" className="t-heading max-w-[14ch]">
            Uma empresa que começou com um interpretador de BASIC
          </h2>
          <p className="t-body mt-6">
            Fundada em 1975, a Microsoft tem sede em Redmond, Washington, e hoje atua de sistemas operacionais a
            nuvem, jogos e inteligência artificial.
          </p>
          <div className="mt-10 aspect-[4/5] max-w-sm overflow-hidden">
            <div className="about-parallax h-[124%] -translate-y-[12%]">
              <ScrollMedia slot="ABOUT_CAMPUS" className="h-full w-full" />
            </div>
          </div>
        </div>

        <figure className="mission md:col-span-7 md:col-start-6">
          <blockquote>
            <RevealText
              as="p"
              mode="fade"
              className="t-statement"
              text="Empoderar cada pessoa e cada organização do planeta a conquistar mais."
            />
          </blockquote>
          <figcaption className="t-body mt-8">Missão da Microsoft</figcaption>
        </figure>
      </div>

      <div className="timeline">
        <div className="timeline-stage relative flex h-svh flex-col justify-center overflow-hidden">
          <div className="flex items-end justify-between gap-6 px-4 md:px-12">
            <h3 className="t-heading max-w-[16ch]">Cinco décadas em sete momentos</h3>
          </div>

          <div className="relative mx-4 mt-8 h-px bg-[var(--line)] md:mx-12 md:mt-12">
            <span className="timeline-fill absolute inset-0 origin-left bg-[var(--fg)]" />
          </div>

          <ol className="timeline-track mt-8 flex w-max gap-6 px-4 will-change-transform md:mt-12 md:gap-10 md:px-12 md:pr-[20vw]">
            {MILESTONES.map((m) => (
              <li key={m.year} className="milestone w-[78vw] shrink-0 sm:w-[46vw] lg:w-[30vw]">
                <div className="flex items-baseline gap-4">
                  <span className="milestone-mark block size-3 shrink-0" style={{ background: m.color }} aria-hidden />
                  <span className="milestone-year overflow-hidden text-[clamp(2.75rem,5.5vw,5rem)] leading-none font-[750] tracking-[-0.045em] tabular-nums">
                    {m.year}
                  </span>
                </div>
                <div className="milestone-media mt-6 aspect-[16/10]">
                  <ScrollMedia slot={m.slot} compact className="h-full w-full" />
                </div>
                <div className="milestone-text mt-5">
                  <h4 className="text-lg font-semibold tracking-tight">{m.title}</h4>
                  <p className="t-body mt-1.5">{m.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
