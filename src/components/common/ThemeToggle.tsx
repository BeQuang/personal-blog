"use client";

import { Laptop, Moon, Sun } from "lucide-react";

import { Button } from "@/components/common/Button";
import { useTheme } from "@/components/providers/ThemeProvider";
import type { ThemeMode } from "@/types";

const themeOrder: readonly ThemeMode[] = ["light", "dark", "system"];

const themeLabels: Record<ThemeMode, string> = {
  light: "Sáng",
  dark: "Tối",
  system: "Hệ thống",
};

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Laptop,
} as const;

export function ThemeToggle() {
  const { theme, mounted, setTheme } = useTheme();
  const visibleTheme = mounted ? theme : "system";
  const Icon = themeIcons[visibleTheme];
  const currentIndex = themeOrder.indexOf(visibleTheme);
  const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Giao diện hiện tại: ${themeLabels[visibleTheme]}. Chuyển sang ${themeLabels[nextTheme]}.`}
      title={`Giao diện: ${themeLabels[visibleTheme]}`}
      className="text-[var(--text-primary)]"
    >
      <Icon size={19} aria-hidden="true" />
    </Button>
  );
}
