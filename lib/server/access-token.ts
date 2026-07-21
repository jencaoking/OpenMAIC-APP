import { createHmac, timingSafeEqual } from 'crypto';

export const DEFAULT_EXPIRES_IN_MS = 60 * 60 * 24 * 7 * 1000;

/** Create an HMAC-signed token: `timestamp.signature` */
export function createAccessToken(
  accessCode: string,
  expiresInMs: number = DEFAULT_EXPIRES_IN_MS,
): string {
  const timestamp = Date.now().toString();
  const expiry = (Date.now() + expiresInMs).toString();
  const data = `${timestamp}.${expiry}`;
  const signature = createHmac('sha256', accessCode).update(data).digest('hex');
  return `${data}.${signature}`;
}

/** Verify an HMAC-signed token against the access code and check expiry */
export function verifyAccessToken(token: string, accessCode: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [timestamp, expiry, signature] = parts;

  const parsedExpiry = parseInt(expiry, 10);
  if (isNaN(parsedExpiry)) return false;

  if (Date.now() > parsedExpiry) return false;

  const data = `${timestamp}.${expiry}`;
  const expected = createHmac('sha256', accessCode).update(data).digest('hex');

  const sigBuf = Buffer.from(signature, 'hex');
  const expBuf = Buffer.from(expected, 'hex');
  if (sigBuf.length !== expBuf.length) return false;

  return timingSafeEqual(sigBuf, expBuf);
}
