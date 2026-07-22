import assert from "node:assert/strict";

import { getSecurityHeaders } from "../src/config/security.config";
import { getSafeAdminDestination } from "../src/server/auth/safe-redirect";
import { hasPermission } from "../src/server/auth/permissions";
import { getEffectiveCampaignStatus } from "../src/server/services/campaigns.service";
import { internalOrHttpUrlSchema, internalPathSchema } from "../src/server/validation/url.validation";

assert.equal(hasPermission("super_admin", "users:manage"), true);
assert.equal(hasPermission("admin", "users:manage"), false);
assert.equal(hasPermission("editor", "content:write"), true);
assert.equal(hasPermission("editor", "content:publish"), false);
assert.equal(hasPermission("viewer", "analytics:view"), true);
assert.equal(hasPermission("viewer", "media:manage"), false);

assert.equal(getSafeAdminDestination("/admin/posts?status=draft"), "/admin/posts?status=draft");
for (const unsafe of ["https://evil.example", "//evil.example", "/admin/login", "/admin\\evil"]) {
  assert.equal(getSafeAdminDestination(unsafe), "/admin");
}

for (const safe of ["/blog/post", "https://example.com/path", "http://localhost:3000/path"]) {
  assert.equal(internalOrHttpUrlSchema.safeParse(safe).success, true);
}
for (const unsafe of ["javascript:alert(1)", "data:text/html,unsafe", "//evil.example", "https://user:pass@example.com"]) {
  assert.equal(internalOrHttpUrlSchema.safeParse(unsafe).success, false);
}
assert.equal(internalPathSchema.safeParse("/admin/posts").success, true);
assert.equal(internalPathSchema.safeParse("//evil.example").success, false);

const campaign = {
  status: "active" as const,
  startAt: "2026-07-01T00:00:00.000Z",
  endAt: "2026-08-01T00:00:00.000Z",
};
assert.equal(getEffectiveCampaignStatus(campaign, "2026-06-30T23:59:59.000Z"), "upcoming");
assert.equal(getEffectiveCampaignStatus(campaign, "2026-07-15T00:00:00.000Z"), "active");
assert.equal(getEffectiveCampaignStatus(campaign, "2026-08-01T00:00:00.000Z"), "ended");

const productionHeaders = new Map(
  getSecurityHeaders(true).map((header) => [header.key.toLowerCase(), header.value]),
);
for (const required of [
  "content-security-policy",
  "permissions-policy",
  "referrer-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
]) {
  assert.equal(productionHeaders.has(required), true, `Missing ${required}`);
}

async function main() {
  const { submitContact } = await import("../src/server/services/submissions.service");
  await assert.rejects(
    () => submitContact({
      fullName: "A",
      email: "not-an-email",
      phone: "123",
      company: "",
      collaborationType: "review-product",
      budgetRange: "",
      message: "too short",
      turnstileToken: "short",
    }, { fingerprint: "stage21" }),
    { name: "ValidationError" },
  );

  console.log("Stage 21 authorization, URL, campaign, form and header rules: Passed");
}

void main();
