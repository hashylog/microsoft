"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { THEMES } from "@/lib/chapters";
import { MAX_SCORE, QUESTIONS, ROUND_SIZE, SECONDS, points, rank, type Question } from "@/lib/quiz";

const COLORS = ["var(--ms-red)", "var(--ms-green)", "var(--ms-blue)", "var(--ms-yellow)"];
const BEST_KEY = "ms-quiz-best";

type Round = { q: Question; options: { text: string; correct: boolean }[] };
type Answer = { picked: number | null; correct: boolean; pts: number };
type Phase = "intro" | "play" | "result";

const shuffle = <T,>(list: T[]) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

/** Some com o conteúdo atual e então troca de tela. */
function leave(el: HTMLElement | null, done: () => void) {
  if (!el) return done();
  gsap.to(el, {
    autoAlpha: 0,
    y: reduced() ? 0 : -16,
    duration: reduced() ? 0.15 : 0.3,
    ease: "power2.in",
    onComplete: done,
  });
}

export function Quiz() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [index, setIndex] = useState(0);
  const screen = useRef<HTMLDivElement>(null);

  const start = () => {
    leave(screen.current, () => {
      setRounds(
        shuffle(QUESTIONS)
          .slice(0, ROUND_SIZE)
          .map((q) => ({
          q,
          options: shuffle(q.options.map((text, i) => ({ text, correct: i === q.answer }))),
        })),
      );
      setAnswers([]);
      setIndex(0);
      setPhase("play");
    });
  };

  const next = () => {
    leave(screen.current, () => {
      if (index + 1 < rounds.length) setIndex(index + 1);
      else setPhase("result");
    });
  };

  const score = answers.reduce((s, a) => s + a.pts, 0);

  // Vindo da apresentação pelo link, o <html> ainda carrega o tema claro do último capítulo
  // (variáveis aplicadas inline pelo ChapterNav). O quiz é sempre escuro.
  useEffect(() => {
    const html = document.documentElement;
    Object.keys(THEMES.dark).forEach((k) => html.style.removeProperty(k));
  }, []);

  // A tela anterior saiu com fade; a nova volta visível (antes do paint, então sem piscar).
  useGSAP(() => {
    gsap.set(screen.current, { autoAlpha: 1, y: 0 });
  }, [phase, index]);

  return (
    <main className="relative min-h-dvh overflow-clip bg-[var(--bg)] text-[var(--fg)]">
      <Backdrop />
      <div
        ref={screen}
        className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))] md:max-w-xl"
      >
        {phase === "intro" && <Intro key="intro" onStart={start} />}
        {phase === "play" && rounds[index] && (
          <Play
            key={index}
            round={rounds[index]}
            index={index}
            answers={answers}
            score={score}
            onAnswer={(a) => setAnswers((prev) => [...prev, a])}
            onNext={next}
          />
        )}
        {phase === "result" && <Result key="result" rounds={rounds} answers={answers} score={score} onRestart={start} />}
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Fundo: luzes nas cores do logo flutuando devagar (gradientes, sem filtros). */

