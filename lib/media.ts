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
 * Vídeo com scrub precisa de keyframe em todo frame e sem B-frames; senão cada
 * busca decodifica desde o último keyframe e o scroll trava. CRF 14 mantém a
 * qualidade próxima do original (o arquivo fica ~4–5× maior):
 *
 *   ffmpeg -i in.mp4 -c:v libx264 -preset slow -crf 14 -g 1 -bf 0 \
 *     -pix_fmt yuv420p -an -movflags +faststart public/videos/out.mp4
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
    description: "Filme futurista de 90 s percorrido inteiro pelo scroll; termina com o logo sobre fundo preto.",
    frames: 2160,
    source: { kind: "video", src: "/videos/hero_video_scrub.mp4" },
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
  WINDOWS_START: {
    title: "Logo do Windows 11",
    description: "Logo do Windows 11 surgindo sobre fundo cinza-claro.",
    frames: 127,
    source: { kind: "video", src: "/videos/windows_start_scrub.mp4" },
  },
  WINDOWS_BLOOM: {
    title: "Bloom do Windows 11",
    description: "A flor do papel de parede do Windows 11 nascendo de baixo e girando devagar.",
    frames: 152,
    source: { kind: "video", src: "/videos/windows_bloom_scrub.mp4" },
  },
  M365_SUITE: {
    title: "Microsoft 365 em 3D",
    description: "Filme de 49 s com Word, Excel e PowerPoint em aparelhos 3D; termina com o logo sobre branco.",
    frames: 1490,
    source: { kind: "video", src: "/videos/m365_suite_scrub.mp4" },
  },
  XBOX_GAMEPLAY_REEL: {
    title: "Gameplay",
    description: "Voo em primeira pessoa por um cânion verde, recortado dentro da esfera.",
    frames: 328,
    source: { kind: "video", src: "/videos/xbox_gameplay_reel_scrub.mp4" },
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
