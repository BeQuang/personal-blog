import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const VERSION = "v1";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(keyValue = process.env.SOCIAL_OAUTH_ENCRYPTION_KEY) {
  const normalized = keyValue?.trim();
  if (!normalized) {
    throw new Error("Thiếu cấu hình SOCIAL_OAUTH_ENCRYPTION_KEY.");
  }
  const key = Buffer.from(normalized, "base64");
  if (key.length !== 32) {
    throw new Error("SOCIAL_OAUTH_ENCRYPTION_KEY phải là khóa base64 32 byte.");
  }
  return key;
}

export function encryptSocialToken(value: string, keyValue?: string) {
  if (!value) throw new Error("Không thể mã hóa token trống.");
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(keyValue), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

export function decryptSocialToken(payload: string, keyValue?: string) {
  const [version, ivValue, authTagValue, ciphertextValue, extra] = payload.split(".");
  if (
    version !== VERSION
    || !ivValue
    || !authTagValue
    || !ciphertextValue
    || extra !== undefined
  ) {
    throw new Error("Token OAuth đã mã hóa không hợp lệ.");
  }
  const iv = Buffer.from(ivValue, "base64url");
  const authTag = Buffer.from(authTagValue, "base64url");
  const ciphertext = Buffer.from(ciphertextValue, "base64url");
  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error("Token OAuth đã mã hóa không hợp lệ.");
  }
  const decipher = createDecipheriv(ALGORITHM, getEncryptionKey(keyValue), iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString("utf8");
}
