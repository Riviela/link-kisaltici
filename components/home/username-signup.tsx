"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  isValidRegistrationUsername,
  normalizeUsernameInput,
} from "@/lib/auth/register-validation";
import { PUBLIC_PROFILE_HOST } from "@/lib/config/site";
import { copy } from "@/lib/copy";
import { USERNAME_MAX_LENGTH } from "@/lib/profile/validation";

export function UsernameSignup() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedUsername = normalizeUsernameInput(username);

    if (normalizedUsername.length === 0) {
      router.push("/register");
      return;
    }

    if (!isValidRegistrationUsername(normalizedUsername)) {
      setError(copy.home.signup.error);
      return;
    }

    router.push(`/register?username=${encodeURIComponent(normalizedUsername)}`);
  }

  return (
    <form className="mt-9 max-w-2xl" noValidate onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <label className="field-shell flex min-h-[3.25rem] min-w-0 flex-1 items-center rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] pl-4 focus-within:border-[var(--color-accent)] focus-within:shadow-[0_0_0_4px_var(--color-accent-soft)]">
          <span className="sr-only">{copy.home.signup.label}</span>
          <span
            aria-hidden="true"
            className="pointer-events-none shrink-0 select-none text-sm font-semibold text-[var(--color-muted)]"
          >
            {PUBLIC_PROFILE_HOST}/
          </span>
          <input
            aria-describedby={error ? "landingUsernameError" : undefined}
            aria-invalid={error ? true : undefined}
            autoCapitalize="none"
            autoComplete="username"
            className="min-w-0 flex-1 bg-transparent px-1 py-3 pr-4 text-sm font-semibold text-[var(--color-text)] outline-none"
            maxLength={USERNAME_MAX_LENGTH}
            onChange={(event) => {
              setUsername(normalizeUsernameInput(event.target.value));
              if (error) setError("");
            }}
            placeholder={copy.home.signup.placeholder}
            spellCheck={false}
            type="text"
            value={username}
          />
        </label>

        <button
          className="button-landing-signup button-primary shrink-0 px-7 py-3.5"
          type="submit"
        >
          {copy.home.signup.cta}
        </button>
      </div>

      {error ? (
        <p
          aria-live="polite"
          className="mt-2 text-sm font-semibold text-[var(--color-danger)]"
          id="landingUsernameError"
          role="status"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
