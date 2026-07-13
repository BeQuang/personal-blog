import type { ThemeSettings } from "@/types";

export const themeStorageKey = "creator-blog-theme";

export const defaultTheme: ThemeSettings = {
  mode: "dark",
  layout: "creator",
  cardStyle: "glass",
  buttonStyle: "gradient",
  primaryColor: "#8B5CF6",
  secondaryColor: "#EC4899",
  accentColor: "#22D3EE",
  borderRadius: 20,
};

export const themeColors = {
  dark: {
    background: "#09090B",
    backgroundSecondary: "#18181B",
    surface: "#18181B",
    surfaceHover: "#27272A",
    textPrimary: "#FAFAFA",
    textSecondary: "#A1A1AA",
    textMuted: "#71717A",
    border: "rgba(255, 255, 255, 0.1)",
  },
  light: {
    background: "#FFFFFF",
    backgroundSecondary: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceHover: "#F1F5F9",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#64748B",
    border: "#E2E8F0",
  },
  semantic: {
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#EF4444",
  },
} as const;
