"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

type TurnstileAction = "contact" | "newsletter" | "campaign_submission";

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      action: TurnstileAction;
      theme: "auto";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileWidgetProps {
  action: TurnstileAction;
  onTokenChange: (token: string) => void;
  resetSignal?: number;
}

export function TurnstileWidget({
  action,
  onTokenChange,
  resetSignal = 0,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

  const renderWidget = useCallback(() => {
    if (!siteKey || !containerRef.current || !window.turnstile || widgetIdRef.current) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      theme: "auto",
      callback: onTokenChange,
      "expired-callback": () => onTokenChange(""),
      "error-callback": () => onTokenChange(""),
    });
  }, [action, onTokenChange, siteKey]);

  useEffect(() => {
    const widgetId = widgetIdRef.current;
    if (widgetId && window.turnstile) {
      window.turnstile.reset(widgetId);
      onTokenChange("");
    }
  }, [onTokenChange, resetSignal]);

  useEffect(
    () => () => {
      const widgetId = widgetIdRef.current;
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
        widgetIdRef.current = null;
      }
    },
    [],
  );

  if (!siteKey) {
    return (
      <p className="text-sm text-[var(--danger)]" role="alert">
        Turnstile chưa được cấu hình. Biểu mẫu tạm thời không thể gửi.
      </p>
    );
  }

  return (
    <div className="max-w-full overflow-x-auto" aria-label="Xác minh chống spam">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderWidget}
        onReady={renderWidget}
      />
      <div ref={containerRef} />
    </div>
  );
}
