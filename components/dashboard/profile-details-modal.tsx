"use client";

import { useActionState, useEffect } from "react";

import { updateProfileBioAction } from "@/app/actions/profile";
import { copy } from "@/lib/copy";
import {
  BIO_MAX_LENGTH,
  type ProfileBioActionState,
} from "@/lib/profile/validation";

interface ProfileDetailsModalProps {
  bio: string | null;
  onClose: () => void;
  onSaved: (bio: string | null) => void;
  username: string;
}

export function ProfileDetailsModal({
  bio,
  onClose,
  onSaved,
  username,
}: ProfileDetailsModalProps) {
  const initialState: ProfileBioActionState = {
    status: "idle",
    message: "",
    bio,
  };
  const [state, formAction, isPending] = useActionState(
    updateProfileBioAction,
    initialState,
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPending, onClose]);

  useEffect(() => {
    if (state.status === "success") {
      onSaved(state.bio);
    }
  }, [onSaved, state.bio, state.status]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[rgba(17,19,26,0.36)] p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) onClose();
      }}
    >
      <section
        aria-labelledby="profileDetailsTitle"
        aria-modal="true"
        className="w-full max-w-lg rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-panel)] sm:p-8"
        role="dialog"
      >
        <h2
          className="text-2xl font-bold tracking-[-0.035em] text-[var(--color-text)]"
          id="profileDetailsTitle"
        >
          {copy.profileDetails.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          {copy.profileDetails.description}
        </p>

        <form action={formAction} className="mt-7 space-y-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {copy.profileDetails.usernameLabel}
            </p>
            <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 font-bold text-[var(--color-text)]">
              @{username}
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-semibold text-[var(--color-text)]"
              htmlFor="profileBio"
            >
              {copy.profileDetails.bioLabel}
            </label>
            <textarea
              autoFocus
              className="field-control min-h-32 resize-y"
              defaultValue={bio ?? ""}
              disabled={isPending}
              id="profileBio"
              maxLength={BIO_MAX_LENGTH}
              name="bio"
              rows={5}
            />
          </div>

          {state.message ? (
            <p
              aria-live="polite"
              className={
                state.status === "error" ? "status-error" : "status-success"
              }
              role="status"
            >
              {state.message}
            </p>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              className="button-secondary px-5"
              disabled={isPending}
              onClick={onClose}
              type="button"
            >
              {copy.profileDetails.cancel}
            </button>
            <button
              className="button-primary px-5"
              disabled={isPending}
              type="submit"
            >
              {isPending
                ? copy.profileDetails.saving
                : copy.profileDetails.save}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
