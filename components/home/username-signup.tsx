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
import styles from "@/app/landing.module.css";

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
        <label className={`${styles.usernameField} field-shell flex min-h-[3.25rem] min-w-0 flex-1 items-center rounded-[var(--radius-control)] border pl-4`}>
          <span className="sr-only">{copy.home.signup.label}</span>
          <span
            aria-hidden="true"
            className={`${styles.prefix} pointer-events-none shrink-0 select-none text-sm font-semibold`}
          >
            {PUBLIC_PROFILE_HOST}/
          </span>
          <input
            aria-describedby={error ? "landingUsernameError" : undefined}
            aria-invalid={error ? true : undefined}
            autoCapitalize="none"
            autoComplete="username"
            className={`${styles.usernameInput} min-w-0 flex-1 bg-transparent px-1 py-3 pr-4 text-sm font-semibold outline-none`}
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
          className={`${styles.focusable} button-landing-signup button-primary shrink-0 px-7 py-3.5`}
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
