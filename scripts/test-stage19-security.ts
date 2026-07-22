import assert from "node:assert/strict";

import { createContactNotificationTemplate } from "../src/server/email/templates/contact-notification";
import { verifyTurnstileToken } from "../src/server/anti-spam/turnstile";
import { escapeCsvCell } from "../src/server/export/safe-csv";
import { MemoryRateLimiter } from "../src/server/rate-limit/rate-limiter";

const dangerousCsvValues = ["=SUM(1,1)", "+cmd", "-2+3", "@IMPORTXML()", "  =1+1"];
for (const value of dangerousCsvValues) {
  assert.equal(escapeCsvCell(value).startsWith('"\''), true);
}
assert.equal(escapeCsvCell('safe "value"'), '"safe ""value"""');

const template = createContactNotificationTemplate({
  submissionId: "submission-id",
  fullName: "<script>alert(1)</script>\r\nBcc:test@example.com",
  email: "sender@example.com",
  collaborationType: "Review",
  message: "<img src=x onerror=alert(1)>",
  createdAt: new Date("2026-07-22T00:00:00.000Z"),
});
assert.equal(template.html.includes("<script>"), false);
assert.equal(template.html.includes("<img src=x"), false);
assert.equal(template.subject.includes("\r"), false);
assert.equal(template.subject.includes("\n"), false);

async function main() {
  const limiter = new MemoryRateLimiter();
  const policy = { limit: 2, window: "1 m" } as const;
  assert.equal((await limiter.check("test", "fingerprint", policy)).success, true);
  assert.equal((await limiter.check("test", "fingerprint", policy)).success, true);
  assert.equal((await limiter.check("test", "fingerprint", policy)).success, false);

  const originalFetch = globalThis.fetch;
  const originalTurnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  try {
    globalThis.fetch = async () => Response.json({ success: true });
    assert.equal(
      (await verifyTurnstileToken("test-token", "contact")).success,
      false,
    );

    globalThis.fetch = async () =>
      Response.json({ success: true, action: "contact" });
    assert.equal(
      (await verifyTurnstileToken("test-token", "contact")).success,
      true,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalTurnstileSecret === undefined) {
      delete process.env.TURNSTILE_SECRET_KEY;
    } else {
      process.env.TURNSTILE_SECRET_KEY = originalTurnstileSecret;
    }
  }

  console.log("Stage 19 security helpers: Passed");
}

void main();
