"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CHAPTERS, THEMES, type ChapterId } from "@/lib/chapters";
import { scrollToTarget } from "@/lib/scroll";

const SQUARES = ["var(--ms-red)", "var(--ms-green)", "var(--ms-blue)", "var(--ms-yellow)"];

/**
 * Barra superior, trilho de capítulos e troca de tema (fundo claro/escuro)
 * conforme a cena ativa. Fica fora das cenas para atravessar todas elas.
 */
export function ChapterNav() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<ChapterId>("inicio");

  useGSAP(
    () => {
      gsap.to(".nav-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: true },
      });

      CHAPTERS.forEach((chapter) => {
        const el = document.getElementById(chapter.id);
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          // Calcula depois dos pins das cenas, que alteram a altura da página.
          refreshPriority: -1,
          onToggle: (self) => {
            if (!self.isActive) return;
            setActive(chapter.id);
            gsap.to(document.documentElement, {
              ...THEMES[chapter.theme],
              duration: 0.8,
              ease: "power2.out",
              overwrite: "auto",
            });
          },
        });
      });
    },
    { scope: root },
  );

  const current = CHAPTERS.findIndex((c) => c.id === active);

  return (
    <div ref={root}>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 text-[var(--fg)]">
        <span className="nav-progress block h-[2px] origin-left scale-x-0 bg-[var(--ms-blue)]" />
        <div className="flex items-center justify-between px-4 py-4 md:px-10">
          <button
            type="button"
            onClick={() => scrollToTarget(0)}
            className="pointer-events-auto flex items-center gap-2.5 rounded-sm text-sm font-semibold"
            aria-label="Voltar ao início"
          >
            <span className="grid grid-cols-2 gap-[2px]" aria-hidden>
              {SQUARES.map((c) => (
                <span key={c} className="size-[7px]" style={{ background: c }} />
              ))}
            </span>
            Microsoft
          </button>
          <p className="text-xs text-[var(--mute)]">Projeto acadêmico, sem vínculo oficial</p>
        </div>
      </header>

      <nav
        aria-label="Capítulos"
        className="fixed top-1/2 right-4 z-50 hidden -translate-y-1/2 md:block lg:right-8"
      >
        <ol className="flex flex-col items-end gap-1">
          {CHAPTERS.map((chapter, i) => {
            const isActive = chapter.id === active;
            return (
              <li key={chapter.id}>
                <button
                  type="button"
                  onClick={() => scrollToTarget(`#${chapter.id}`)}
                  aria-current={isActive ? "step" : undefined}
                  className="group flex items-center gap-3 rounded-sm py-1 pl-2 text-[var(--fg)]"
                >
                  <span
                    className={`text-xs transition-all duration-300 ${
                      isActive
                        ? "translate-x-0 opacity-100"
                        : "translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60 group-focus-visible:opacity-60"
                    }`}
                  >
                    {chapter.label}
                  </span>
                  <span
                    className="block size-2 transition-all duration-300"
                    style={{
                      background: isActive ? SQUARES[i % 4] : "var(--line)",
                      transform: isActive ? "scale(1.4)" : "scale(1)",
                    }}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center md:hidden">
        <p className="rounded-full bg-[var(--bg)]/80 px-3 py-1.5 text-xs text-[var(--fg)] backdrop-blur-sm">
          {CHAPTERS[current]?.label}
          <span className="ml-2 text-[var(--mute)] tabular-nums">
            {current + 1} de {CHAPTERS.length}
          </span>
        </p>
      </div>
    </div>
  );
}
