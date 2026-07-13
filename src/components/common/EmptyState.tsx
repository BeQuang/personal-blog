import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-64 flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-12 text-center",
        className,
      )}
    >
      <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
        {icon ?? <Inbox aria-hidden="true" size={22} />}
      </span>
      <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
