"use client";

import { useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { beatSequence, enterTimeline, holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { ScrollMedia, type MediaHandle } from "@/components/ScrollMedia";
import { RevealText } from "@/components/RevealText";

const BEATS = [
  { title: "Xbox", text: "Jogue no console, no PC e na nuvem, com o mesmo perfil e o mesmo progresso." },
  { title: "Uma biblioteca, não uma prateleira", text: "Com o Game Pass, centenas de jogos ficam disponíveis por assinatura, incluindo lançamentos." },
  { title: "Sem console, também dá", text: "Com o jogo na nuvem, a partida roda em servidores e chega à tela que você já tem." },
];

type Game = { file: string; name: string };

// Capas em public/images/xbox (formato de cabeçalho da Steam, 920×430).
const GAMES: readonly Game[] = [
  { file: "alienisolation.png", name: "Alien: Isolation" },
  { file: "cyberpunk.png", name: "Cyberpunk 2077" },
  { file: "farcry3.png", name: "Far Cry 3" },
  { file: "gtav.png", name: "Grand Theft Auto V" },
  { file: "lifeisstrange.png", name: "Life is Strange" },
  { file: "limbo.png", name: "Limbo" },
  { file: "outlast.png", name: "Outlast" },
  { file: "portal2.png", name: "Portal 2" },
  { file: "reddeadredemptionii.png", name: "Red Dead Redemption 2" },
  { file: "sekiro.png", name: "Sekiro: Shadows Die Twice" },
  { file: "terraria.png", name: "Terraria" },
];
const FIRST_ROW = 6;

// Ordem embaralhada uma vez por carregamento da página. O servidor sempre
// usa a ordem fixa; o navegador troca pela embaralhada logo na hidratação.
let shuffledGames: readonly Game[] | null = null;
function getShuffledGames() {
  if (!shuffledGames) {
    const list = [...GAMES];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    shuffledGames = list;
  }
  return shuffledGames;
}
const getServerGames = () => GAMES;
const subscribe = () => () => {};

export function Xbox() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<MediaHandle>(null);
  const games = useSyncExternalStore(subscribe, getShuffledGames, getServerGames);
  const rows = [games.slice(0, FIRST_ROW), games.slice(FIRST_ROW)];

  useScene(root, ({ reduce, mobile }) => {
    const q = gsap.utils.selector(root);
    const k = reduce ? 0 : 1;

    const enter = enterTimeline(root.current!);
    enter.from(q(".xb-beat-0 .rw"), { yPercent: 110, stagger: 0.08, duration: 0.6, ease: "power3.out" }, 0.2);

    const tl = pinTimeline(root.current!, q(".xb-stage")[0], 3.2, (p) => media.current?.setProgress(p));

    tl.fromTo(q(".xb-sphere"), { scale: reduce ? 1 : 0.35 }, { scale: 1, duration: 2.2, ease: "power3.out" }, 0)
      .fromTo(q(".xb-ring"), { rotate: 0 }, { rotate: 300 * k, duration: 8 }, 0)
      .fromTo(q(".xb-ring"), { scale: reduce ? 1 : 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.6, ease: "power2.out" }, 0.3)
      // Faixas de jogos atravessam a tela em direções opostas (parallax por velocidade).
      .fromTo(q(".xb-reel"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 2.4)
      // Deslocamentos limitados para as faixas (6 e 5 capas) cobrirem a tela o tempo todo.
      .fromTo(q(".xb-row-0"), { xPercent: 0 }, { xPercent: -25 * k, duration: 5 }, 2.4)
      .fromTo(q(".xb-row-1"), { xPercent: -10 * k }, { xPercent: 0, duration: 5 }, 2.4)
      .to(q(".xb-sphere"), { scale: reduce ? 1 : mobile ? 1.5 : 1.9, xPercent: reduce ? 0 : mobile ? 0 : 18, duration: 2.4, ease: "power2.inOut" }, 5.6)
      .to(q(".xb-reel"), { autoAlpha: 0.25, duration: 1 }, 6);

    beatSequence(tl, q(".xb-beat"), [0, 3.2, 6.6], { reduce });
    holdUntil(tl, 8.4);
  });

  return (
    <section ref={root} id="xbox" aria-labelledby="xbox-title">
      <div className="xb-stage relative h-svh overflow-hidden">
        <div className="absolute inset-0 grid place-items-center md:place-items-center md:pl-[30vw]" aria-hidden>
          <div className="relative size-[min(70vw,52svh)]">
            <svg className="xb-ring absolute -inset-[12%] h-[124%] w-[124%]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="49" fill="none" stroke="var(--ms-green)" strokeWidth="0.35" strokeDasharray="0.6 2.4" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--line)" strokeWidth="0.25" />
              <rect x="49" y="0" width="2" height="2" fill="var(--ms-green)" />
            </svg>
            <div className="xb-sphere relative h-full w-full overflow-hidden rounded-full bg-[var(--ms-green)] will-change-transform">
              <div className="absolute inset-[9%] overflow-hidden rounded-full">
                <ScrollMedia ref={media} slot="XBOX_GAMEPLAY_REEL" tone="dark" className="h-full w-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="xb-reel pointer-events-none invisible absolute inset-x-0 bottom-[10svh] space-y-3 md:bottom-[5svh] md:space-y-4">
          {rows.map((row, r) => (
            <ul key={r} className={`xb-row-${r} flex w-max gap-3 will-change-transform md:gap-4`} aria-label={r === 0 ? "Alguns jogos" : undefined}>
              {row.map((game) => (
                <li
                  key={game.file}
                  className="relative aspect-[920/430] w-[50vw] shrink-0 overflow-hidden rounded-md bg-[var(--surface)] md:w-[22vw]"
                >
                  <Image src={`/images/xbox/${game.file}`} alt={game.name} fill sizes="(min-width: 768px) 22vw, 50vw" className="object-cover" />
                </li>
              ))}
            </ul>
          ))}
        </div>

        <div className="relative z-10 flex h-full flex-col justify-start px-4 pt-24 md:justify-center md:px-12 md:pt-0 md:pb-[22svh]">
          <div className="beats md:max-w-[34vw]">
            {BEATS.map((beat, i) => (
              <div key={i} className={`xb-beat xb-beat-${i}`}>
                {i === 0 ? (
                  <h2 id="xbox-title" className="t-title">
                    <RevealText text={beat.title} />
                  </h2>
                ) : (
                  <h3 className="t-heading max-w-[16ch]">{beat.title}</h3>
                )}
                <p className="t-body mt-5">{beat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
