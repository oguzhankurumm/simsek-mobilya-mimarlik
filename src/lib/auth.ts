import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "crypto";

// jose is used instead of jsonwebtoken because Next 16 middleware runs in Edge
// runtime, where Node's `crypto` module isn't available. jose ships an Edge-
// compatible WebCrypto implementation.

export const AUTH_COOKIE_NAME = "simsek_session";
export const ADMIN_COOKIE_NAME = "simsek_admin_session";
export const SESSION_TTL_DAYS = 30;
export const ADMIN_SESSION_TTL_DAYS = 7;

const BCRYPT_ROUNDS = 12;

export type TokenPayload = {
  userId: string;
  role: "CUSTOMER" | "ADMIN";
  // Session id this token is bound to. Lets logout / password-reset revoke the
  // token server-side (see verifySession in get-user.ts). Optional so tokens
  // minted before session-binding still verify on signature until they expire.
  sid?: string;
};

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET env var missing or too short (need >= 32 chars).",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signToken(
  payload: TokenPayload,
  ttlDays = SESSION_TTL_DAYS,
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttlDays}d`)
    .sign(getJwtSecret());
}

export async function verifyToken(
  token: string,
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (
      typeof payload.userId !== "string" ||
      (payload.role !== "CUSTOMER" && payload.role !== "ADMIN")
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      role: payload.role,
      sid: typeof payload.sid === "string" ? payload.sid : undefined,
    };
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Tokens are stored hashed so a DB leak can't be replayed against the live
// session/reset endpoints. The raw value only lives in the cookie / email.
export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function generateResetCode(): string {
  // 6-digit numeric, padded with leading zeros.
  const n = randomBytes(4).readUInt32BE(0) % 1_000_000;
  return n.toString().padStart(6, "0");
}
