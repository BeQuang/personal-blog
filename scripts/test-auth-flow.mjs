import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";

import { z } from "zod";

if (existsSync(".env.local")) {
  loadEnvFile(".env.local");
}

const testConfig = z
  .object({
    email: z.email(),
    password: z.string().min(1),
    protectedPath: z.string().startsWith("/admin"),
    protectedStatus: z.coerce.number().int().min(200).max(599),
    siteUrl: z.url(),
  })
  .parse({
    email: process.env.BOOTSTRAP_ADMIN_EMAIL,
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
    protectedPath: process.env.AUTH_TEST_PROTECTED_PATH ?? "/admin/settings",
    protectedStatus: process.env.AUTH_TEST_PROTECTED_STATUS ?? "200",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  });

const cookieJar = new Map();

function decodeHtmlAttribute(value = "") {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
}

function updateCookies(response) {
  for (const rawCookie of response.headers.getSetCookie()) {
    const pair = rawCookie.split(";", 1)[0];
    const separatorIndex = pair.indexOf("=");
    const name = pair.slice(0, separatorIndex);
    const value = pair.slice(separatorIndex + 1);

    if (value) {
      cookieJar.set(name, value);
    } else {
      cookieJar.delete(name);
    }
  }
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers);

  if (cookieJar.size > 0) {
    headers.set(
      "cookie",
      [...cookieJar]
        .map(([name, value]) => `${name}=${value}`)
        .join("; "),
    );
  }

  const response = await fetch(new URL(path, testConfig.siteUrl), {
    ...options,
    headers,
    redirect: "manual",
  });
  updateCookies(response);
  return response;
}

function getForm(html, predicate) {
  return [...html.matchAll(/<form[^>]*>[\s\S]*?<\/form>/g)]
    .map((match) => match[0])
    .find(predicate);
}

function getHiddenFields(formHtml) {
  const fields = new Map();
  const inputPattern =
    /<input[^>]*type="hidden"[^>]*name="([^"]+)"(?:[^>]*value="([^"]*)")?[^>]*>/g;

  for (const match of formHtml.matchAll(inputPattern)) {
    fields.set(
      decodeHtmlAttribute(match[1]),
      decodeHtmlAttribute(match[2]),
    );
  }

  return fields;
}

function toFormData(fields) {
  const formData = new FormData();

  for (const [name, value] of fields) {
    formData.append(name, value);
  }

  return formData;
}

function assertStatus(response, expected, label) {
  if (response.status !== expected) {
    throw new Error(`${label}: expected ${expected}, received ${response.status}`);
  }
}

const anonymousAdminResponse = await request("/admin");
assertStatus(anonymousAdminResponse, 307, "Anonymous Admin redirect");

const loginPageResponse = await request("/admin/login");
assertStatus(loginPageResponse, 200, "Login page");
const loginPageHtml = await loginPageResponse.text();
const loginForm = getForm(
  loginPageHtml,
  (form) => form.includes('class="admin-login-form"'),
);

if (!loginForm) {
  throw new Error("Login form was not found");
}

const loginFields = getHiddenFields(loginForm);
loginFields.set("email", testConfig.email);
loginFields.set("password", testConfig.password);
loginFields.set("next", testConfig.protectedPath);

const loginResponse = await request("/admin/login", {
  method: "POST",
  headers: { origin: testConfig.siteUrl },
  body: toFormData(loginFields),
});
assertStatus(loginResponse, 303, "Login action");

const protectedResponse = await request(testConfig.protectedPath);
assertStatus(
  protectedResponse,
  testConfig.protectedStatus,
  "Protected Admin page",
);
const authenticatedAdminResponse =
  protectedResponse.status === 200
    ? protectedResponse
    : await request("/admin");
assertStatus(authenticatedAdminResponse, 200, "Authenticated Admin shell");
const authenticatedAdminHtml = await authenticatedAdminResponse.text();
const logoutForm = getForm(
  authenticatedAdminHtml,
  (form) => form.includes('aria-label="Đăng xuất"'),
);

if (!logoutForm) {
  throw new Error("Logout form was not found after authentication");
}

const logoutResponse = await request("/admin", {
  method: "POST",
  headers: { origin: testConfig.siteUrl },
  body: toFormData(getHiddenFields(logoutForm)),
});
assertStatus(logoutResponse, 303, "Logout action");

const adminAfterLogoutResponse = await request("/admin");
assertStatus(adminAfterLogoutResponse, 307, "Admin after logout");

console.log(
  JSON.stringify({
    adminAfterLogout: adminAfterLogoutResponse.status,
    authenticatedAdmin: authenticatedAdminResponse.status,
    loginAction: loginResponse.status,
    logoutAction: logoutResponse.status,
    protectedRoute: protectedResponse.status,
  }),
);
