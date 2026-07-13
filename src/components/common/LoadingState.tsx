import { LoaderCircle } from "lucide-react";

import { cn } from "@/utils/cn";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({
  label = "Đang tải nội dung…",
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-48 flex-col items-center justify-center gap-3 text-[var(--text-secondary)]",
        className,
      )}
    >
      <LoaderCircle className="animate-spin text-[var(--primary)]" aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
