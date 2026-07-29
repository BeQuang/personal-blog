"use client";

import { useEffect, useRef, useState } from "react";

export function useAdminViewportTable(itemCount: number) {
  const [tableBodyHeight, setTableBodyHeight] = useState(240);
  const tablePanelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const panel = tablePanelRef.current;
    const page = panel?.parentElement;
    if (!panel || !page) return;

    const getOuterHeight = (element: HTMLElement | null) => {
      if (!element) return 0;
      const styles = window.getComputedStyle(element);
      return (
        element.getBoundingClientRect().height +
        Number.parseFloat(styles.marginTop || "0") +
        Number.parseFloat(styles.marginBottom || "0")
      );
    };

    const measureTableBody = () => {
      const tableHeader = panel.querySelector<HTMLElement>(".ant-table-header");
      const pagination = panel.querySelector<HTMLElement>(".ant-pagination");
      const pageBounds = page.getBoundingClientRect();
      const panelBounds = panel.getBoundingClientRect();
      const availablePanelHeight = Math.max(0, pageBounds.bottom - panelBounds.top);
      const reservedHeight = getOuterHeight(tableHeader) + getOuterHeight(pagination);
      const nextHeight = Math.max(
        48,
        Math.floor(availablePanelHeight - reservedHeight - 2),
      );

      setTableBodyHeight((currentHeight) =>
        currentHeight === nextHeight ? currentHeight : nextHeight,
      );
    };

    const observer = new ResizeObserver(measureTableBody);
    const tableHeader = panel.querySelector<HTMLElement>(".ant-table-header");
    const pagination = panel.querySelector<HTMLElement>(".ant-pagination");

    observer.observe(page);
    if (tableHeader) observer.observe(tableHeader);
    if (pagination) observer.observe(pagination);
    const frame = window.requestAnimationFrame(measureTableBody);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [itemCount]);

  return { tableBodyHeight, tablePanelRef };
}
