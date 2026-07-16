"use client";

import { useEffect, useRef, useState } from "react";

interface CountdownProps {
  endAt: string;
  onExpired?: () => void;
}

interface RemainingTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calculateRemaining(endAt: string): RemainingTime {
  const endTimestamp = new Date(endAt).getTime();
  const difference = Number.isFinite(endTimestamp)
    ? Math.max(0, endTimestamp - Date.now())
    : 0;

  return {
    days: Math.floor(difference / 86_400_000),
    hours: Math.floor((difference / 3_600_000) % 24),
    minutes: Math.floor((difference / 60_000) % 60),
    seconds: Math.floor((difference / 1_000) % 60),
    expired: difference === 0,
  };
}

export function Countdown({ endAt, onExpired }: CountdownProps) {
  const [remaining, setRemaining] = useState<RemainingTime | null>(null);
  const reportedExpired = useRef(false);

  useEffect(() => {
    reportedExpired.current = false;

    const update = () => {
      const nextRemaining = calculateRemaining(endAt);
      setRemaining(nextRemaining);

      if (nextRemaining.expired && !reportedExpired.current) {
        reportedExpired.current = true;
        onExpired?.();
      }

      return nextRemaining.expired;
    };

    if (update()) return;

    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, [endAt, onExpired]);

  if (!remaining) {
    return (
      <div className="countdown-grid" aria-label="Đang tính thời gian còn lại">
        {["Ngày", "Giờ", "Phút", "Giây"].map((label) => (
          <span className="countdown-cell" key={label}>
            <strong>--</strong><small>{label}</small>
          </span>
        ))}
      </div>
    );
  }

  if (remaining.expired) {
    return (
      <p className="campaign-ended" role="status">
        Chiến dịch đã kết thúc. Cảm ơn bạn đã quan tâm!
      </p>
    );
  }

  const units = [
    { label: "Ngày", value: remaining.days },
    { label: "Giờ", value: remaining.hours },
    { label: "Phút", value: remaining.minutes },
    { label: "Giây", value: remaining.seconds },
  ];

  return (
    <div className="countdown-grid" aria-label="Thời gian còn lại" role="timer">
      {units.map((unit) => (
        <span className="countdown-cell" key={unit.label}>
          <strong>{String(unit.value).padStart(2, "0")}</strong>
          <small>{unit.label}</small>
        </span>
      ))}
    </div>
  );
}
