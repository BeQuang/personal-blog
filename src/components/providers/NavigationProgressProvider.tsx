"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import {
  finishNavigationProgress,
  startNavigationProgress,
} from "@/lib/loading-progress";

function isModifiedClick(event: MouseEvent) {
  return event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey;
}

export function NavigationProgressProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    finishNavigationProgress();
  }, [pathname, search]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || isModifiedClick(event)) return;
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.dataset.noProgress === "true"
      ) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      if (
        nextUrl.origin !== currentUrl.origin ||
        (nextUrl.pathname === currentUrl.pathname &&
          nextUrl.search === currentUrl.search)
      ) {
        return;
      }

      startNavigationProgress();
    };

    const handleHistoryNavigation = () => startNavigationProgress();
    const handlePageHide = () => finishNavigationProgress();

    document.addEventListener("click", handleDocumentClick);
    window.addEventListener("popstate", handleHistoryNavigation);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      window.removeEventListener("popstate", handleHistoryNavigation);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  return null;
}
