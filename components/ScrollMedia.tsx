"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import { getMedia, type MediaSlotId } from "@/lib/media";

export type MediaHandle = {
  /** Progresso 0–1 vindo do ScrollTrigger da cena. */
  setProgress: (p: number) => void;
};

type Props = {
  slot: MediaSlotId;
  ref?: Ref<MediaHandle>;
  /** Trecho do progresso da cena que corresponde ao clipe inteiro. */
  range?: [number, number];
  /** "auto" herda as cores do tema atual; "dark" simula um quadro de vídeo. */
  tone?: "auto" | "dark";
  /** Índice opcional quando o slot representa uma série (ex.: capas). */
  index?: number;
  compact?: boolean;
  className?: string;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const pad = (n: number, len: number) => String(n).padStart(len, "0");

/**
 * Container de mídia controlado pelo scroll.
 * - Sem asset: placeholder com contador de frames sincronizado.
 * - Vídeo: o progresso define currentTime (avança e retrocede).
 * - Sequência de frames: desenha o frame correspondente em um canvas.
 * Se o asset falhar ao carregar, volta para o placeholder.
 */
export function ScrollMedia({ slot, ref, range = [0, 1], tone = "auto", index, compact, className = "" }: Props) {
  const spec = getMedia(slot);
  const [failed, setFailed] = useState(false);
  const source = failed ? null : spec.source;

  const target = useRef(0);
  const raf = useRef(0);
  const barRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const images = useRef<HTMLImageElement[]>([]);

  const draw = useCallback(() => {
    raf.current = 0;
    const p = target.current;

    if (source?.kind === "video") {
      const v = videoRef.current;
      if (v && v.duration) {
        const t = p * v.duration;
        if (Math.abs(v.currentTime - t) > 1 / 60) v.currentTime = t;
      }
      return;
    }

    if (source?.kind === "frames") {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      let i = Math.round(p * (source.count - 1));
      // Usa o frame carregado mais próximo enquanto o restante baixa.
      while (i > 0 && !images.current[i]?.complete) i--;
      const img = images.current[i];
      if (!img?.complete || !img.naturalWidth) return;
      const { width: cw, height: ch } = canvas;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      return;
    }

    if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    if (frameRef.current) {
      const total = spec.frames;
      frameRef.current.textContent = `${pad(Math.round(p * (total - 1)) + 1, 3)}/${pad(total, 3)}`;
    }
  }, [source, spec.frames]);

  useImperativeHandle(
    ref,
    () => ({
      setProgress(p: number) {
        const [a, b] = range;
        target.current = clamp01((p - a) / (b - a));
        if (!raf.current) raf.current = requestAnimationFrame(draw);
      },
    }),
    [range, draw],
  );

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  useEffect(() => {
    if (source?.kind !== "frames") return;
    images.current = Array.from({ length: source.count }, (_, i) => {
      const img = new Image();
      img.src = source.path(i);
      if (i === 0) img.onload = draw;
      return img;
    });
    const canvas = canvasRef.current;
    if (canvas) {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
    }
  }, [source, draw]);

  const toneClass =
    tone === "dark" ? "bg-[#16283F] text-[#EEF2F5]" : "bg-[var(--surface)] text-[var(--fg)]";

  return (
    <div
      className={`relative overflow-hidden ${toneClass} ${className}`}
      data-media-slot={slot}
      role="img"
      aria-label={`${spec.title}: ${spec.description}`}
    >
      {source?.kind === "video" && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={source.src}
          poster={source.poster}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={draw}
          onError={() => setFailed(true)}
        />
      )}

      {source?.kind === "frames" && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />}

      {!source && (
        <>
          <svg className="absolute inset-0 h-full w-full opacity-[0.18]" aria-hidden preserveAspectRatio="none">
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" vectorEffect="non-scaling-stroke" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="absolute inset-0 border border-current opacity-25" aria-hidden />
          <div className={`absolute inset-0 flex flex-col justify-between ${compact ? "p-3" : "p-4 md:p-5"}`}>
            <div className="flex items-start justify-between gap-3">
              <span className="font-mono text-[11px] leading-tight tracking-tight md:text-xs">
                {slot}
                {index !== undefined && `[${index}]`}
              </span>
              {!compact && spec.frames > 1 && (
                <span ref={frameRef} className="font-mono text-[11px] tabular-nums opacity-60 md:text-xs">
                  001/{pad(spec.frames, 3)}
                </span>
              )}
            </div>
            {!compact && (
              <div className="space-y-3">
                <p className="max-w-[34ch] text-xs leading-snug opacity-60 md:text-sm">{spec.description}</p>
                {spec.frames > 1 && (
                  <span className="block h-px w-full bg-current/20">
                    <span ref={barRef} className="block h-px w-full origin-left scale-x-0 bg-current" />
                  </span>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
