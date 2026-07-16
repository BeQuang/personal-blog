import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

interface SectionHeaderProps {
  title: string;
  titleId?: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({
  title,
  titleId,
  description,
  eyebrow,
  action,
  align = "left",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "items-center text-center sm:flex-col sm:items-center",
        className,
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold tracking-[0.16em] text-[var(--primary)] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 id={titleId} className="text-[length:var(--text-h2)] font-bold tracking-[-0.03em] text-[var(--text-primary)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
