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
        <label className="text-sm font-medium text-slate-800" htmlFor="username">
          {copy.onboarding.usernameLabel}
        </label>
        <input
          autoCapitalize="none"
          autoComplete="username"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
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
        <p className="text-xs text-slate-500">{copy.onboarding.usernameHint}</p>
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-slate-800"
          htmlFor="displayName"
        >
          {copy.onboarding.displayNameLabel}
        </label>
        <input
          autoComplete="name"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
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
          <label className="text-sm font-medium text-slate-800" htmlFor="bio">
            {copy.onboarding.bioLabel}
          </label>
          <span className="text-xs text-slate-500">
            {copy.onboarding.bioOptional}
          </span>
        </div>
        <textarea
          className="min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
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
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <button
        className="w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? copy.onboarding.processing : copy.onboarding.submit}
      </button>
    </form>
  );
}
