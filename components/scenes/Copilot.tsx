"use client";

import { Fragment, useRef, type CSSProperties } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { THEMES } from "@/lib/chapters";
import { enterTimeline, holdUntil, pinTimeline, useScene } from "@/lib/scene";

// Paleta do orbe (tons inspirados no Copilot, sem usar o logo).
const AURORA = ["#3B82F6", "#22D3EE", "#84CC16", "#FBBF24", "#F472B6", "#8B5CF6"];

// Manchas de cor dentro do orbe: posição inicial (% do orbe) e cor.
const BLOBS = [
  { x: -10, y: -8, c: AURORA[0] },
  { x: 38, y: -14, c: AURORA[1] },
  { x: 42, y: 40, c: AURORA[2] },
  { x: 8, y: 52, c: AURORA[3] },
  { x: -18, y: 24, c: AURORA[4] },
  { x: 20, y: 14, c: AURORA[5] },
];

const PROMPT = "Copilot, me conta a história da Microsoft em três frases.";

// Resposta: palavras entre *asteriscos* ganham o gradiente.
const ANSWER = [
  "Em 1975, dois amigos fundaram a Microsoft com uma ideia: *um computador em cada mesa e em cada casa.*",
  "Windows e Office levaram essa ideia a *mais de um bilhão de pessoas,* e o Azure a levou *para a nuvem.*",
  "Hoje, a inteligência artificial transforma cada computador em *um copiloto.*",
];

const APPS = ["Windows", "Word", "Excel", "PowerPoint", "Outlook", "Teams", "Edge"];

// Duração da cena em unidades da timeline, espalhadas por SCREENS alturas de tela.
const UNITS = 16.6;
const SCREENS = 10;
const ANSWER_AT = [6.2, 8.4, 10.6];

/** Separa a frase em palavras, marcando as que ficam entre *asteriscos*. */
function parseAnswer(text: string) {
  let hl = false;
  return text.split(" ").map((raw) => {
    if (raw.startsWith("*")) hl = true;
    const word = { text: raw.replaceAll("*", ""), hl };
    if (raw.length > 1 && raw.endsWith("*")) hl = false;
    return word;
  });
}

const ANSWER_WORDS = ANSWER.map(parseAnswer);

function Answer({ i }: { i: number }) {
  const words = ANSWER_WORDS[i];
  return (
    <p className={`cp-answer cp-answer-${i} t-heading max-w-[22ch] text-center`} aria-label={words.map((w) => w.text).join(" ")}>
      {words.map((w, j) => (
        <Fragment key={j}>
          <span aria-hidden className={`cp-w inline-block ${w.hl ? "aurora-text" : ""}`}>
            {w.text}
          </span>
          {j < words.length - 1 && " "}
        </Fragment>
      ))}
    </p>
  );
}

