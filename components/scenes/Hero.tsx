"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { holdUntil, pinTimeline, useScene } from "@/lib/scene";
import { ScrollMedia, type MediaHandle } from "@/components/ScrollMedia";
import { RevealText } from "@/components/RevealText";
import { MEDIA } from "@/lib/media";
import { animateCaptions, floatChips, HeroCaptions } from "@/components/HeroCaptions";

// Duração do scroll, em alturas de tela.
const INTRO_SCREENS = 1.5; // logo se abre e o vídeo entra
const VIDEO_SCREENS = 37.5; // percorre o vídeo inteiro (75 s ≈ 2 s de vídeo por tela)
const END_HOLD_SCREENS = 0; // pausa no frame final (logo sobre preto)

// Trecho do progresso da cena em que o vídeo vai do primeiro ao último frame.
const VIDEO_TOTAL = INTRO_SCREENS + VIDEO_SCREENS + END_HOLD_SCREENS;
const VIDEO_SECONDS = MEDIA.HERO_VIDEO.frames / 24;
const VIDEO_RANGE: [number, number] = [INTRO_SCREENS / VIDEO_TOTAL, (INTRO_SCREENS + VIDEO_SCREENS) / VIDEO_TOTAL];

// Desfoque do vídeo quando o scroll para. Qualquer movimento deixa nítido;
// o desfoque só começa depois de BLUR_DELAY_MS parado e cresce até MAX_BLUR
// ao longo de BLUR_IN_MS. Assim, pausas curtas entre roladas não desfocam.
const MAX_BLUR = 14; // px
const BLUR_DELAY_MS = 500;
const BLUR_IN_MS = 1200;
const MOVING_SPEED = 40; // px/s: abaixo disso o scroll conta como parado

