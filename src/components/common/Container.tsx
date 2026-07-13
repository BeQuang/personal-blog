import type { ElementType, HTMLAttributes } from "react";

import { cn } from "@/utils/cn";

type ContainerElement = "div" | "section" | "main" | "header" | "footer";

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ContainerElement;
  size?: "default" | "article";
}

export function Container({
  as,
  size = "default",
  className,
  ...props
}: ContainerProps) {
  const Component = (as ?? "div") as ElementType;

  return (
    <Component
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        size === "article" ? "max-w-[800px]" : "max-w-[1280px]",
        className,
      )}
      {...props}
    />
  );
}
