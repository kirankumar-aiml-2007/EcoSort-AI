import {
  createHmac,
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'crypto';
import type { Request, Response } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: 'citizen' | 'volunteer' | 'admin';
  expiresAt: number;
}

const COOKIE_NAME = 'ecosort_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const configuredSecret = process.env.SESSION_SECRET;
const sessionSecret = configuredSecret || randomBytes(32).toString('hex');

function signature(payload: string): Buffer {
  return createHmac('sha256', sessionSecret).update(payload).digest();
}

function cookieOptions(): string {
  return `Path=/api; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}

export function setSessionCookie(res: Response, user: Omit<AuthenticatedUser, 'expiresAt'>): void {
  const payload = Buffer.from(JSON.stringify({
    ...user,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  })).toString('base64url');
  const value = `${payload}.${signature(payload).toString('base64url')}`;
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${value}; ${cookieOptions()}`);
}

export function clearSessionCookie(res: Response): void {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  );
}

export function readSession(req: Request): AuthenticatedUser | null {
  const cookie = req.headers.cookie
    ?.split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  if (!cookie) return null;

  const separator = cookie.lastIndexOf('.');
  if (separator <= 0) return null;

  const payload = cookie.slice(0, separator);
  const providedSignature = Buffer.from(cookie.slice(separator + 1), 'base64url');
  const expectedSignature = signature(payload);
  if (
    providedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(providedSignature, expectedSignature)
  ) return null;

  try {
    const user = JSON.parse(Buffer.from(payload, 'base64url').toString()) as AuthenticatedUser;
    if (
      typeof user.id !== 'string' ||
      typeof user.email !== 'string' ||
      typeof user.name !== 'string' ||
      !['citizen', 'volunteer', 'admin'].includes(user.role) ||
      !Number.isInteger(user.expiresAt) ||
      user.expiresAt <= Math.floor(Date.now() / 1000)
    ) return null;
    return user;
  } catch {
    return null;
  }
}

export function hasConfiguredAdminAccount(): boolean {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  return Boolean(adminEmail && adminPassword && adminPassword.length >= 16);
}

export function matchesConfiguredAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!hasConfiguredAdminAccount() || !adminPassword) return false;
  const provided = createHash('sha256').update(password).digest();
  const expected = createHash('sha256').update(adminPassword).digest();
  return timingSafeEqual(provided, expected);
}
