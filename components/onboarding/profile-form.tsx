"use client";

import { useActionState, useState } from "react";

import { createProfileAction } from "@/app/actions/profile";
import { normalizeUsernameInput } from "@/lib/auth/register-validation";
import { PUBLIC_PROFILE_HOST } from "@/lib/config/site";
import { copy } from "@/lib/copy";
import {
  BIO_MAX_LENGTH,
  initialProfileActionState,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/lib/profile/validation";

interface ProfileFormProps {
  pendingUsername: string | null;
}

export function ProfileForm({ pendingUsername }: ProfileFormProps) {
  const initialState = {
    ...initialProfileActionState,
    showUsernameFallback: pendingUsername === null,
  };
  const [state, formAction, isPending] = useActionState(
    createProfileAction,
    initialState,
  );
  const [username, setUsername] = useState("");
  const displayedUsername = state.showUsernameFallback
    ? username || copy.onboarding.usernamePlaceholder
    : pendingUsername;

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[var(--color-text)]">
          {copy.onboarding.profileUrlLabel}
        </p>
        <div
          aria-label={copy.onboarding.profileUrlLabel}
          className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-accent-soft)] px-4 py-3"
        >
          <p className="font-bold text-[var(--color-accent-strong)]">
            {PUBLIC_PROFILE_HOST}/
            {displayedUsername}
          </p>
        </div>
        <p className="text-xs leading-5 text-[var(--color-muted)]">
          {copy.onboarding.profileUrlHint}
        </p>
      </div>

      {state.showUsernameFallback ? (
        <div className="motion-step-enter space-y-2">
          <label
            className="text-sm font-semibold text-[var(--color-text)]"
            htmlFor="username"
          >
            {copy.onboarding.usernameFallbackLabel}
          </label>
          <input
            autoCapitalize="none"
            autoComplete="username"
            className="field-control"
            id="username"
            maxLength={USERNAME_MAX_LENGTH}
            minLength={USERNAME_MIN_LENGTH}
            name="username"
            onChange={(event) =>
              setUsername(normalizeUsernameInput(event.target.value))
            }
            pattern="[a-z0-9][a-z0-9_]{2,29}"
            placeholder={copy.onboarding.usernamePlaceholder}
            required
            spellCheck={false}
            type="text"
            value={username}
          />
          <p className="text-xs text-[var(--color-muted)]">
            {copy.onboarding.usernameHint}
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="bio">
            {copy.onboarding.bioLabel}
          </label>
          <span className="text-xs text-[var(--color-muted)]">
            {copy.onboarding.bioOptional}
          </span>
        </div>
        <textarea
          className="field-control min-h-28 resize-y"
          id="bio"
          maxLength={BIO_MAX_LENGTH}
          name="bio"
          placeholder={copy.onboarding.bioPlaceholder}
          rows={4}
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
        className="button-primary w-full px-5 py-3"
        disabled={isPending}
        type="submit"
      >
        {isPending ? copy.onboarding.processing : copy.onboarding.submit}
      </button>
    </form>
  );
}
