"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";

import { updateSocialHandleAction } from "@/app/actions/profile";
import { copy } from "@/lib/copy";
import {
  SOCIAL_PLATFORM_CONFIG,
  type SocialHandleActionState,
  type SocialHandles,
  type SocialPlatform,
} from "@/lib/profile/social";

import styles from "./dashboard-interactions.module.css";

interface SocialHandleModalProps {
  handles: SocialHandles;
  onClose: () => void;
  onSaved: (handles: SocialHandles) => void;
  platform: SocialPlatform;
}

export function SocialHandleModal({
  handles,
  onClose,
  onSaved,
  platform,
}: SocialHandleModalProps) {
  const config = SOCIAL_PLATFORM_CONFIG[platform];
  const initialState: SocialHandleActionState = {
    status: "idle",
    message: "",
    socialHandles: handles,
  };
  const [state, formAction, isPending] = useActionState(
    updateSocialHandleAction,
    initialState,
  );
  const [phase, setPhase] = useState<"open" | "closing">("open");
  const hasClosedRef = useRef(false);
  const completeClose = useCallback(() => {
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;
    onClose();
  }, [onClose]);
  const requestClose = useCallback(() => {
    if (!isPending) setPhase("closing");
  }, [isPending]);

  useEffect(() => {
    if (phase !== "closing") return;
    const timeoutId = window.setTimeout(completeClose, 280);
    return () => window.clearTimeout(timeoutId);
  }, [completeClose, phase]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") requestClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [requestClose]);

  useEffect(() => {
    if (state.status !== "success" || phase === "closing") return;
    const frameId = requestAnimationFrame(() => {
      onSaved(state.socialHandles);
      requestClose();
    });
    return () => cancelAnimationFrame(frameId);
  }, [onSaved, phase, requestClose, state.socialHandles, state.status]);

  return (
    <div
      aria-hidden={phase === "closing" ? true : undefined}
      className={`${styles.modalOverlay} ${phase === "closing" ? styles.modalOverlayClosing : ""} fixed inset-0 z-50 grid place-items-center bg-[rgba(17,19,26,0.36)] p-4`}
      onAnimationEnd={(event) => {
        if (phase === "closing" && event.target === event.currentTarget) {
          completeClose();
        }
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <section
        aria-labelledby="socialHandleTitle"
        aria-modal="true"
        className={`${styles.modalSurface} ${phase === "closing" ? styles.modalSurfaceClosing : ""} w-full max-w-[32rem] overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-panel)]`}
        role="dialog"
      >
        <div className="grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-3 border-b border-[var(--color-border)] px-6 py-5">
          <span aria-hidden="true" />
          <h2
            className="text-center text-lg font-bold text-[var(--color-text)]"
            id="socialHandleTitle"
          >
            {handles[platform]
              ? copy.socialProfiles.edit(config.label)
              : copy.socialProfiles.add(config.label)}
          </h2>
          <button
            aria-label="Close"
            className={`${styles.shareCloseButton} size-9 p-0`}
            onClick={requestClose}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
              <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
            </svg>
          </button>
        </div>

        <form action={formAction} className="space-y-5 px-6 pb-6 pt-5">
          <input name="platform" type="hidden" value={platform} />
          <div className="space-y-2">
            <label className="sr-only" htmlFor={`${platform}Handle`}>
              {copy.socialProfiles.handleLabel}
            </label>
            <input
              autoFocus
              className={`${styles.socialHandleInput} w-full`}
              defaultValue={handles[platform] ?? ""}
              disabled={isPending}
              id={`${platform}Handle`}
              maxLength={config.maxLength}
              name="handle"
              pattern={config.inputPattern}
              placeholder={`Enter ${config.label} username`}
              type="text"
            />
            <p className="px-1 text-xs text-[var(--color-muted)]">
              {copy.socialProfiles.description}
            </p>
            <p className="px-1 text-xs text-[var(--color-muted)]">
              {copy.socialProfiles.removeHint}
            </p>
          </div>

          {state.message && state.status === "error" ? (
            <p className="status-error" role="status">
              {state.message}
            </p>
          ) : null}

          <div className="grid grid-cols-[auto_1fr] gap-3">
            <button
              className="button-secondary px-5"
              disabled={isPending}
              onClick={requestClose}
              type="button"
            >
              {copy.socialProfiles.cancel}
            </button>
            <button
              className={`${styles.socialSaveButton} min-h-11 px-5`}
              disabled={isPending}
              type="submit"
            >
              {isPending
                ? copy.socialProfiles.saving
                : copy.socialProfiles.save}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
