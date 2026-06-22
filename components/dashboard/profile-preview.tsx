"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { SocialLinks } from "@/components/profile/social-links";
import { PUBLIC_PROFILE_HOST } from "@/lib/config/site";
import { copy } from "@/lib/copy";
import type { LinkItem } from "@/lib/links/types";
import type { SocialHandles } from "@/lib/profile/social";

import styles from "./dashboard-interactions.module.css";

interface ProfilePreviewProps {
  avatarUrl: string | null;
  username: string;
  bio: string | null;
  links: LinkItem[];
  socialHandles: SocialHandles;
}

function copyWithFallback(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, value.length);

  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
  }
}

function CanvasGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function ShareOptionIcon({ index }: { index: number }) {
  if (index === 0) return <CanvasGlyph className="size-5" />;

  if (index === 1) {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <path d="M5 7h14v12H5zM7 4h10v3H7z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (index === 2) {
    return (
      <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 4h6v6H4V4Zm2 2v2h2V6H6Zm8-2h6v6h-6V4Zm2 2v2h2V6h-2ZM4 14h6v6H4v-6Zm2 2v2h2v-2H6Zm8-2h2v2h-2v-2Zm4 0h2v4h-2v-4Zm-4 4h4v2h-4v-2Z" />
      </svg>
    );
  }

  if (index === 3) {
    return (
      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
        <rect height="16" rx="5" stroke="currentColor" strokeWidth="1.8" width="16" x="4" y="4" />
        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.4" cy="6.7" fill="currentColor" r="1" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="M14 4v10.2a4 4 0 1 1-3-3.87M14 6c1.2 2 2.7 3 5 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
    </svg>
  );
}

export function ProfilePreview({
  avatarUrl,
  username,
  bio,
  links,
  socialHandles,
}: ProfilePreviewProps) {
  const activeLinks = links.filter((link) => link.is_active);
  const [shareState, setShareState] = useState<
    "closed" | "entering" | "open" | "closing"
  >("closed");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const shareContainerRef = useRef<HTMLDivElement>(null);
  const publicPath = `${PUBLIC_PROFILE_HOST}/${username}`;
  const publicUrl = `https://${publicPath}`;
  const requestCloseShare = useCallback(() => {
    setShareState((current) =>
      current === "closed" ? current : "closing",
    );
  }, []);
  const completeOpenShare = useCallback(() => {
    setShareState((current) => (current === "entering" ? "open" : current));
  }, []);
  const completeCloseShare = useCallback(() => setShareState("closed"), []);

  useEffect(() => {
    if (shareState === "entering") {
      const timeoutId = window.setTimeout(completeOpenShare, 280);
      return () => window.clearTimeout(timeoutId);
    }

    if (shareState !== "closing") return;

    const timeoutId = window.setTimeout(completeCloseShare, 280);
    return () => window.clearTimeout(timeoutId);
  }, [completeCloseShare, completeOpenShare, shareState]);

  useEffect(() => {
    if (shareState === "closed") return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") requestCloseShare();
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !shareContainerRef.current?.contains(event.target)
      ) {
        requestCloseShare();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [requestCloseShare, shareState]);

  async function handleCopy() {
    try {
      let copied = false;

      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(publicUrl);
          copied = true;
        } catch {
          copied = false;
        }
      }

      if (!copied) {
        copied = copyWithFallback(publicUrl);
      }

      if (!copied) {
        throw new Error("Copy failed");
      }

      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <aside
      aria-label={copy.dashboard.preview}
      className={styles.previewPane}
    >
      <div className={styles.previewSticky}>
        <div className="sr-only">
          <h2>
            {copy.dashboard.preview}
          </h2>
        </div>

        <div className="relative mx-auto mb-5 w-full max-w-[23rem]" ref={shareContainerRef}>
          <button
            aria-expanded={
              shareState === "entering" || shareState === "open"
            }
            className={`${styles.previewUrlButton} w-full select-none gap-3 px-5 py-3 text-sm`}
            onClick={() => {
              if (shareState === "closing") return;

              setCopyStatus("idle");
              if (shareState === "closed") {
                setShareState("entering");
              } else {
                requestCloseShare();
              }
            }}
            type="button"
          >
            <span className="truncate">{publicPath}</span>
            <svg
              aria-hidden="true"
              className="shrink-0"
              fill="none"
              height="16"
              viewBox="0 0 16 16"
              width="16"
            >
              <path
                d="m5 6 3-3 3 3M8 3v7M4 8v4.5h8V8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </button>

          {shareState !== "closed" ? (
            <section
              className={`${styles.sharePanel} ${shareState === "entering" ? styles.sharePanelEntering : ""} ${shareState === "closing" ? styles.sharePanelClosing : ""} absolute inset-x-0 top-full z-20 mt-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]`}
              data-phase={shareState}
              onAnimationEnd={(event) => {
                if (event.target !== event.currentTarget) return;

                if (shareState === "entering") {
                  completeOpenShare();
                } else if (shareState === "closing") {
                  completeCloseShare();
                }
              }}
            >
              <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
                <h3 className="text-lg font-bold text-[var(--color-text)]">
                  {copy.share.title}
                </h3>
                <button
                  aria-label={copy.share.close}
                  className={`${styles.shareCloseButton} size-9 p-0`}
                  onClick={requestCloseShare}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="16"
                    viewBox="0 0 16 16"
                    width="16"
                  >
                    <path
                      d="m4 4 8 8m0-8-8 8"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.7"
                    />
                  </svg>
                </button>
              </div>

              <div className="mx-4 flex min-w-0 items-center gap-2 rounded-xl border border-[var(--color-border)] p-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--color-surface-raised)] text-[var(--color-text)]">
                  <CanvasGlyph className="size-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--color-text)]">
                  {publicPath}
                </span>
                <button
                  className={`${styles.copyButton} min-h-9 shrink-0 px-3 text-xs`}
                  onClick={handleCopy}
                  type="button"
                >
                  {copy.share.copy}
                </button>
              </div>
              {copyStatus !== "idle" ? (
                <p
                  aria-live="polite"
                  className={`mx-4 mt-2 text-xs font-semibold ${copyStatus === "copied" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}
                  role="status"
                >
                  {copyStatus === "copied"
                    ? copy.share.copied
                    : copy.share.copyFailed}
                </p>
              ) : null}

              <div
                className="mt-4 grid grid-cols-5 gap-1 border-t border-[var(--color-border)] px-3 py-4"
                role="list"
              >
                {copy.share.placeholders.map((label, index) => (
                  <div className="min-w-0" key={label} role="listitem">
                    <button
                      aria-disabled="true"
                      className={styles.shareOption}
                      disabled
                      type="button"
                    >
                      <span className="grid size-10 place-items-center rounded-full bg-[var(--color-surface-raised)] text-[var(--color-text)]">
                        <ShareOptionIcon index={index} />
                      </span>
                      <span className="max-w-full truncate text-[0.6rem] font-semibold">
                        {label}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div className={styles.phoneFrame}>
          <div className={styles.phoneScreen}>
            <div className="text-center">
              <ProfileAvatar
                avatarUrl={avatarUrl}
                className="mx-auto size-[4.75rem]"
              />
              <h3 className="mt-4 text-lg font-bold tracking-[-0.03em] text-[var(--color-text)]">
                @{username}
              </h3>
              {bio ? (
                <p className="mx-auto mt-2 line-clamp-3 max-w-60 whitespace-pre-wrap text-xs leading-5 text-[var(--color-muted)]">
                  {bio}
                </p>
              ) : null}
              <SocialLinks className="mt-3" handles={socialHandles} />
            </div>

            <div className="mt-6 space-y-2.5">
              {activeLinks.length > 0 ? (
                activeLinks.map((link) => (
                  <div
                    className="preview-item flex min-h-12 items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-xs font-semibold text-[var(--color-text)]"
                    key={link.id}
                  >
                    <span className="truncate">{link.title}</span>
                    <svg
                      aria-hidden="true"
                      className="shrink-0 text-[var(--color-accent)]"
                      fill="none"
                      height="14"
                      viewBox="0 0 14 14"
                      width="14"
                    >
                      <path
                        d="M3 11 11 3M5 3h6v6"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.6"
                      />
                    </svg>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] px-4 py-8 text-center text-xs leading-5 text-[var(--color-muted)]">
                  {copy.publicProfile.empty}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