export function Copilot() {
  const root = useRef<HTMLElement>(null);

  useScene(root, ({ reduce }) => {
    const q = gsap.utils.selector(root);
    const m = reduce ? 0 : 1;
    const typed = q(".cp-typed")[0] as HTMLElement;
    const chars = { n: 0 };
    const orbit = { r: 0, a: 0 };

    // Enquanto a seção sobe por cima do Azure: título e orbe surgem.
    const enter = enterTimeline(root.current!);
    enter
      .from(q(".cp-title-word"), { yPercent: 110, duration: 0.8, ease: "power3.out" }, 0.15)
      .fromTo(q(".cp-orb"), { scale: reduce ? 1 : 0.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, ease: "power2.out" }, 0)
      .from(q(".cp-sub"), { autoAlpha: 0, y: 16 * m, duration: 0.5 }, 0.6);

    const tl = pinTimeline(root.current!, q(".cp-stage")[0], SCREENS);

    // Ato 1 → 2: o título sobe e some; o orbe encolhe e vai para cima.
    tl.to(q(".cp-title"), { yPercent: -60 * m, autoAlpha: 0, filter: `blur(${10 * m}px)`, duration: 1.2, ease: "power2.in" }, 1.6)
      .to(q(".cp-sub"), { autoAlpha: 0, duration: 0.6 }, 1.6)
      .to(q(".cp-orb"), { scale: 0.42, y: reduce ? 0 : "-24vh", duration: 1.6, ease: "power3.inOut" }, 1.8);

    // Ato 2: a pergunta é digitada pelo scroll (e apagada ao voltar).
    tl.fromTo(q(".cp-ask"), { autoAlpha: 0, y: 30 * m }, { autoAlpha: 1, y: 0, duration: 0.6 }, 2.8)
      .fromTo(
        chars,
        { n: 0 },
        {
          n: PROMPT.length,
          duration: 2,
          onUpdate: () => {
            typed.textContent = PROMPT.slice(0, Math.round(chars.n));
          },
        },
        3,
      )
      // O orbe "pensa": anel de luz gira e ele pulsa.
      .fromTo(q(".cp-ring"), { autoAlpha: 0, rotate: 0 }, { autoAlpha: 1, rotate: 720, duration: 1.6, ease: "power1.inOut" }, 5)
      .to(q(".cp-orb"), { scale: 0.5, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut" }, 5.2)
      .to(q(".cp-ring"), { autoAlpha: 0, duration: 0.4 }, 6.4)
      .to(q(".cp-ask"), { autoAlpha: 0, y: -30 * m, filter: `blur(${6 * m}px)`, duration: 0.6, ease: "power2.in" }, 5.6);

    // Ato 3: a resposta, uma frase por vez, palavra por palavra saindo do desfoque.
    q<HTMLElement>(".cp-answer").forEach((sentence, i) => {
      const words = sentence.querySelectorAll(".cp-w");
      const at = ANSWER_AT[i];
      tl.fromTo(sentence, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, at).fromTo(
        words,
        { opacity: 0.06, y: 14 * m, filter: `blur(${10 * m}px)` },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, stagger: 0.07, ease: "power2.out" },
        at,
      );
      tl.to(sentence, { autoAlpha: 0, y: -24 * m, filter: `blur(${8 * m}px)`, duration: 0.5, ease: "power2.in" }, (ANSWER_AT[i + 1] ?? 12.6) - 0.6);
    });
    tl.fromTo(q(".cp-label-answer"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 6)
      .fromTo(q(".cp-source"), { autoAlpha: 0, y: 10 * m }, { autoAlpha: 1, y: 0, duration: 0.5 }, 11.4)
      .to(q(".cp-label-answer, .cp-source"), { autoAlpha: 0, duration: 0.4 }, 12.1);

    // Ato 4: o orbe volta ao centro e os apps entram em órbita.
    tl.to(q(".cp-orb"), { scale: 0.62, y: 0, duration: 1.4, ease: "power3.inOut" }, 12.2)
      .fromTo(orbit, { r: 0, a: 0 }, { r: 1, a: 1, duration: 1.6, ease: "power3.out" }, 12.6)
      .fromTo(q(".cp-everywhere"), { autoAlpha: 0, y: 24 * m }, { autoAlpha: 1, y: 0, duration: 0.7 }, 12.9);

    // Saída: a órbita se abre e o orbe cresce até cobrir a tela, entregando para o Futuro.
    tl.to(q(".cp-everywhere"), { autoAlpha: 0, duration: 0.5 }, 14.8)
      .to(orbit, { r: 2.4, a: 0, duration: 1.2, ease: "power2.in" }, 14.8)
      .to(q(".cp-orb"), { scale: reduce ? 1 : 9, duration: 1.4, ease: "power2.in" }, 15)
      .to(q(".cp-orb"), { autoAlpha: 0, duration: 0.5 }, 16.1);

    holdUntil(tl, UNITS);

    // Órbita dos apps: gira sozinha; profundidade pela posição na elipse.
    const pills = q<HTMLElement>(".cp-app");
    let angle = 0;
    let active = false;
    const spin = (_t: number, dt: number) => {
      if (!active) return;
      angle += dt * (reduce ? 0 : 0.00022);
      const R = Math.min(window.innerWidth * 0.38, 560) * orbit.r;
      pills.forEach((el, i) => {
        const t = angle + (i / pills.length) * Math.PI * 2;
        const depth = Math.sin(t); // 1 = na frente do orbe
        const s = 0.78 + 0.22 * (depth + 1) * 0.5;
        el.style.transform = `translate(-50%, -50%) translate3d(${Math.cos(t) * R}px, ${depth * R * 0.3}px, 0) scale(${s})`;
        el.style.opacity = String(orbit.a * (0.45 + 0.55 * (depth + 1) * 0.5));
        el.style.zIndex = depth > 0 ? "3" : "1";
      });
    };
    gsap.ticker.add(spin);

    // Orbe vivo: manchas de cor flutuando sozinhas e o orbe seguindo o mouse.
    const idle = reduce
      ? []
      : q<HTMLElement>(".cp-blob").map((el, i) =>
          gsap.to(el, {
            x: `${[22, -26, -20, 24, 28, -18][i]}%`,
            y: `${[18, 24, -22, -26, -14, 20][i]}%`,
            scale: [1.25, 0.85, 1.2, 0.9, 1.15, 0.8][i],
            duration: 3.2 + i * 0.7,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          }),
        );
    if (!reduce) idle.push(gsap.to(q(".cp-glow"), { rotate: 360, duration: 18, ease: "none", repeat: -1 }));

    const follow = { duration: 1.6, ease: "power3.out" };
    const wrap = q(".cp-orb-wrap")[0];
    const moveX = gsap.quickTo(wrap, "x", follow);
    const moveY = gsap.quickTo(wrap, "y", follow);
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduce) return;
      moveX((e.clientX / window.innerWidth - 0.5) * 40);
      moveY((e.clientY / window.innerHeight - 0.5) * 28);
    };
    window.addEventListener("pointermove", onPointer);

    // Só anima enquanto a cena está na tela.
    ScrollTrigger.create({
      trigger: root.current,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        active = self.isActive;
        idle.forEach((t) => (self.isActive ? t.resume() : t.pause()));
      },
    });

    return () => {
      gsap.ticker.remove(spin);
      window.removeEventListener("pointermove", onPointer);
    };
  });

  return (
    // Tema claro próprio e fundo opaco: a seção sobe por cima do Azure, que fica fixado atrás.
    <section
      ref={root}
      id="copilot"
      aria-labelledby="copilot-title"
      className="relative z-10 shadow-[0_-24px_60px_rgba(0,0,0,0.35)]"
      style={{ ...THEMES.light, background: "var(--bg)", color: "var(--fg)" } as CSSProperties}
    >
      <div className="cp-stage relative h-svh overflow-hidden">
        {/* Orbe */}
        <div className="cp-orb-wrap absolute top-1/2 left-1/2 z-[2] -translate-x-1/2 -translate-y-1/2">
          <div className="cp-orb relative size-[min(62vmin,560px)] will-change-transform">
            <div
              className="cp-glow absolute -inset-[18%] rounded-full opacity-60 blur-3xl"
              style={{ background: `conic-gradient(${[...AURORA, AURORA[0]].join(", ")})` }}
              aria-hidden
            />
            <div className="absolute inset-0 overflow-hidden rounded-full bg-white shadow-[inset_0_0_60px_rgba(255,255,255,0.9)]" aria-hidden>
              {BLOBS.map((b, i) => (
                <span
                  key={i}
                  className="cp-blob absolute size-[80%] rounded-full will-change-transform"
                  style={{ left: `${b.x}%`, top: `${b.y}%`, background: `radial-gradient(circle, ${b.c} 0%, ${b.c}00 68%)` }}
                />
              ))}
              <span
                className="absolute inset-0 rounded-full"
                style={{ background: "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.9), rgba(255,255,255,0) 42%)" }}
              />
            </div>
            <div
              className="cp-ring invisible absolute -inset-[7%] rounded-full"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, ${AURORA[0]} 60deg, ${AURORA[4]} 120deg, transparent 200deg)`,
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
              }}
              aria-hidden
            />
          </div>
        </div>

        {/* Apps em órbita */}
        {APPS.map((app) => (
          <span
            key={app}
            className="cp-app absolute top-1/2 left-1/2 rounded-full border border-white/80 bg-white/60 px-5 py-2.5 text-[clamp(0.95rem,1.6vw,1.35rem)] font-semibold tracking-[-0.01em] whitespace-nowrap opacity-0 shadow-[0_10px_30px_rgba(20,35,58,0.12)] backdrop-blur-md"
          >
            {app}
          </span>
        ))}

        {/* Ato 1: título */}
        <div className="pointer-events-none absolute inset-0 z-[3] flex flex-col items-center justify-center px-4 text-center">
          <h2 id="copilot-title" className="cp-title t-display overflow-hidden pb-[0.1em]">
            <span className="cp-title-word aurora-text inline-block">Copilot</span>
          </h2>
        </div>
        <p className="cp-sub t-body absolute inset-x-4 bottom-[9svh] z-[3] mx-auto max-w-[34ch] text-center font-medium text-[var(--fg)]">
          Um assistente de IA presente no Windows, no Microsoft 365 e no Edge.
        </p>

        {/* Ato 2: a pergunta */}
        <div className="cp-ask invisible absolute inset-x-4 top-[46%] z-[3] text-center md:inset-x-[12vw]">
          <p className="font-mono text-[11px] tracking-[0.35em] text-[var(--mute)] uppercase md:text-xs">Você</p>
          <p className="t-heading mx-auto mt-4 max-w-[24ch]" aria-label={PROMPT}>
            <span className="cp-typed" aria-hidden />
            <span className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] animate-pulse bg-[var(--ms-blue)]" aria-hidden />
          </p>
        </div>

        {/* Ato 3: a resposta */}
        <div className="absolute inset-x-4 top-[46%] z-[3] flex flex-col items-center md:inset-x-[10vw]">
          <p className="cp-label-answer invisible font-mono text-[11px] tracking-[0.35em] text-[var(--mute)] uppercase md:text-xs">Copilot</p>
          <div className="beats mt-4 w-full justify-items-center">
            {ANSWER.map((_, i) => (
              <Answer key={i} i={i} />
            ))}
          </div>
          <p className="cp-source invisible mt-8 max-w-[40ch] text-center text-sm text-[var(--mute)]">
            Você continua decidindo: a resposta vem com as fontes, para conferir antes de usar.
          </p>
        </div>

        {/* Ato 4: em todo lugar */}
        <p className="cp-everywhere t-heading invisible absolute inset-x-4 top-[12svh] z-[3] text-center">
          Presente onde você <span className="aurora-text">já trabalha.</span>
        </p>
      </div>
    </section>
  );
}
