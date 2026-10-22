export type Theme = "light" | "dark";

export const THEMES: Record<Theme, Record<string, string>> = {
  light: { "--bg": "#F2F4F5", "--fg": "#14233A", "--mute": "#5B6878", "--line": "#C9D0D7", "--surface": "#E4E8EC" },
  dark: { "--bg": "#0D1B2E", "--fg": "#EEF2F5", "--mute": "#93A1B2", "--line": "#2A3D57", "--surface": "#16283F" },
};

export const CHAPTERS = [
  { id: "inicio", label: "Início", theme: "light" },
  { id: "sobre", label: "Sobre", theme: "light" },
  { id: "windows", label: "Windows", theme: "dark" },
  { id: "microsoft-365", label: "Microsoft 365", theme: "light" },
  { id: "surface", label: "Surface", theme: "light" },
  { id: "xbox", label: "Xbox", theme: "dark" },
  { id: "azure", label: "Azure", theme: "dark" },
  { id: "copilot", label: "Copilot", theme: "light" },
  { id: "futuro", label: "Futuro", theme: "light" },
] as const satisfies readonly { id: string; label: string; theme: Theme }[];

export type ChapterId = (typeof CHAPTERS)[number]["id"];
