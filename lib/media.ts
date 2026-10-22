/**
 * Registro central de mídia.
 *
 * Cada slot corresponde a um container na página. Hoje todos estão com
 * `source: null` e renderizam um placeholder. Para inserir o asset final,
 * basta preencher `source` — a cena continua passando o progresso do scroll
 * e o <ScrollMedia> decide como exibir:
 *
 *   { kind: "video",  src: "/media/hero.mp4", poster: "/media/hero.jpg" }
 *   { kind: "frames", count: 180, path: (i) => `/media/hero/${String(i).padStart(4, "0")}.webp` }
 *
 * Dica para vídeo com scrub: exporte com keyframe a cada frame
 * (ex.: ffmpeg -g 1) para que o avanço e o retrocesso fiquem precisos.
 */

export type MediaSource =
  | { kind: "video"; src: string; poster?: string }
  | { kind: "frames"; count: number; path: (index: number) => string };

export type MediaSpec = {
  title: string;
  description: string;
  /** Quantidade de frames planejada (usada pelo contador do placeholder). */
  frames: number;
  source: MediaSource | null;
};

export const MEDIA = {
  HERO_VIDEO: {
    title: "Abertura",
    description: "Plano aberto que nasce dos quatro quadrados e revela pessoas usando produtos Microsoft.",
    frames: 240,
    source: null,
  },
  ABOUT_CAMPUS: {
    title: "Campus de Redmond",
    description: "Foto ou vídeo curto do campus, com leve parallax.",
    frames: 1,
    source: null,
  },
  TIMELINE_1975: { title: "1975", description: "Arquivo histórico da fundação.", frames: 1, source: null },
  TIMELINE_1985: { title: "1985", description: "Interface do Windows 1.0.", frames: 1, source: null },
  TIMELINE_1990: { title: "1990", description: "Caixa do primeiro Office.", frames: 1, source: null },
  TIMELINE_2001: { title: "2001", description: "Console Xbox original.", frames: 1, source: null },
  TIMELINE_2010: { title: "2010", description: "Datacenter da primeira geração do Azure.", frames: 1, source: null },
  TIMELINE_2012: { title: "2012", description: "Primeiro Surface com teclado.", frames: 1, source: null },
  TIMELINE_2023: { title: "2023", description: "Interface do Copilot.", frames: 1, source: null },
  WINDOWS_SHOWCASE: {
    title: "Área de trabalho do Windows",
    description: "Gravação de tela com janelas se organizando via Snap Layouts.",
    frames: 300,
    source: null,
  },
  M365_SUITE: {
    title: "Documento compartilhado",
    description: "Sequência de telas alternando entre Word, Excel, PowerPoint, Outlook e Teams.",
    frames: 300,
    source: null,
  },
  SURFACE_DEVICE_RENDER: {
    title: "Surface em três modos",
    description: "Render 3D do dispositivo girando de laptop para tablet e modo estúdio.",
    frames: 360,
    source: null,
  },
  XBOX_GAMEPLAY_REEL: {
    title: "Gameplay",
    description: "Montagem de gameplay recortada dentro da esfera.",
    frames: 300,
    source: null,
  },
  XBOX_GAME_COVERS: {
    title: "Capas de jogos",
    description: "Série de capas para as faixas horizontais.",
    frames: 1,
    source: null,
  },
  AZURE_DATACENTER_FLYTHROUGH: {
    title: "Voo pelo datacenter",
    description: "Câmera atravessando corredores de servidores, sob a rede de regiões.",
    frames: 280,
    source: null,
  },
  COPILOT_ANIMATION: {
    title: "Animação do Copilot",
    description: "Loop do símbolo do Copilot reagindo ao texto digitado.",
    frames: 320,
    source: null,
  },
  FUTURE_MONTAGE: {
    title: "Montagem final",
    description: "Cortes rápidos de todos os capítulos antes do logo se reagrupar.",
    frames: 200,
    source: null,
  },
} satisfies Record<string, MediaSpec>;

export type MediaSlotId = keyof typeof MEDIA;

export function getMedia(id: MediaSlotId): MediaSpec {
  return MEDIA[id];
}
