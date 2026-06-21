"use client";

import { useActionState } from "react";

import { updateProfileVisibilityAction } from "@/app/actions/profile";
import { copy } from "@/lib/copy";
import type { ProfileVisibilityActionState } from "@/lib/profile/validation";

interface ProfileVisibilityControlProps {
  initialIsPublished: boolean;
}

export function ProfileVisibilityControl({
  initialIsPublished,
}: ProfileVisibilityControlProps) {
  const initialState: ProfileVisibilityActionState = {
    status: "idle",
    message: "",
    isPublished: initialIsPublished,
  };
  const [state, formAction, isPending] = useActionState(
    updateProfileVisibilityAction,
    initialState,
  );

  return (
    <div className="visibility-control w-full rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 sm:w-auto sm:min-w-56">
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
          <span
            aria-hidden="true"
            className={`status-badge size-2.5 rounded-full ${state.isPublished ? "bg-[var(--color-accent)]" : "bg-[#a6a8b2]"}`}
          />
          {state.isPublished
            ? copy.profileVisibility.published
            : copy.profileVisibility.private}
        </span>

        <form action={formAction}>
          <input
            name="isPublished"
            type="hidden"
            value={String(!state.isPublished)}
          />
          <button
            className="button-secondary min-h-9 px-3 text-xs"
            disabled={isPending}
            type="submit"
          >
            {isPending
              ? copy.profileVisibility.processing
              : state.isPublished
                ? copy.profileVisibility.unpublish
                : copy.profileVisibility.publish}
          </button>
        </form>
      </div>

      {state.message ? (
        <p
          aria-live="polite"
          className={`mt-3 text-xs ${state.status === "error" ? "text-[var(--color-danger)]" : "text-[var(--color-muted)]"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
