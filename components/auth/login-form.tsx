"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth";
import {
  initialAuthActionState,
  type AuthActionState,
} from "@/lib/auth/types";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/auth/validation";
import { copy } from "@/lib/copy";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<
    AuthActionState,
    FormData
  >(loginAction, initialAuthActionState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="email">
          {copy.auth.emailLabel}
        </label>
        <input
          autoComplete="email"
          className="field-control"
          id="email"
          name="email"
          placeholder={copy.auth.emailPlaceholder}
          required
          type="email"
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-semibold text-[var(--color-text)]"
          htmlFor="password"
        >
          {copy.auth.passwordLabel}
        </label>
        <input
          autoComplete="current-password"
          className="field-control"
          id="password"
          maxLength={PASSWORD_MAX_LENGTH}
          minLength={PASSWORD_MIN_LENGTH}
          name="password"
          placeholder={copy.auth.passwordPlaceholder}
          required
          type="password"
        />
      </div>

      {state.message ? (
        <p
          aria-live="polite"
          className="status-error"
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <button
        className="auth-submit-button button-primary w-full px-5 py-3"
        disabled={isPending}
        type="submit"
      >
        {isPending ? copy.auth.processing : copy.auth.login.submit}
      </button>
    </form>
  );
}