const QUADS = [
  { color: "var(--ms-red)", col: 0, row: 0 },
  { color: "var(--ms-green)", col: 1, row: 0 },
  { color: "var(--ms-blue)", col: 0, row: 1 },
  { color: "var(--ms-yellow)", col: 1, row: 1 },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const media = useRef<MediaHandle>(null);

  useScene(root, ({ reduce }) => {
    const q = gsap.utils.selector(root);
    const stage = q(".hero-stage")[0] as HTMLElement;
    const quads = q<HTMLElement>(".hero-quad");

    // Abertura: o único movimento que não depende do scroll.
    const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
    intro
      .from(q(".hero-quad-fill"), { scale: 0, duration: 1.1, stagger: 0.08 })
      .from(q(".hero-title .rw"), { yPercent: 110, duration: 1.2, stagger: 0.06 }, 0.25)
      .from(q(".hero-sub"), { autoAlpha: 0, y: reduce ? 0 : 12, duration: 1 }, 0.7);
    if (reduce) intro.progress(1);

    // Cada quadrado do logo cresce até ocupar um quarto da tela.
    const toQuadrant = (i: number) => {
      const el = quads[i];
      const W = stage.clientWidth / 2;
      const H = stage.clientHeight / 2;
      return {
        x: QUADS[i].col * W - el.offsetLeft,
        y: QUADS[i].row * H - el.offsetTop,
        scaleX: W / el.offsetWidth,
        scaleY: H / el.offsetHeight,
      };
    };

    // Cada unidade da timeline equivale a uma altura de tela de scroll.
    const total = INTRO_SCREENS + VIDEO_SCREENS + END_HOLD_SCREENS;
    const tl = pinTimeline(root.current!, stage, total, (p) => media.current?.setProgress(p));
    tl.to(q(".hero-title"), { yPercent: reduce ? 0 : -40, autoAlpha: 0, duration: 0.4 }, 0)
      .fromTo(q(".hero-sub"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25, immediateRender: false }, 0)
      .to(
        quads,
        {
          x: (i) => toQuadrant(i).x,
          y: (i) => toQuadrant(i).y,
          scaleX: (i) => toQuadrant(i).scaleX,
          scaleY: (i) => toQuadrant(i).scaleY,
          duration: INTRO_SCREENS * 0.7,
          ease: "power3.inOut",
          stagger: 0.05,
        },
        0.1,
      )
      .fromTo(
        q(".hero-media"),
        { autoAlpha: 0, scale: reduce ? 1 : 1.08 },
        { autoAlpha: 1, scale: 1, duration: INTRO_SCREENS * 0.25, ease: "power2.out" },
        INTRO_SCREENS * 0.75,
      );

    // Legendas posicionadas em segundos do vídeo.
    animateCaptions(tl, root.current!, {
      at: (s) => INTRO_SCREENS + (s / VIDEO_SECONDS) * VIDEO_SCREENS,
      span: (s) => (s / VIDEO_SECONDS) * VIDEO_SCREENS,
      reduce,
    });
    holdUntil(tl, total);

    if (reduce) return;

    // Vídeo "vivo": mesmo com o scroll parado, o quadro respira, flutua e
    // acompanha o mouse. A camada é maior que a tela para as bordas não aparecerem.
    const live = q(".hero-live")[0] as HTMLElement;
    gsap.set(live, { transformPerspective: 1400 });
    const idle = [
      gsap.to(live, { scale: 1.035, duration: 6, ease: "sine.inOut", repeat: -1, yoyo: true }),
      gsap.to(live, { yPercent: -0.7, duration: 4.4, ease: "sine.inOut", repeat: -1, yoyo: true }),
      gsap.to(live, { rotation: 0.25, duration: 7.3, ease: "sine.inOut", repeat: -1, yoyo: true }),
      ...floatChips(root.current!),
    ];
    const follow = { duration: 1.4, ease: "power3.out" };
    const moveX = gsap.quickTo(live, "x", follow);
    const moveY = gsap.quickTo(live, "y", follow);
    const tiltX = gsap.quickTo(live, "rotationX", follow);
    const tiltY = gsap.quickTo(live, "rotationY", follow);
    // Legendas andam no sentido oposto ao vídeo: dá profundidade entre as camadas.
    const captions = q(".hero-captions")[0];
    const capX = gsap.quickTo(captions, "x", follow);
    const capY = gsap.quickTo(captions, "y", follow);
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      moveX(-nx * 26);
      moveY(-ny * 18);
      tiltY(nx * 2.2);
      tiltX(-ny * 1.6);
      capX(nx * 18);
      capY(ny * 12);
    };
    window.addEventListener("pointermove", onPointer);

    // Desfoque ao parar: qualquer movimento foca rápido; parado por um tempo, desfoca aos poucos.
    let blur = 0;
    let shown = -1;
    let lastY = window.scrollY;
    let movedAt = performance.now();
    const updateBlur = (_time: number, dt: number) => {
      const now = performance.now();
      const y = window.scrollY;
      const speed = (Math.abs(y - lastY) / Math.max(dt, 1)) * 1000;
      lastY = y;
      if (speed > MOVING_SPEED) movedAt = now;
      if (!tl.scrollTrigger?.isActive) return;
      const still = now - movedAt - BLUR_DELAY_MS;
      const target = still > 0 ? MAX_BLUR * Math.min(1, still / BLUR_IN_MS) : 0;
      // Focar é rápido; desfocar já é gradual pela rampa de BLUR_IN_MS.
      blur = target < blur ? blur + (target - blur) * 0.3 : target;
      const px = Math.round(blur * 4) / 4;
      if (px !== shown) {
        shown = px;
        live.style.filter = px > 0 ? `blur(${px}px)` : "";
      }
    };
    gsap.ticker.add(updateBlur);

    // Só anima enquanto o Hero está na tela.
    ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom top",
      onToggle: (self) => idle.forEach((t) => (self.isActive ? t.resume() : t.pause())),
    });

    return () => {
      window.removeEventListener("pointermove", onPointer);
      gsap.ticker.remove(updateBlur);
      live.style.filter = "";
    };
  });

  return (
    <section ref={root} id="inicio" aria-label="Início">
      <div className="hero-stage relative h-svh overflow-hidden bg-black text-[#EEF2F5]">
        {QUADS.map((quad, i) => (
          <div
            key={i}
            aria-hidden
            className="hero-quad absolute origin-top-left will-change-transform"
            style={{
              width: "var(--s)",
              height: "var(--s)",
              left: quad.col ? "calc(50% + var(--g) / 2)" : "calc(50% - var(--g) / 2 - var(--s))",
              top: quad.row ? "calc(38% + var(--g) / 2)" : "calc(38% - var(--g) / 2 - var(--s))",
            }}
          >
            <span className="hero-quad-fill block h-full w-full" style={{ background: quad.color }} />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-x-0 top-[38%] flex translate-y-[calc(var(--s)+var(--g)+2rem)] flex-col items-center px-4 text-center">
          <h1 className="hero-title t-display">
            <RevealText text="Microsoft" />
          </h1>
          <p className="hero-sub t-body mt-6 text-center">
            Uma história de cinquenta anos.
          </p>
        </div>

        <div className="hero-media invisible absolute inset-0 overflow-hidden bg-black">
          <div className="hero-live absolute -inset-[4%] will-change-transform">
            <ScrollMedia ref={media} slot="HERO_VIDEO" range={VIDEO_RANGE} tone="dark" className="h-full w-full bg-black" />
          </div>
          <HeroCaptions />
          <div className="film-grain" aria-hidden />
        </div>
      </div>
    </section>
  );
}