function Backdrop() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (reduced()) return;
      gsap.utils
        .selector(root)(".bd-light")
        .forEach((el, i) => {
          gsap.to(el, {
            x: [40, -50, 30, -30][i] + "vw",
            y: [30, 20, -30, -20][i] + "vh",
            duration: 14 + i * 3,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });
    },
    { scope: root },
  );
  const spots = [
    { c: "#F25022", x: "-30%", y: "-20%" },
    { c: "#7FBA00", x: "60%", y: "-25%" },
    { c: "#00A4EF", x: "-35%", y: "60%" },
    { c: "#FFB900", x: "55%", y: "65%" },
  ];
  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {spots.map((s, i) => (
        <span
          key={i}
          className="bd-light absolute size-[90vmax] rounded-full opacity-[0.16] will-change-transform"
          style={{
            left: s.x,
            top: s.y,
            background: `radial-gradient(circle, ${s.c} 0%, transparent 60%)`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`grid grid-cols-2 gap-[6%] ${className}`} aria-hidden>
      {COLORS.map((c) => (
        <span key={c} className="logo-sq block aspect-square" style={{ background: c }} />
      ))}
    </span>
  );
}

function Intro({ onStart }: { onStart: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [best, setBest] = useState(0);

  // Recorde salvo neste aparelho (lido depois de montar, para não divergir do HTML do servidor).
  useEffect(() => {
    const id = requestAnimationFrame(() => setBest(readBest()));
    return () => cancelAnimationFrame(id);
  }, []);

  useGSAP(
    () => {
      const r = reduced();
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      // Sempre fromTo, com o estado final explícito: um `from` usa o estado atual como destino e,
      // se o elemento já estiver escondido (ex.: efeitos rodando duas vezes em dev), ele nunca aparece.
      tl.fromTo(
        ".logo-sq",
        { scale: 0, rotate: r ? 0 : (i) => [-90, 90, 90, -90][i] },
        { scale: 1, rotate: 0, duration: 0.7, stagger: 0.08, ease: "back.out(1.8)" },
      )
        .fromTo(".in-up", { autoAlpha: 0, y: r ? 0 : 28 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.35)
        .fromTo(
          ".in-cta",
          { autoAlpha: 0, scale: r ? 1 : 0.9 },
          { autoAlpha: 1, scale: 1, duration: 0.6, ease: "back.out(2)" },
          0.8,
        );
      if (!r)
        gsap.to(".logo-sq", {
          y: -4,
          duration: 1.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: 0.2,
          delay: 1.2,
        });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex flex-1 flex-col">
      <p className="in-up font-mono text-[11px] tracking-[0.35em] text-[var(--mute)] uppercase">Tech Camps 2026</p>
      <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
        <Logo className="w-24 md:w-28" />
        <h1 className="in-up mt-10 text-[clamp(2.8rem,13vw,4.5rem)] leading-[0.9] font-[800] tracking-[-0.05em]">
          Quiz
          <br />
          Microsoft
        </h1>
        <p className="in-up mt-5 max-w-[28ch] text-base leading-snug text-[var(--mute)] md:text-lg">
          {ROUND_SIZE} perguntas sobre a história que você acabou de ver. Quanto mais rápido acertar, mais pontos.
        </p>
        <ul className="in-up mt-8 flex gap-2 text-xs font-medium md:text-sm">
          <li className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5">{ROUND_SIZE} perguntas</li>
          <li className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5">{SECONDS}s cada</li>
          {best > 0 && <li className="rounded-full border border-white/12 bg-white/5 px-3 py-1.5">Recorde {best.toLocaleString("pt-BR")}</li>}
        </ul>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="in-cta h-16 w-full touch-manipulation rounded-2xl bg-white text-lg font-bold text-[#0D1B2E] shadow-[0_18px_50px_rgba(0,164,239,0.25)] transition-transform active:scale-[0.97]"
      >
        Começar
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

type PlayProps = {
  round: Round;
  index: number;
  answers: Answer[];
  score: number;
  onAnswer: (a: Answer) => void;
  onNext: () => void;
};

function Play({ round, index, answers, score, onAnswer, onNext }: PlayProps) {
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<gsap.core.Tween | null>(null);
  const clock = useRef({ left: 1 });
  const [picked, setPicked] = useState<number | null | undefined>(undefined);
  const answered = picked !== undefined;
  const last = answers[index];
  const total = ROUND_SIZE;

  const choose = (k: number | null) => {
    if (picked !== undefined || answers.length > index) return;
    timer.current?.kill();
    const correct = k !== null && round.options[k].correct;
    const pts = points(correct, clock.current.left * SECONDS);
    setPicked(k);
    onAnswer({ picked: k, correct, pts });

    try {
      navigator.vibrate?.(correct ? 30 : [40, 60, 40]);
    } catch {}

    if (reduced()) return;
    const q = gsap.utils.selector(root);
    const right = q(".pl-opt")[round.options.findIndex((o) => o.correct)];
    gsap.fromTo(
      right,
      { scale: 1 },
      {
        scale: 1.035,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      },
    );
    if (k !== null && !correct) {
      gsap.to(q(".pl-opt")[k], {
        keyframes: { x: [-10, 9, -6, 4, 0] },
        duration: 0.45,
        ease: "none",
      });
    }
  };

  // O cronômetro chama a versão mais recente de `choose` (com o estado atual).
  const onTimeout = useRef(() => {});
  useEffect(() => {
    onTimeout.current = () => choose(null);
  });

  useGSAP(
    () => {
      const r = reduced();
      const bar = root.current!.querySelector<HTMLElement>(".tm-bar")!;
      const count = root.current!.querySelector<HTMLElement>(".tm-count")!;

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(".pl-q .rw", { yPercent: r ? 0 : 110, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.035 })
        // Anima o invólucro: o botão tem transições CSS próprias (cor e opacidade ao responder).
        .fromTo(".pl-in", { autoAlpha: 0, y: r ? 0 : 26 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07 }, 0.2)
        .fromTo(".pl-head", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0);

      // Cronômetro: a barra esvazia e fica vermelha no fim. Ao zerar, conta como erro.
      clock.current.left = 1;
      timer.current = gsap.to(clock.current, {
        left: 0,
        duration: SECONDS,
        ease: "none",
        delay: 0.5,
        onUpdate: () => {
          const left = clock.current.left;
          bar.style.transform = `scaleX(${left})`;
          bar.style.background = left < 0.25 ? "var(--ms-red)" : left < 0.5 ? "var(--ms-yellow)" : "var(--ms-blue)";
          count.textContent = String(Math.ceil(left * SECONDS));
        },
        onComplete: () => onTimeout.current(),
      });
    },
    { scope: root },
  );

  // Depois de responder: curiosidade e botão de seguir sobem; os pontos ganhos "voam".
  useGSAP(
    () => {
      if (!answered) return;
      const r = reduced();
      gsap.fromTo(".pl-after", { autoAlpha: 0, y: r ? 0 : 24 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.15 });
      if (!r && last?.pts) {
        gsap.fromTo(
          ".pl-gain",
          { autoAlpha: 0, y: 10, scale: 0.8 },
          {
            autoAlpha: 1,
            y: -18,
            scale: 1,
            duration: 0.5,
            ease: "back.out(2)",
            onComplete: () =>
              void gsap.to(".pl-gain", {
                autoAlpha: 0,
                y: -34,
                duration: 0.5,
                delay: 0.6,
              }),
          },
        );
      }
    },
    { scope: root, dependencies: [answered] },
  );

  // Pontuação no topo contando até o novo valor.
  const scoreEl = useRef<HTMLSpanElement>(null);
  const shown = useRef({ v: score - (last?.pts ?? 0) });
  useGSAP(() => {
    if (scoreEl.current) scoreEl.current.textContent = Math.round(shown.current.v).toLocaleString("pt-BR");
    gsap.to(shown.current, {
      v: score,
      duration: 0.9,
      ease: "power2.out",
      onUpdate: () => {
        if (scoreEl.current) scoreEl.current.textContent = Math.round(shown.current.v).toLocaleString("pt-BR");
      },
    });
  }, [score]);

  const words = round.q.question.split(" ");

  return (
    <div ref={root} className="flex flex-1 flex-col">
      {/* Topo: progresso em quadradinhos e pontuação */}
      <div className="pl-head flex items-center justify-between gap-4">
        <div className="flex max-w-[16rem] flex-1 gap-1 md:max-w-xs" aria-label={`Pergunta ${index + 1} de ${total}`}>
          {Array.from({ length: total }, (_, i) => {
            const a = answers[i];
            const bg = a ? (a.correct ? "var(--ms-green)" : "var(--ms-red)") : i === index ? "#fff" : "rgba(255,255,255,0.14)";
            return (
              <span
                key={i}
                className={`block aspect-square max-w-2.5 flex-1 rounded-[2px] transition-colors duration-300 ${i === index && !a ? "animate-pulse" : ""}`}
                style={{ background: bg }}
              />
            );
          })}
        </div>
        <div className="relative font-mono text-sm tabular-nums">
          <span ref={scoreEl} />
          <span className="text-[var(--mute)]"> pts</span>
          <span className="pl-gain invisible absolute top-0 right-0 font-bold text-[var(--ms-green)]">+{last?.pts ?? 0}</span>
        </div>
      </div>

      {/* Cronômetro */}
      <div className="mt-5 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <span className="tm-bar block h-full origin-left rounded-full bg-[var(--ms-blue)]" />
        </div>
        <span className="tm-count w-6 text-right font-mono text-sm tabular-nums">{SECONDS}</span>
      </div>

      {/* Pergunta */}
      <div className="flex flex-1 flex-col justify-center py-6 md:py-8">
        <p className="font-mono text-[11px] tracking-[0.35em] text-[var(--mute)] uppercase">
          Pergunta {index + 1} / {total}
        </p>
        <h2 className="pl-q mt-3 text-[clamp(1.6rem,7.2vw,2.4rem)] leading-[1.08] font-[750] tracking-[-0.03em]" aria-label={round.q.question}>
          {words.map((w, i) => (
            <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <span className="rw inline-block">{w}&nbsp;</span>
            </span>
          ))}
        </h2>
      </div>

      {/* Opções */}
      <div className="grid gap-2.5 md:gap-3" role="group" aria-label="Opções">
        {round.options.map((opt, k) => {
          const isPicked = picked === k;
          const state = !answered ? "idle" : opt.correct ? "right" : isPicked ? "wrong" : "dim";
          return (
            <div key={opt.text} className="pl-in">
              <button
                type="button"
                disabled={answered}
                onClick={() => choose(k)}
                data-state={state}
                className="pl-opt group flex min-h-[3.5rem] md:min-h-[3.75rem] w-full touch-manipulation items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-left text-[1.05rem] font-semibold backdrop-blur-sm transition-[background-color,border-color,opacity] duration-300 active:scale-[0.98] disabled:active:scale-100 data-[state=dim]:opacity-35 data-[state=right]:border-[var(--ms-green)] data-[state=right]:bg-[color-mix(in_srgb,var(--ms-green)_22%,transparent)] data-[state=wrong]:border-[var(--ms-red)] data-[state=wrong]:bg-[color-mix(in_srgb,var(--ms-red)_22%,transparent)] md:hover:enabled:bg-white/[0.11]"
              >
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-md text-xs font-bold text-white"
                  style={{ background: state === "right" ? "var(--ms-green)" : state === "wrong" ? "var(--ms-red)" : COLORS[k] }}
                  aria-hidden
                >
                  {state === "right" ? "✓" : state === "wrong" ? "✕" : ""}
                </span>
                <span>{opt.text}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Depois da resposta */}
      {answered && (
        <div className="pl-after mt-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p
              className="text-sm font-bold"
              style={{
                color: last?.correct ? "var(--ms-green)" : picked === null ? "var(--ms-yellow)" : "var(--ms-red)",
              }}
            >
              {last?.correct ? "Acertou!" : picked === null ? "Tempo esgotado" : "Não foi dessa vez"}
            </p>
            <p className="mt-1 text-sm leading-snug text-[var(--mute)]">{round.q.fact}</p>
          </div>
          <button
            type="button"
            onClick={onNext}
            // Fica preso no rodapé da tela: em celulares baixos, a curiosidade não empurra o botão para fora.
            className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] mt-3 h-14 w-full shadow-[0_-12px_40px_rgba(13,27,46,0.9)] touch-manipulation rounded-2xl bg-white text-base font-bold text-[#0D1B2E] transition-transform active:scale-[0.97]"
          >
            {index + 1 < total ? "Próxima" : "Ver resultado"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

type ResultProps = {
  rounds: Round[];
  answers: Answer[];
  score: number;
  onRestart: () => void;
};

function Result({ rounds, answers, score, onRestart }: ResultProps) {
  const root = useRef<HTMLDivElement>(null);
  const scoreEl = useRef<HTMLSpanElement>(null);
  const hits = answers.filter((a) => a.correct).length;
  const { title, line } = rank(hits);
  const [best, setBest] = useState(0);
  const [shared, setShared] = useState(false);

  // Guarda o recorde neste aparelho.
  useEffect(() => {
    const prev = readBest();
    try {
      if (score > prev) localStorage.setItem(BEST_KEY, String(score));
    } catch {}
    const id = requestAnimationFrame(() => setBest(Math.max(prev, score)));
    return () => cancelAnimationFrame(id);
  }, [score]);

  useGSAP(
    () => {
      const r = reduced();
      const n = { v: 0 };
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(".rs-in", { autoAlpha: 0, y: r ? 0 : 24 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 })
        .to(
          n,
          {
            v: score,
            duration: r ? 0.01 : 1.6,
            ease: "power2.out",
            onUpdate: () => {
              if (scoreEl.current) scoreEl.current.textContent = Math.round(n.v).toLocaleString("pt-BR");
            },
          },
          0.2,
        )
        .fromTo(".rs-item", { autoAlpha: 0, x: r ? 0 : -16 }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.05 }, 0.8);

      // Confete de quadradinhos nas cores do logo.
      if (!r && hits > 0) {
        gsap.utils.toArray<HTMLElement>(".rs-confetti").forEach((el) => {
          const angle = gsap.utils.random(-Math.PI, 0);
          const dist = gsap.utils.random(120, Math.max(window.innerWidth, 420) * 0.6);
          gsap
            .timeline({ delay: gsap.utils.random(0.1, 0.4) })
            .fromTo(
              el,
              { x: 0, y: 0, scale: 0, rotate: 0, autoAlpha: 1 },
              {
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist,
                scale: gsap.utils.random(0.6, 1.2),
                rotate: gsap.utils.random(-360, 360),
                duration: 0.9,
                ease: "power3.out",
              },
            )
            .to(el, {
              y: `+=${gsap.utils.random(300, 700)}`,
              rotate: `+=${gsap.utils.random(-180, 180)}`,
              autoAlpha: 0,
              duration: gsap.utils.random(1.4, 2.4),
              ease: "power1.in",
            });
        });
      }
    },
    { scope: root },
  );

  const share = async () => {
    const text = `Fiz ${score.toLocaleString("pt-BR")} pontos (${hits}/${rounds.length}) no Quiz Microsoft. Consegue me passar?`;
    try {
      if (navigator.share)
        await navigator.share({
          title: "Quiz Microsoft",
          text,
          url: location.href,
        });
      else {
        await navigator.clipboard.writeText(`${text} ${location.href}`);
        setShared(true);
      }
    } catch {}
  };

  return (
    <div ref={root} className="relative flex flex-1 flex-col">
      <div aria-hidden className="pointer-events-none absolute top-[22%] left-1/2 z-10">
        {Array.from({ length: 36 }, (_, i) => (
          <span key={i} className="rs-confetti invisible absolute block size-2.5 rounded-[2px]" style={{ background: COLORS[i % 4] }} />
        ))}
      </div>

      <div className="flex flex-col items-center pt-6 text-center">
        <Logo className="rs-in w-14" />
        <p className="rs-in mt-8 font-mono text-[11px] tracking-[0.35em] text-[var(--mute)] uppercase">Resultado</p>
        <p className="rs-in mt-3 text-[clamp(3.5rem,18vw,5.5rem)] leading-none font-[800] tracking-[-0.05em] tabular-nums">
          <span ref={scoreEl}>0</span>
        </p>
        <p className="rs-in mt-1 text-sm text-[var(--mute)]">
          de {MAX_SCORE.toLocaleString("pt-BR")} pontos · {hits}/{rounds.length} acertos
        </p>
        <h2 className="rs-in mt-6 text-[clamp(1.8rem,8vw,2.6rem)] leading-none font-[750] tracking-[-0.035em]">{title}</h2>
        <p className="rs-in mt-2 max-w-[30ch] text-[var(--mute)]">{line}</p>
        {best > 0 && <p className="rs-in mt-3 font-mono text-xs text-[var(--mute)]">Recorde neste aparelho: {best.toLocaleString("pt-BR")}</p>}
      </div>

      <ol className="mt-8 grid gap-2">
        {rounds.map((r, i) => {
          const a = answers[i];
          return (
            <li key={i} className="rs-item flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.04] px-3.5 py-3 text-sm">
              <span
                className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-[4px] text-[10px] font-bold text-white"
                style={{
                  background: a?.correct ? "var(--ms-green)" : "var(--ms-red)",
                }}
                aria-label={a?.correct ? "Acertou" : "Errou"}
              >
                {a?.correct ? "✓" : "✕"}
              </span>
              <span className="leading-snug">
                {r.q.question}
                <span className="block text-[var(--mute)]">{r.q.options[r.q.answer]}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="sticky bottom-0 mt-6 grid grid-cols-2 gap-3 pt-3 pb-1">
        <button
          type="button"
          onClick={share}
          className="h-14 touch-manipulation rounded-2xl border border-white/15 bg-[var(--bg)]/80 text-base font-bold backdrop-blur-md transition-transform active:scale-[0.97]"
        >
          {shared ? "Copiado!" : "Compartilhar"}
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="h-14 touch-manipulation rounded-2xl bg-white text-base font-bold text-[#0D1B2E] transition-transform active:scale-[0.97]"
        >
          Jogar de novo
        </button>
      </div>
    </div>
  );
}
