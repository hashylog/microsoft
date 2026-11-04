"use client";

import { useRef, type CSSProperties } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { THEMES } from "@/lib/chapters";
import { beatSequence, enterTimeline, holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { RevealText } from "@/components/RevealText";

// Rede determinística (mesma no servidor e no cliente): pontos + 2 vizinhos mais próximos.
function buildNetwork(count: number, seed: number) {
  let s = seed;
  const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const nodes = Array.from({ length: count }, () => ({
    x: Math.round(60 + rand() * 880),
    y: Math.round(50 + rand() * 460),
  }));
  const edges = new Set<string>();
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
      .filter(({ j }) => j !== i)
      .sort((m, n) => m.d - n.d)
      .slice(0, 2)
      .forEach(({ j }) => edges.add([Math.min(i, j), Math.max(i, j)].join("-")));
  });
  return {
    nodes,
    edges: [...edges].map((e) => e.split("-").map(Number) as [number, number]),
  };
}

const NETWORK = buildNetwork(34, 20101);
const HUBS = new Set([3, 11, 19, 27]);
/** Hub em que a câmera aproxima no terceiro texto. */
const FOCUS_HUB = 19;
/** Pacotes de dados correndo pelas conexões (cada um numa aresta). */
const PACKETS = NETWORK.edges.filter((_, i) => i % 3 === 0);

/** Loop de 16 s (início do filme do Azure) que toca sozinho, sem depender do scroll. */
const LOOP_SRC = "/videos/azure_loop.mp4";

// Duração da cena: unidades da timeline espalhadas por SCREENS alturas de tela.
const UNITS = 14;
const SCREENS = 6.5;
// No fim, a cena continua fixa por OVERLAP_SCREENS enquanto o Copilot sobe por cima.
const OVERLAP_SCREENS = 1;
const TOTAL_SCREENS = SCREENS + OVERLAP_SCREENS;
const TOTAL_UNITS = (UNITS * TOTAL_SCREENS) / SCREENS;

const BEATS = [
  { title: "Azure", text: "A nuvem que roda aplicativos de empresas, governos e da própria Microsoft." },
  { title: "Perto de quem usa", text: "Datacenters distribuídos pelo mundo, para que os dados fiquem próximos das pessoas e das leis de cada país." },
  { title: "Onde a IA é treinada", text: "Da hospedagem de um site ao treinamento de grandes modelos de linguagem, na mesma plataforma." },
  { title: "Tudo conectado", text: "As regiões se ligam por uma rede privada de fibra da própria Microsoft, uma das maiores do mundo." },
];
const BEAT_AT = [0, 3.4, 6.8, 10.2];

