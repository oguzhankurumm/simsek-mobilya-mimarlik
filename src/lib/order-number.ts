import { randomBytes } from "crypto";

// Server-side, non-enumerable. Format: SM-XXXXXXXX (8 chars, ~28B keyspace).
// Customer reads this from the WhatsApp dekont message; anyone who guesses it
// could view the order, so it MUST be unguessable. Combine with
// orderNumber + phone last-4 for tracking page access.

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L

// Mirror the alphabet exactly so isValidOrderNumberFormat can't accept
// codes generateOrderNumber would never produce.
const ALPHABET_REGEX = new RegExp(`^SM-[${ALPHABET}]{8}$`);

export function generateOrderNumber(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `SM-${out}`;
}

export function isValidOrderNumberFormat(value: string): boolean {
  return ALPHABET_REGEX.test(value);
}
