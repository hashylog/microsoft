"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { beatSequence, enterTimeline, holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { ScrollMedia, type MediaHandle } from "@/components/ScrollMedia";
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

const BEATS = [
  { title: "Azure", text: "A nuvem que roda aplicativos de empresas, governos e da própria Microsoft." },
  { title: "Perto de quem usa", text: "Datacenters distribuídos pelo mundo, para que os dados fiquem próximos das pessoas e das leis de cada país." },
  { title: "Onde a IA é treinada", text: "Da hospedagem de um site ao treinamento de grandes modelos de linguagem, na mesma plataforma." },
];

export function Azure() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<MediaHandle>(null);

  useScene(root, ({ reduce }) => {
    const q = gsap.utils.selector(root);
    const counter = q(".az-count")[0] as HTMLElement;
    const count = { v: 0 };

    const enter = enterTimeline(root.current!);
    enter.from(q(".az-beat-0 .rw"), { yPercent: 110, stagger: 0.08, duration: 0.6, ease: "power3.out" }, 0.2);

    const tl = pinTimeline(root.current!, q(".az-stage")[0], 3, (p) => media.current?.setProgress(p));

    tl.fromTo(q(".az-map"), { scale: reduce ? 1 : 1.5 }, { scale: 1, duration: 3, ease: "power2.out" }, 0)
      .fromTo(q(".az-node"), { scale: 0 }, { scale: 1, duration: 0.4, stagger: { each: 0.06, from: "random" }, ease: "back.out(2)" }, 0.2)
      .fromTo(q(".az-edge"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, stagger: { each: 0.04, from: "random" } }, 1.2)
      .fromTo(q(".az-hub"), { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.15 }, 3)
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
      .fromTo(q(".az-media"), { autoAlpha: 0.15 }, { autoAlpha: 0.55, duration: 2 }, 5.2)
      .to(q(".az-map"), { scale: reduce ? 1 : 0.85, autoAlpha: 0.5, duration: 2 }, 5.2);

    beatSequence(tl, q(".az-beat"), [0, 3.2, 6.2], { reduce });
    holdUntil(tl, 8);
  });

  return (
    <section ref={root} id="azure" aria-labelledby="azure-title">
      <div className="az-stage relative h-svh overflow-hidden">
        <div className="az-media absolute inset-0 opacity-15">
          <ScrollMedia ref={media} slot="AZURE_DATACENTER_FLYTHROUGH" tone="dark" className="h-full w-full" />
        </div>

        <svg
          className="az-map absolute inset-0 m-auto h-[62svh] w-full md:h-[78svh] md:w-[78vw] md:translate-x-[10vw]"
          viewBox="0 0 1000 560"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
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
    </section>
  );
}
