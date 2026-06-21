"use client";

import { useActionState } from "react";

import { registerAction } from "@/app/actions/auth";
import {
  initialAuthActionState,
  type AuthActionState,
} from "@/lib/auth/types";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/auth/validation";
import { copy } from "@/lib/copy";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<
    AuthActionState,
    FormData
  >(registerAction, initialAuthActionState);

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
          autoComplete="new-password"
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
          className={
            state.status === "success"
              ? "status-success"
              : "status-error"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <button
        className="button-primary w-full px-5 py-3"
        disabled={isPending}
        type="submit"
      >
        {isPending ? copy.auth.processing : copy.auth.register.submit}
      </button>
    </form>
  );
}
