"use client";

import NProgress from "nprogress";

const progressDelayMs = 120;
const navigationTimeoutMs = 15_000;

let configured = false;
let navigationPending = false;
let requestCount = 0;
let startTimer: ReturnType<typeof setTimeout> | null = null;
let navigationTimer: ReturnType<typeof setTimeout> | null = null;

function configureProgress() {
  if (configured || typeof window === "undefined") return;

  NProgress.configure({
    minimum: 0.12,
    showSpinner: false,
    speed: 220,
    trickleSpeed: 180,
  });
  configured = true;
}

function hasPendingWork() {
  return navigationPending || requestCount > 0;
}

function scheduleProgress() {
  configureProgress();
  if (startTimer || NProgress.status !== null) return;

  startTimer = setTimeout(() => {
    startTimer = null;
    if (hasPendingWork()) NProgress.start();
  }, progressDelayMs);
}

function finishProgressWhenIdle() {
  if (hasPendingWork()) return;

  if (startTimer) {
    clearTimeout(startTimer);
    startTimer = null;
  }
  NProgress.done();
}

export function startNavigationProgress() {
  navigationPending = true;
  scheduleProgress();

  if (navigationTimer) clearTimeout(navigationTimer);
  navigationTimer = setTimeout(() => {
    navigationPending = false;
    navigationTimer = null;
    finishProgressWhenIdle();
  }, navigationTimeoutMs);
}

export function finishNavigationProgress() {
  navigationPending = false;
  if (navigationTimer) {
    clearTimeout(navigationTimer);
    navigationTimer = null;
  }
  finishProgressWhenIdle();
}

export function beginRequestProgress() {
  requestCount += 1;
  scheduleProgress();
  let finished = false;

  return () => {
    if (finished) return;
    finished = true;
    requestCount = Math.max(0, requestCount - 1);
    finishProgressWhenIdle();
  };
}

export async function withLoadingProgress<T>(
  operation: (() => Promise<T>) | Promise<T>,
) {
  const finish = beginRequestProgress();
  try {
    return await (typeof operation === "function" ? operation() : operation);
  } finally {
    finish();
  }
}
