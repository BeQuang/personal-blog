"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import { Button } from "@/components/common/Button";
import { analyticsConsentStorageKey } from "@/config/analytics.config";
import {
  isClientAnalyticsEnabled,
  trackPageView,
} from "@/lib/analytics";

type ConsentState = "unknown" | "granted" | "denied";
const consentChangeEvent = "personal-blog:analytics-consent-change";

function subscribeToConsent(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(consentChangeEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(consentChangeEvent, callback);
  };
}

function getConsentSnapshot(): ConsentState {
  const stored = window.localStorage.getItem(analyticsConsentStorageKey);
  return stored === "granted" || stored === "denied" ? stored : "unknown";
}

export function AnalyticsProvider() {
  const pathname = usePathname();
  const enabled = isClientAnalyticsEnabled();
  const storedConsent = useSyncExternalStore(
    subscribeToConsent,
    getConsentSnapshot,
    () => "unknown",
  );
  const consent = enabled ? storedConsent : "denied";

  useEffect(() => {
    if (consent === "granted") trackPageView();
  }, [consent, pathname]);

  function chooseConsent(value: Exclude<ConsentState, "unknown">) {
    window.localStorage.setItem(analyticsConsentStorageKey, value);
    window.dispatchEvent(new Event(consentChangeEvent));
  }

  if (!enabled || consent !== "unknown" || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <aside
      className="analytics-consent"
      aria-labelledby="analytics-consent-title"
      aria-live="polite"
    >
      <div>
        <strong id="analytics-consent-title">Analytics tôn trọng quyền riêng tư</strong>
        <p>
          Website chỉ ghi sự kiện ẩn danh sau khi bạn đồng ý; không lưu IP đầy đủ hoặc nội dung
          biểu mẫu. <Link href="/privacy">Xem chính sách</Link>.
        </p>
      </div>
      <div className="analytics-consent-actions">
        <Button type="button" variant="ghost" onClick={() => chooseConsent("denied")}>
          Từ chối
        </Button>
        <Button type="button" onClick={() => chooseConsent("granted")}>
          Đồng ý
        </Button>
      </div>
    </aside>
  );
}