export function Azure() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useScene(root, ({ reduce }) => {
    const q = gsap.utils.selector(root);
    const counter = q(".az-count")[0] as HTMLElement;
    const count = { v: 0 };
    const hub = NETWORK.nodes[FOCUS_HUB];

    const enter = enterTimeline(root.current!);
    enter.from(q(".az-beat-0 .rw"), { yPercent: 110, stagger: 0.08, duration: 0.6, ease: "power3.out" }, 0.2);

    const tl = pinTimeline(root.current!, q(".az-stage")[0], TOTAL_SCREENS);

    // 1. A rede se monta: aproximação, pontos e conexões.
    tl.fromTo(q(".az-map"), { scale: reduce ? 1 : 1.5 }, { scale: 1, duration: 3, ease: "power2.out" }, 0)
      .fromTo(q(".az-node"), { scale: 0 }, { scale: 1, duration: 0.4, stagger: { each: 0.06, from: "random" }, ease: "back.out(2)" }, 0.2)
      .fromTo(q(".az-edge"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, stagger: { each: 0.04, from: "random" } }, 1.2);

    // 2. Regiões: hubs, contador e os dados começam a circular.
    tl.fromTo(q(".az-hub"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.15 }, 3)
      .fromTo(q(".az-stat"), { autoAlpha: 0, y: reduce ? 0 : 20 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 3)
      .fromTo(
        count,
        { v: 0 },
        {
          v: 60,
          duration: 2,
          ease: "power1.out",
          onUpdate: () => {
            counter.textContent = String(Math.round(count.v));
          },
        },
        3,
      )
      .fromTo(q(".az-packets"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1 }, 4);

    // 3. IA: a câmera mergulha num hub, que pulsa; o resto da rede escurece.
    tl.to(q(".az-world"), { scale: reduce ? 1 : 2.4, svgOrigin: `${hub.x} ${hub.y}`, duration: 2.4, ease: "power2.inOut" }, 6.4)
      .to(q(".az-edge, .az-node"), { opacity: 0.35, duration: 1.2 }, 6.6)
      .to(q(".az-stat"), { autoAlpha: 0, y: reduce ? 0 : -16, duration: 0.6 }, 6.4)
      .fromTo(q(".az-focus-ring"), { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2, stagger: 0.35, ease: "power2.out" }, 7.6);

    // 4. Tudo conectado: volta para a rede inteira, agora acesa.
    tl.to(q(".az-focus-ring"), { autoAlpha: 0, duration: 0.6 }, 9.8)
      .to(q(".az-world"), { scale: 1, svgOrigin: `${hub.x} ${hub.y}`, duration: 2.2, ease: "power2.inOut" }, 9.8)
      .to(q(".az-node"), { opacity: 1, duration: 1 }, 10.4)
      .to(q(".az-edge"), { opacity: 1, strokeOpacity: 0.95, strokeWidth: 1.8, duration: 1.4, stagger: { each: 0.02, from: "center" } }, 10.6)
      .fromTo(q(".az-glow"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.4 }, 10.8);

    beatSequence(tl, q(".az-beat"), BEAT_AT, { reduce });
    holdUntil(tl, UNITS);

    // 5. O Copilot sobe por cima: a cena recua e escurece por trás.
    tl.to(q(".az-inner"), { scale: reduce ? 1 : 0.92, duration: TOTAL_UNITS - UNITS, ease: "none" }, UNITS)
      .fromTo(q(".az-dim"), { opacity: 0 }, { opacity: 0.65, duration: TOTAL_UNITS - UNITS, ease: "none" }, UNITS);

    // Vivo mesmo com o scroll parado: pacotes de dados correndo pelas conexões.
    const idle = reduce
      ? []
      : q<SVGCircleElement>(".az-packet").map((el, i) => {
          const [a, b] = PACKETS[i];
          const from = NETWORK.nodes[i % 2 ? b : a];
          const to = NETWORK.nodes[i % 2 ? a : b];
          const d = 1.4 + (i % 5) * 0.35;
          return gsap
            .timeline({ repeat: -1, repeatDelay: 0.4 + (i % 4) * 0.5, delay: (i % 7) * 0.3 })
            .fromTo(el, { attr: { cx: from.x, cy: from.y } }, { attr: { cx: to.x, cy: to.y }, duration: d, ease: "power1.inOut" }, 0)
            .fromTo(el, { opacity: 0 }, { opacity: 1, duration: d * 0.2 }, 0)
            .to(el, { opacity: 0, duration: d * 0.25 }, d * 0.75);
        });

    // Loop e pacotes só rodam enquanto a cena está na tela.
    const v = video.current;
    ScrollTrigger.create({
      trigger: root.current,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        idle.forEach((t) => (self.isActive ? t.resume() : t.pause()));
        if (!v) return;
        if (self.isActive) v.play().catch(() => {});
        else v.pause();
      },
    });
  });

  return (
    // A margem negativa faz a próxima seção começar a subir enquanto esta ainda está fixada.
    // Tema escuro próprio: a troca global para o tema claro (quando o Copilot entra) não a afeta.
    <section
      ref={root}
      id="azure"
      aria-labelledby="azure-title"
      style={{ ...THEMES.dark, color: "var(--fg)", marginBottom: `-${OVERLAP_SCREENS * 100}svh` } as CSSProperties}
    >
      <div className="az-stage relative h-svh overflow-hidden bg-[var(--bg)]">
        <div className="az-inner absolute inset-0 will-change-transform">
          {/* Feixes de luz do filme, mesclados ao azul-marinho do tema. */}
          <video
            ref={video}
            className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-screen"
            src={LOOP_SRC}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(90deg, var(--bg) 0%, color-mix(in srgb, var(--bg) 70%, transparent) 35%, transparent 70%)" }}
            aria-hidden
          />

          <svg
            className="az-map absolute inset-0 m-auto h-[62svh] w-full md:h-[78svh] md:w-[78vw] md:translate-x-[10vw]"
            viewBox="0 0 1000 560"
            preserveAspectRatio="xMidYMid meet"
            overflow="visible"
            aria-hidden
          >
            <defs>
              <radialGradient id="az-glow-fill">
                <stop offset="0%" stopColor="var(--ms-blue)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--ms-blue)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g className="az-world">
              <ellipse className="az-glow" cx={500} cy={280} rx={520} ry={300} fill="url(#az-glow-fill)" />
              {NETWORK.edges.map(([a, b]) => (
                <line
                  key={`${a}-${b}`}
                  className="az-edge"
                  x1={NETWORK.nodes[a].x}
                  y1={NETWORK.nodes[a].y}
                  x2={NETWORK.nodes[b].x}
                  y2={NETWORK.nodes[b].y}
                  stroke="var(--ms-blue)"
                  strokeOpacity={0.55}
                  strokeWidth={1.2}
                  pathLength={1}
                  strokeDasharray="1"
                />
              ))}
              <g className="az-packets">
                {PACKETS.map(([a], i) => (
                  <circle key={i} className="az-packet" cx={NETWORK.nodes[a].x} cy={NETWORK.nodes[a].y} r={2.6} fill="#9FD4FF" opacity={0} />
                ))}
              </g>
              {[0, 1, 2].map((i) => (
                <circle
                  key={i}
                  className="az-focus-ring"
                  cx={NETWORK.nodes[FOCUS_HUB].x}
                  cy={NETWORK.nodes[FOCUS_HUB].y}
                  r={22 + i * 14}
                  fill="none"
                  stroke="var(--ms-blue)"
                  strokeOpacity={0.8 - i * 0.22}
                  strokeWidth={0.8}
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
              ))}
              {NETWORK.nodes.map((n, i) => (
                <g key={i} transform={`translate(${n.x} ${n.y})`}>
                  {HUBS.has(i) && (
                    <circle className="az-hub" r={16} fill="none" stroke="var(--ms-blue)" strokeWidth={1} style={{ transformBox: "fill-box", transformOrigin: "center" }} />
                  )}
                  <rect
                    className="az-node"
                    x={-4}
                    y={-4}
                    width={8}
                    height={8}
                    fill={HUBS.has(i) ? "var(--ms-blue)" : "var(--fg)"}
                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  />
                </g>
              ))}
            </g>
          </svg>

          <div className="relative z-10 flex h-full flex-col justify-between px-4 pt-24 pb-16 md:justify-center md:px-12 md:py-0">
            <div className="beats md:max-w-[32vw]">
              {BEATS.map((beat, i) => (
                <div key={i} className={`az-beat az-beat-${i}`}>
                  {i === 0 ? (
                    <h2 id="azure-title" className="t-title">
                      <RevealText text={beat.title} />
                    </h2>
                  ) : (
                    <h3 className="t-heading max-w-[16ch]">{beat.title}</h3>
                  )}
                  <p className="t-body mt-5">{beat.text}</p>
                </div>
              ))}
            </div>

            <p className="az-stat invisible md:absolute md:right-24 md:bottom-16 lg:right-28">
              <span className="block text-[clamp(3.5rem,8vw,7rem)] leading-none font-[750] tracking-[-0.05em] tabular-nums">
                <span className="az-count">60</span>+
              </span>
              <span className="mt-2 block text-sm text-[var(--mute)]">regiões de datacenter anunciadas no mundo</span>
            </p>
          </div>
        </div>
        <div className="az-dim pointer-events-none absolute inset-0 bg-black opacity-0" aria-hidden />
      </div>
    </section>
  );
}
