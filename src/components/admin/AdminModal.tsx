"use client";

import { Modal } from "antd";
import type { ModalProps } from "antd";

import { cn } from "@/utils/cn";

export function AdminModal({
  centered = true,
  className,
  scrollLock = true,
  styles,
  ...props
}: ModalProps) {
  const modalStyles: ModalProps["styles"] = (info) => {
    const resolvedStyles = typeof styles === "function"
      ? styles(info)
      : styles;

    return {
      ...resolvedStyles,
      wrapper: {
        ...resolvedStyles?.wrapper,
        overflow: "hidden",
      },
      container: {
        ...resolvedStyles?.container,
        display: "flex",
        maxHeight: "80dvh",
        minHeight: 0,
        flexDirection: "column",
        overflow: "hidden",
      },
      header: {
        ...resolvedStyles?.header,
        flex: "0 0 auto",
      },
      body: {
        ...resolvedStyles?.body,
        flex: "1 1 auto",
        minHeight: 0,
        overflowX: "hidden",
        overflowY: "auto",
        overscrollBehavior: "contain",
        scrollbarGutter: "stable",
      },
      footer: {
        ...resolvedStyles?.footer,
        flex: "0 0 auto",
      },
    };
  };

  return (
    <Modal
      {...props}
      centered={centered}
      className={cn("admin-scroll-modal", className)}
      scrollLock={scrollLock}
      styles={modalStyles}
    />
  );
}
