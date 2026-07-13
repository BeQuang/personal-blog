import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const baseClasses =
  "inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-[linear-gradient(135deg,var(--primary),var(--secondary))] text-white shadow-[0_10px_30px_color-mix(in_srgb,var(--primary)_22%,transparent)] hover:-translate-y-0.5 hover:shadow-[0_14px_34px_color-mix(in_srgb,var(--primary)_30%,transparent)]",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]",
  outline:
    "border border-[var(--border-strong)] bg-transparent text-[var(--text-primary)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
  ghost:
    "border border-transparent bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 rounded-[var(--radius-md)] px-3 text-sm",
  md: "min-h-11 rounded-[var(--radius-md)] px-4 text-sm",
  lg: "min-h-12 rounded-[var(--radius-lg)] px-5 text-base",
  icon: "size-11 rounded-[var(--radius-md)]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  ariaLabel?: string;
}

export function LinkButton({
  href,
  children,
  className,
  variant = "primary",
  size = "md",
  ariaLabel,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
    >
      {children}
    </Link>
  );
}
