"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";

import { createLinkFromUrlAction } from "@/app/actions/links";
import { copy } from "@/lib/copy";
import { initialLinkPickerActionState, type LinkItem } from "@/lib/links/types";
import { validateLinkUrlValue } from "@/lib/links/validation";

import styles from "./dashboard-interactions.module.css";

interface AddLinkModalProps {
  onClose: () => void;
  onPendingChange: (pending: boolean) => void;
  onSuccess: (link: LinkItem, message: string) => void;
}

function LinkGlyph() {
  return (
    <svg aria-hidden="true" fill="none" height="21" viewBox="0 0 24 24" width="21">
      <path
        d="M9.5 14.5 14.5 9M7.4 16.6l-1 1a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0M16.6 7.4l1-1a3.5 3.5 0 0 1 5 5l-4 4a3.5 3.5 0 0 1-5 0"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function AddLinkModal({
  onClose,
  onPendingChange,
  onSuccess,
}: AddLinkModalProps) {
  const [state, formAction, isPending] = useActionState(
    createLinkFromUrlAction,
    initialLinkPickerActionState,
  );
  const [phase, setPhase] = useState<"open" | "closing">("open");
  const [urlValue, setUrlValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const hasClosedRef = useRef(false);
  const validation =
    urlValue.trim().length > 0 ? validateLinkUrlValue(urlValue) : null;
  const completeClose = useCallback(() => {
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;
    onClose();
  }, [onClose]);
  const requestClose = useCallback(() => {
    if (!isPending) setPhase("closing");
  }, [isPending]);

  useEffect(() => onPendingChange(isPending), [isPending, onPendingChange]);

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
      onSuccess(state.link, state.message);
      requestClose();
    });
    return () => cancelAnimationFrame(frameId);
  }, [onSuccess, phase, requestClose, state]);

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
        aria-labelledby="addLinkTitle"
        aria-modal="true"
        className={`${styles.modalSurface} ${phase === "closing" ? styles.modalSurfaceClosing : ""} min-h-[min(36rem,calc(100dvh-2rem))] w-full max-w-[52rem] overflow-hidden rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-panel)]`}
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] px-6 py-5 sm:px-8">
          <h2
            className="text-2xl font-bold text-[var(--color-text)]"
            id="addLinkTitle"
          >
            {copy.linkPicker.title}
          </h2>
          <button
            aria-label={copy.linkPicker.close}
            className={`${styles.shareCloseButton} size-9 p-0`}
            onClick={requestClose}
            type="button"
          >
            <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
              <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
            </svg>
          </button>
        </div>

        <form action={formAction} className="px-6 py-5 sm:px-8">
          <label className="sr-only" htmlFor="linkPickerUrl">
            {copy.linkPicker.inputLabel}
          </label>
          <div className={`${styles.linkPickerField} flex items-center gap-3 rounded-[30px] px-5`}>
            <svg aria-hidden="true" className="size-5 shrink-0 text-[var(--color-text)]" fill="none" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
            </svg>
            <input
              autoFocus
              className="min-h-14 min-w-0 flex-1 bg-transparent text-[var(--color-text)] outline-none"
              disabled={isPending}
              id="linkPickerUrl"
              name="url"
              onChange={(event) => setUrlValue(event.currentTarget.value)}
              placeholder={copy.linkPicker.inputPlaceholder}
              ref={inputRef}
              type="text"
              value={urlValue}
            />
          </div>

          <div className="mt-9">
            {validation?.success ? (
              <>
                <p className="mb-3 px-3 text-sm text-[var(--color-text)]">
                  {copy.linkPicker.resultCount}
                </p>
                <button
                  className={styles.linkPickerResult}
                  disabled={isPending}
                  type="submit"
                >
                  <span className={styles.linkPickerResultIcon}>
                    <LinkGlyph />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-[var(--color-text)]">
                      {copy.linkPicker.resultTitle}
                    </span>
                    <span className="block truncate text-sm text-[var(--color-muted)]">
                      {validation.url}
                    </span>
                  </span>
                  <svg aria-hidden="true" className="shrink-0 text-[var(--color-muted)]" fill="none" height="18" viewBox="0 0 18 18" width="18">
                    <path d="m7 4 5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                  </svg>
                </button>
              </>
            ) : urlValue.trim().length === 0 ? (
              <button
                className={styles.linkPickerResult}
                onClick={() => inputRef.current?.focus()}
                type="button"
              >
                <span className={styles.linkPickerResultIcon}>
                  <LinkGlyph />
                </span>
                <span className="font-semibold text-[var(--color-text)]">
                  {copy.linkPicker.emptyOption}
                </span>
              </button>
            ) : (
              <p className="status-error">{copy.linkPicker.invalid}</p>
            )}
          </div>

          {state.status === "error" ? (
            <p className="status-error mt-4" role="status">
              {state.message}
            </p>
          ) : null}
          {isPending ? (
            <p className="mt-4 text-sm font-semibold text-[var(--color-muted)]" role="status">
              {copy.linkPicker.adding}
            </p>
          ) : null}
        </form>
      </section>
    </div>
  );
}
