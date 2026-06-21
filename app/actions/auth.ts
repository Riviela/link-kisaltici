"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  clearPendingSignupCookies,
  getPendingResendSeconds,
  readPendingSignupEmail,
  restartPendingResendCooldown,
  setPendingSignupCookies,
} from "@/lib/auth/pending-signup";
import {
  validateOtpToken,
  validateRegistrationInput,
} from "@/lib/auth/register-validation";
import { validateCredentials } from "@/lib/auth/validation";
import type {
  AuthActionState,
  OtpActionState,
  ResendOtpActionResult,
} from "@/lib/auth/types";
import { copy } from "@/lib/copy";
import { createClient } from "@/lib/supabase/server";

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");

  if (origin) {
    try {
      return new URL(origin).origin;
    } catch {
      // Fall through to forwarded host headers.
    }
  }

  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

function isAccountExistenceError(error: { code?: string }) {
  return error.code === "email_exists" || error.code === "user_already_exists";
}

export async function registerAction(
  previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  void previousState;

  const supabase = await createClient();
  const { data: currentAuth } = await supabase.auth.getClaims();

  if (currentAuth?.claims) {
    redirect("/dashboard");
  }

  const registration = validateRegistrationInput(formData);

  if (!registration.success) {
    return { status: "error", message: registration.message };
  }

  const origin = await getRequestOrigin();
  let signupError: { code?: string } | null = null;

  try {
    const { error } = await supabase.auth.signUp({
      email: registration.email,
      password: registration.password,
      options: {
        data: {
          pending_username: registration.username,
        },
        emailRedirectTo: new URL("/auth/callback", origin).toString(),
      },
    });

    signupError = error;
  } catch {
    return { status: "error", message: copy.auth.failure.register };
  }

  if (signupError && !isAccountExistenceError(signupError)) {
    return { status: "error", message: copy.auth.failure.register };
  }

  await setPendingSignupCookies(registration.email);
  redirect("/verify-email");
}

export async function verifySignupOtpAction(
  previousState: OtpActionState,
  formData: FormData,
): Promise<OtpActionState> {
  void previousState;

  const email = await readPendingSignupEmail();

  if (!email) {
    redirect("/register?notice=verification-expired");
  }

  const token = validateOtpToken(formData);

  if (!token.success) {
    return { status: "error", message: token.message };
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: token.token,
      type: "email",
    });

    if (error || !data.session || !data.user) {
      return { status: "error", message: copy.auth.failure.verify };
    }
  } catch {
    return { status: "error", message: copy.auth.failure.general };
  }

  await clearPendingSignupCookies();
  redirect("/onboarding");
}

export async function resendSignupOtpAction(): Promise<ResendOtpActionResult> {
  const email = await readPendingSignupEmail();

  if (!email) {
    redirect("/register?notice=verification-expired");
  }

  const remainingSeconds = await getPendingResendSeconds();

  if (remainingSeconds > 0) {
    return {
      status: "error",
      message: copy.auth.otp.resendWait,
      cooldownSeconds: remainingSeconds,
    };
  }

  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      return {
        status: "error",
        message: copy.auth.failure.general,
        cooldownSeconds: 0,
      };
    }
  } catch {
    return {
      status: "error",
      message: copy.auth.failure.general,
      cooldownSeconds: 0,
    };
  }

  const cooldownSeconds = await restartPendingResendCooldown();

  return {
    status: "success",
    message: copy.auth.otp.resendSuccess,
    cooldownSeconds,
  };
}

export async function useDifferentEmailAction(): Promise<void> {
  await clearPendingSignupCookies();
  redirect("/register");
}

export async function loginAction(
  previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  void previousState;

  const supabase = await createClient();
  const { data: currentAuth } = await supabase.auth.getClaims();

  if (currentAuth?.claims) {
    redirect("/dashboard");
  }

  const credentials = validateCredentials(formData);

  if (!credentials.success) {
    return { status: "error", message: credentials.message };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return { status: "error", message: copy.auth.failure.login };
  }

  const { data: verifiedAuth } = await supabase.auth.getClaims();

  if (!verifiedAuth?.claims) {
    return { status: "error", message: copy.auth.failure.login };
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  await supabase.auth.signOut();
  redirect("/login");
}
