import "server-only";

import { cookies } from "next/headers";

import { isValidEmailAddress, normalizeEmail } from "@/lib/auth/validation";

export const PENDING_SIGNUP_COOKIE_MAX_AGE_SECONDS = 15 * 60;
export const RESEND_COOLDOWN_SECONDS = 60;

const PENDING_EMAIL_COOKIE = "pending_signup_email";
const PENDING_RESEND_COOKIE = "pending_signup_resend_after";
const COOKIE_PATH = "/verify-email";

function getCookieOptions(maxAge = PENDING_SIGNUP_COOKIE_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: COOKIE_PATH,
    maxAge,
  };
}

export async function setPendingSignupCookies(email: string) {
  const cookieStore = await cookies();
  const resendAfter = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;

  cookieStore.set(PENDING_EMAIL_COOKIE, normalizeEmail(email), getCookieOptions());
  cookieStore.set(
    PENDING_RESEND_COOKIE,
    String(resendAfter),
    getCookieOptions(),
  );

  return RESEND_COOLDOWN_SECONDS;
}

export async function readPendingSignupEmail() {
  const cookieStore = await cookies();
  const email = normalizeEmail(cookieStore.get(PENDING_EMAIL_COOKIE)?.value ?? "");

  return isValidEmailAddress(email) ? email : null;
}

export async function getPendingResendSeconds() {
  const cookieStore = await cookies();
  const rawTimestamp = cookieStore.get(PENDING_RESEND_COOKIE)?.value;
  const timestamp = rawTimestamp ? Number(rawTimestamp) : Number.NaN;

  if (!Number.isFinite(timestamp)) {
    return 0;
  }

  const remaining = Math.ceil((timestamp - Date.now()) / 1000);

  return Math.min(RESEND_COOLDOWN_SECONDS, Math.max(0, remaining));
}

export async function restartPendingResendCooldown() {
  const cookieStore = await cookies();
  const resendAfter = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;

  cookieStore.set(
    PENDING_RESEND_COOKIE,
    String(resendAfter),
    getCookieOptions(),
  );

  return RESEND_COOLDOWN_SECONDS;
}

export async function clearPendingSignupCookies() {
  const cookieStore = await cookies();
  const expiredOptions = getCookieOptions(0);

  cookieStore.set(PENDING_EMAIL_COOKIE, "", expiredOptions);
  cookieStore.set(PENDING_RESEND_COOKIE, "", expiredOptions);
}
