import { randomBytes } from "crypto";

// Server-side, non-enumerable. Format: SM-XXXXXXXX (8 chars, ~28B keyspace).
// Customer reads this from the WhatsApp dekont message; anyone who guesses it
// could view the order, so it MUST be unguessable. Combine with
// orderNumber + phone last-4 for tracking page access.

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L

export function generateOrderNumber(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `SM-${out}`;
}

export function isValidOrderNumberFormat(value: string): boolean {
  return /^SM-[A-Z2-9]{8}$/.test(value);
}
