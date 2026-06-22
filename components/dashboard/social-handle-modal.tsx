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

export function SocialHandleModal({ handles, onClose, onSaved, platform }: SocialHandleModalProps) {
  const config = SOCIAL_PLATFORM_CONFIG[platform];
  const initialState: SocialHandleActionState = {
    status: "idle",
    message: "",
    socialHandles: handles,
  };
  const [state, formAction, isPending] = useActionState(updateSocialHandleAction, initialState);
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
        if (phase === "closing" && event.target === event.currentTarget) completeClose();
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <section
        aria-labelledby="socialHandleTitle"
        aria-modal="true"
        className={`${styles.modalSurface} ${phase === "closing" ? styles.modalSurfaceClosing : ""} w-full max-w-md rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-panel)]`}
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[var(--color-text)]" id="socialHandleTitle">
            {handles[platform] ? copy.socialProfiles.edit(config.label) : copy.socialProfiles.add(config.label)}
          </h2>
          <button aria-label="Close" className={`${styles.shareCloseButton} size-9 p-0`} onClick={requestClose} type="button">×</button>
        </div>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{copy.socialProfiles.description}</p>

        <form action={formAction} className="mt-6 space-y-4">
          <input name="platform" type="hidden" value={platform} />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-text)]" htmlFor={`${platform}Handle`}>
              {copy.socialProfiles.handleLabel}
            </label>
            <input
              autoFocus
              className="field-control"
              defaultValue={handles[platform] ?? ""}
              disabled={isPending}
              id={`${platform}Handle`}
              maxLength={config.maxLength}
              name="handle"
              pattern={config.inputPattern}
              placeholder={copy.socialProfiles.handlePlaceholder}
              type="text"
            />
            <p className="text-xs text-[var(--color-muted)]">{copy.socialProfiles.removeHint}</p>
          </div>

          {state.message && state.status === "error" ? <p className="status-error" role="status">{state.message}</p> : null}

          <div className="flex justify-end gap-3">
            <button className="button-secondary px-5" disabled={isPending} onClick={requestClose} type="button">{copy.socialProfiles.cancel}</button>
            <button className="button-primary px-5" disabled={isPending} type="submit">{isPending ? copy.socialProfiles.saving : copy.socialProfiles.save}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
