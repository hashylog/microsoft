"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/** Elementos que deixam o cursor em estado de "clique". */
const INTERACTIVE = "a, button, summary, [role='button'], label, input, select, textarea";

/**
 * Cursor minimalista: um ponto que segue o mouse na hora e um quadrado de
 * contorno que vem atrás com atraso (eco dos quadrados do logo). Sobre algo
 * clicável o quadrado cresce e gira; ao clicar, encolhe. Usa mix-blend
 * difference para aparecer sobre fundos claros e escuros.
 * Só existe em dispositivos com mouse; no toque o cursor do sistema não muda.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const d = dot.current!;
    const r = ring.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    gsap.set([d, r], { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const lag = reduce ? 0.01 : 0.45;
    const dx = gsap.quickTo(d, "x", { duration: 0.01 });
    const dy = gsap.quickTo(d, "y", { duration: 0.01 });
    const rx = gsap.quickTo(r, "x", { duration: lag, ease: "power3.out" });
    const ry = gsap.quickTo(r, "y", { duration: lag, ease: "power3.out" });

    let visible = false;
    let hovering = false;
    let pressed = false;

    const shape = () => {
      gsap.to(r, {
        scale: pressed ? 0.7 : hovering ? 1.8 : 1,
        rotate: hovering && !reduce ? 45 : 0,
        duration: 0.35,
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(d, { scale: hovering ? 0 : 1, duration: 0.25, ease: "power2.out", overwrite: "auto" });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!visible) {
        visible = true;
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
        gsap.to([d, r], { autoAlpha: 1, duration: 0.25 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      const over = !!(e.target as Element | null)?.closest?.(INTERACTIVE);
      if (over !== hovering) {
        hovering = over;
        shape();
      }
    };
    const onLeave = () => {
      visible = false;
      gsap.to([d, r], { autoAlpha: 0, duration: 0.25 });
    };
    const onDown = () => {
      pressed = true;
      shape();
    };
    const onUp = () => {
      pressed = false;
      shape();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[200] mix-blend-difference">
      <div ref={ring} className="invisible fixed top-0 left-0 size-7 border border-white" />
      <div ref={dot} className="invisible fixed top-0 left-0 size-[5px] bg-white" />
    </div>
  );
}
