"use client";

import { useActionState } from "react";

import { createProfileAction } from "@/app/actions/profile";
import { copy } from "@/lib/copy";
import {
  BIO_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  initialProfileActionState,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "@/lib/profile/validation";

const DISPLAY_NAME_PATTERN = String.raw`.*\S.*`;

export function ProfileForm() {
  const [state, formAction, isPending] = useActionState(
    createProfileAction,
    initialProfileActionState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor="username">
          {copy.onboarding.usernameLabel}
        </label>
        <input
          autoCapitalize="none"
          autoComplete="username"
          className="field-control"
          id="username"
          maxLength={USERNAME_MAX_LENGTH}
          minLength={USERNAME_MIN_LENGTH}
          name="username"
          onInput={(event) => {
            event.currentTarget.value = event.currentTarget.value.toLowerCase();
          }}
          pattern="[a-z0-9][a-z0-9_]{2,29}"
          placeholder={copy.onboarding.usernamePlaceholder}
          required
          spellCheck={false}
          type="text"
        />
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-muted)]">
          <p>{copy.onboarding.usernameHint}</p>
          <p className="font-semibold text-[var(--color-accent-strong)]">
            {copy.onboarding.usernamePreview}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-semibold text-[var(--color-text)]"
          htmlFor="displayName"
        >
          {copy.onboarding.displayNameLabel}
        </label>
        <input
          autoComplete="name"
          className="field-control"
          id="displayName"
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          name="displayName"
          pattern={DISPLAY_NAME_PATTERN}
          placeholder={copy.onboarding.displayNamePlaceholder}
          required
          type="text"
        />
      </div>

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
