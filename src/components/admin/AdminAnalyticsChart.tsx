"use client";

import { useEffect, useRef } from "react";
import uPlot, { type AlignedData } from "uplot";

import type { AnalyticsDailyPoint } from "@/types";

export function AdminAnalyticsChart({ data }: { data: readonly AnalyticsDailyPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || data.length === 0) return;

    const alignedData: AlignedData = [
      data.map((item) => Date.parse(`${item.date}T00:00:00.000Z`) / 1_000),
      data.map((item) => item.pageViews),
      data.map((item) => item.contentViews),
    ];
    const chart = new uPlot(
      {
        width: Math.max(320, container.clientWidth),
        height: 320,
        cursor: { drag: { x: false, y: false } },
        legend: { show: true },
        scales: { x: { time: true }, y: { auto: true, range: (_u, min, max) => [0, Math.max(1, max * 1.15)] } },
        axes: [
          { stroke: "#667085", grid: { stroke: "#e9eaf0", width: 1 } },
          { stroke: "#667085", grid: { stroke: "#e9eaf0", width: 1 }, values: (_u, values) => values.map((value) => Math.round(value).toLocaleString("vi-VN")) },
        ],
        series: [
          {},
          { label: "Lượt xem trang", stroke: "#7c3aed", width: 2, fill: "rgba(124, 58, 237, 0.10)", points: { show: data.length <= 31 } },
          { label: "Lượt xem nội dung", stroke: "#ec4899", width: 2, points: { show: data.length <= 31 } },
        ],
      },
      alignedData,
      container,
    );
    const observer = new ResizeObserver(([entry]) => {
      if (entry) chart.setSize({ width: Math.max(320, Math.floor(entry.contentRect.width)), height: 320 });
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.destroy();
    };
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="admin-analytics-chart"
      role="img"
      aria-label="Biểu đồ lượt xem trang và nội dung theo ngày"
    />
  );
}

