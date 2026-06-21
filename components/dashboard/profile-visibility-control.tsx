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
    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:w-auto sm:min-w-56">
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span
            aria-hidden="true"
            className={`size-2.5 rounded-full ${state.isPublished ? "bg-emerald-500" : "bg-slate-400"}`}
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
            className="rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 transition hover:border-orange-400 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
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
          className={`mt-3 text-xs ${state.status === "error" ? "text-red-700" : "text-slate-600"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
