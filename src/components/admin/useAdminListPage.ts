"use client";

import { useCallback, useRef, useState } from "react";

import type { AdminListPage } from "@/types";

type QueryValue = boolean | number | string | undefined;

function buildUrl(endpoint: string, query: Readonly<Record<string, QueryValue>>) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) searchParams.set(key, String(value));
  }
  return `${endpoint}?${searchParams.toString()}`;
}

function isAdminListPage(value: unknown): value is AdminListPage<unknown> {
  if (!value || typeof value !== "object") return false;
  const page = value as Partial<AdminListPage<unknown>>;
  return Array.isArray(page.items)
    && Number.isSafeInteger(page.page)
    && Number.isSafeInteger(page.pageSize)
    && Number.isSafeInteger(page.total)
    && typeof page.sortBy === "string"
    && (page.sortOrder === "asc" || page.sortOrder === "desc");
}

export function useAdminListPage<Item, SortField extends string>(
  endpoint: string,
  initialPage: AdminListPage<Item, SortField>,
  onError: (message: string) => void,
) {
  const [data, setData] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const latestQuery = useRef<Readonly<Record<string, QueryValue>>>({
    page: initialPage.page,
    pageSize: initialPage.pageSize,
    sortBy: initialPage.sortBy,
    sortOrder: initialPage.sortOrder,
  });
  const requestId = useRef(0);

  const load = useCallback(async (query: Readonly<Record<string, QueryValue>>) => {
    const currentRequest = ++requestId.current;
    latestQuery.current = query;
    setLoading(true);
    try {
      const response = await fetch(buildUrl(endpoint, query), {
        cache: "no-store",
        headers: { accept: "application/json" },
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const error = payload && typeof payload === "object" && "error" in payload
          ? String(payload.error)
          : "Không thể tải danh sách.";
        throw new Error(error);
      }
      if (!isAdminListPage(payload)) throw new Error("Response danh sách không đúng cấu trúc.");
      if (currentRequest === requestId.current) {
        setData(payload as AdminListPage<Item, SortField>);
      }
    } catch (error) {
      if (currentRequest === requestId.current) {
        onError(error instanceof Error ? error.message : "Không thể tải danh sách.");
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [endpoint, onError]);

  const reload = useCallback(
    () => load(latestQuery.current),
    [load],
  );

  return { data, load, loading, reload };
}
