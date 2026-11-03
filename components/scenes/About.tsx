"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { useScene } from "@/lib/scene";
import { RevealText } from "@/components/RevealText";

type Milestone = {
  year: string;
  title: string;
  text: string;
  color: string;
  /** Foto opcional em public/images/history (ex.: "/images/history/1975.jpg"). */
  image?: string;
};

const MILESTONES: Milestone[] = [
  {
    year: "1975",
    title: "Fundação",
    text: "Bill Gates e Paul Allen fundam a Microsoft em Albuquerque, no Novo México, para vender um interpretador de BASIC.",
    color: "var(--ms-red)",
  },
  {
    year: "1985",
    title: "Windows 1.0",
    text: "Janelas, mouse e ícones chegam ao PC com a primeira versão do Windows.",
    color: "var(--ms-blue)",
  },
  {
    year: "1990",
    title: "Office",
    text: "Word, Excel e PowerPoint passam a ser vendidos juntos como uma suíte.",
    color: "var(--ms-red)",
  },
  {
    year: "2001",
    title: "Xbox",
    text: "A Microsoft entra no mercado de consoles com o primeiro Xbox.",
    color: "var(--ms-green)",
  },
  {
    year: "2010",
    title: "Azure",
    text: "A plataforma de nuvem é lançada comercialmente, ainda como Windows Azure.",
    color: "var(--ms-blue)",
  },
  {
    year: "2012",
    title: "Surface",
    text: "Primeiro computador projetado pela própria Microsoft, lançado junto com o Windows 8.",
    color: "var(--ms-yellow)",
  },
  {
    year: "2023",
    title: "Copilot",
    text: "A IA generativa passa a fazer parte do Windows, do Microsoft 365 e do Edge.",
    color: "var(--ms-green)",
  },
];

export function About() {
  const root = useRef<HTMLElement>(null);

  useScene(root, ({ reduce, mobile }) => {
    const q = gsap.utils.selector(root);

    // Título entra conforme a seção sobe; a missão acende palavra por palavra.
    gsap.from(q(".about-title .rw"), {
      yPercent: 110,
      stagger: 0.06,
      ease: "power3.out",
      scrollTrigger: { trigger: q(".about-intro")[0], start: "top 80%", end: "top 35%", scrub: true },
    });
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

    // Linha do tempo horizontal guiada pelo scroll vertical.
    const stage = q(".timeline-stage")[0] as HTMLElement;
    const track = q(".timeline-track")[0] as HTMLElement;
    const distance = () => Math.max(0, track.scrollWidth - stage.clientWidth);
    const length = () => `+=${distance() * (mobile ? 1 : 1.1)}`;

    const horizontal = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: q(".timeline")[0],
        pin: stage,
        start: "top top",
        end: length,
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
        scrollTrigger: { trigger: q(".timeline")[0], start: "top top", end: length, scrub: true, invalidateOnRefresh: true },
      },
    );

    // Cada marco se monta ao cruzar a tela, dentro do movimento horizontal.
    q<HTMLElement>(".milestone").forEach((card) => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: card, containerAnimation: horizontal, start: "left 95%", end: "left 55%", scrub: true },
      });
      tl.fromTo(card.querySelector(".milestone-bar"), { scaleX: 0 }, { scaleX: 1 }, 0)
        .fromTo(card.querySelector(".milestone-mark"), { scale: 0, rotate: reduce ? 0 : -90 }, { scale: 1, rotate: 0 }, 0)
        .fromTo(card.querySelector(".milestone-year"), { yPercent: reduce ? 0 : 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1 }, 0.1)
        .fromTo(card.querySelector(".milestone-text"), { autoAlpha: 0, y: reduce ? 0 : 16 }, { autoAlpha: 1, y: 0 }, 0.4);
      const media = card.querySelector(".milestone-media");
      if (media) tl.fromTo(media, { scale: reduce ? 1 : 0.9, autoAlpha: 0 }, { scale: 1, autoAlpha: 1 }, 0.2);
    });
  });

  return (
    // Fundo preto: continua o fim do Hero e antecede a entrada do Windows, que também parte do preto.
    <section ref={root} id="sobre" aria-labelledby="sobre-title" className="bg-black text-[#EEF2F5]">
      <div className="about-intro grid gap-12 px-4 pt-[18svh] pb-[14svh] md:grid-cols-12 md:gap-8 md:px-12 md:pt-[24svh] md:pb-[20svh]">
        <div className="md:col-span-4 md:col-start-1 md:pt-3">
          <h2 id="sobre-title" className="about-title t-heading max-w-[14ch]">
            <RevealText text="Uma empresa que começou com um interpretador de BASIC" />
          </h2>
          <p className="t-body mt-6">
            Fundada em 1975, a Microsoft tem sede em Redmond, Washington, e hoje atua de sistemas operacionais a
            nuvem, jogos e inteligência artificial.
          </p>
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
        <div className="timeline-stage relative flex h-svh flex-col justify-center overflow-hidden bg-black">
          <h3 className="t-heading max-w-[16ch] px-4 md:px-12">Cinco décadas em sete momentos</h3>

          <div className="relative mx-4 mt-8 h-px bg-white/15 md:mx-12 md:mt-12">
            <span className="timeline-fill absolute inset-0 origin-left bg-[#EEF2F5]" />
          </div>

          <ol className="timeline-track mt-10 flex w-max gap-6 px-4 will-change-transform md:mt-14 md:gap-12 md:px-12 md:pr-[20vw]">
            {MILESTONES.map((m) => (
              <li key={m.year} className="milestone w-[78vw] shrink-0 sm:w-[46vw] lg:w-[28vw]">
                <span className="milestone-bar block h-[2px] w-full origin-left" style={{ background: m.color }} aria-hidden />
                <div className="mt-6 flex items-start gap-4">
                  <span className="milestone-mark mt-[0.9em] block size-3 shrink-0" style={{ background: m.color }} aria-hidden />
                  <span className="milestone-year text-[clamp(3.5rem,7vw,6.5rem)] leading-none font-[750] tracking-[-0.05em] tabular-nums">
                    {m.year}
                  </span>
                </div>
                {m.image && (
                  <div className="milestone-media relative mt-6 aspect-[16/10] overflow-hidden rounded-md">
                    <Image src={m.image} alt="" fill sizes="(min-width: 1024px) 28vw, (min-width: 640px) 46vw, 78vw" className="object-cover" />
                  </div>
                )}
                <div className="milestone-text mt-6">
                  <h4 className="text-xl font-semibold tracking-tight">{m.title}</h4>
                  <p className="t-body mt-2">{m.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
