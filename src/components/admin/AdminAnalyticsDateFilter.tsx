"use client";

import { Button } from "antd";
import { MousePointerClick } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminDateRangePicker } from "@/components/admin/AdminDatePickers";
import { startNavigationProgress } from "@/lib/loading-progress";
import type { AnalyticsDateRange } from "@/types";

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createPresetRange(days: number, today: string) {
  const to = new Date(`${today}T00:00:00.000Z`);
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - days + 1);
  return { from: toDateInput(from), to: toDateInput(to) };
}

export function AdminAnalyticsDateFilter({
  range,
  targetPath,
  today,
}: {
  range: AnalyticsDateRange;
  targetPath: "/admin";
  today: string;
}) {
  const router = useRouter();
  const [customFrom, setCustomFrom] = useState(range.from);
  const [customTo, setCustomTo] = useState(range.to);

  function navigate(from: string, to: string) {
    setCustomFrom(from);
    setCustomTo(to);
    const params = new URLSearchParams({ from, to });
    startNavigationProgress();
    router.push(`${targetPath}?${params.toString()}`);
  }

  return (
    <section
      className="admin-analytics-filters"
      aria-label="Lọc thời gian analytics"
    >
      <div className="admin-analytics-presets">
        {[7, 30, 90].map((days) => {
          const preset = createPresetRange(days, today);
          const active =
            range.from === preset.from && range.to === preset.to;
          return (
            <Button
              key={days}
              type={active ? "primary" : "default"}
              onClick={() => navigate(preset.from, preset.to)}
            >
              {days} ngày
            </Button>
          );
        })}
      </div>
      <div className="admin-analytics-custom-range">
        <AdminDateRangePicker
          value={
            customFrom && customTo
              ? [customFrom, customTo]
              : null
          }
          maxDate={today}
          onChange={(nextRange) => {
            setCustomFrom(nextRange?.[0] ?? "");
            setCustomTo(nextRange?.[1] ?? "");
          }}
        />
        <Button
          icon={<MousePointerClick size={16} aria-hidden="true" />}
          onClick={() => navigate(customFrom, customTo)}
          disabled={!customFrom || !customTo || customFrom > customTo}
        >
          Áp dụng
        </Button>
      </div>
    </section>
  );
}
