"use client";

import { useEffect, useRef, useState } from "react";

import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { PUBLIC_PROFILE_HOST } from "@/lib/config/site";
import { copy } from "@/lib/copy";
import type { LinkItem } from "@/lib/links/types";

interface ProfilePreviewProps {
  avatarUrl: string | null;
  username: string;
  bio: string | null;
  links: LinkItem[];
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

export function ProfilePreview({
  avatarUrl,
  username,
  bio,
  links,
}: ProfilePreviewProps) {
  const activeLinks = links.filter((link) => link.is_active);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const shareContainerRef = useRef<HTMLDivElement>(null);
  const publicPath = `${PUBLIC_PROFILE_HOST}/${username}`;
  const publicUrl = `https://${publicPath}`;

  useEffect(() => {
    if (!isShareOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsShareOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !shareContainerRef.current?.contains(event.target)
      ) {
        setIsShareOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isShareOpen]);

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
      className="min-w-0 border-t border-[var(--color-border)] pt-8 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0"
    >
      <div className="sticky top-5">
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[var(--color-text)]">
            {copy.dashboard.preview}
          </h2>
        </div>

        <div className="relative mb-4" ref={shareContainerRef}>
          <button
            aria-expanded={isShareOpen}
            className="button-secondary flex w-full select-none items-center justify-between gap-3 px-4 py-3 text-sm"
            onClick={() => {
              setCopyStatus("idle");
              setIsShareOpen((current) => !current);
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

          {isShareOpen ? (
            <section className="absolute inset-x-0 top-full z-20 mt-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-panel)]">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-[var(--color-text)]">
                  {copy.share.title}
                </h3>
                <button
                  aria-label={copy.share.close}
                  className="button-quiet grid size-9 min-h-9 place-items-center rounded-xl p-0"
                  onClick={() => setIsShareOpen(false)}
                  type="button"
                >
                  ×
                </button>
              </div>

              <p className="mt-3 break-all rounded-xl bg-[var(--color-surface-raised)] px-3 py-2 text-xs text-[var(--color-muted)]">
                {publicUrl}
              </p>
              <button
                className="button-primary mt-3 w-full px-4 text-sm"
                onClick={handleCopy}
                type="button"
              >
                {copy.share.copy}
              </button>
              {copyStatus !== "idle" ? (
                <p
                  aria-live="polite"
                  className={`mt-2 text-xs font-semibold ${copyStatus === "copied" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}
                  role="status"
                >
                  {copyStatus === "copied"
                    ? copy.share.copied
                    : copy.share.copyFailed}
                </p>
              ) : null}

              <div className="mt-4 grid grid-cols-2 gap-2" role="list">
                {copy.share.placeholders.map((label) => (
                  <div
                    key={label}
                    role="listitem"
                  >
                    <button
                      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-center text-xs font-semibold text-[var(--color-muted)]"
                      disabled
                      type="button"
                    >
                      {label}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <div className="mx-auto max-w-[22rem] rounded-[2.5rem] border border-[var(--color-surface)] bg-[var(--color-page)] p-3 shadow-[0_28px_70px_rgba(62,54,120,0.16)] ring-1 ring-[var(--color-border)]">
          <div className="min-h-[34rem] rounded-[2rem] bg-[var(--color-surface)] px-5 pb-8 pt-9 sm:min-h-[38rem]">
            <div className="text-center">
              <ProfileAvatar
                avatarUrl={avatarUrl}
                className="mx-auto size-20 rounded-[1.75rem]"
              />
              <h3 className="mt-5 text-xl font-bold tracking-[-0.03em] text-[var(--color-text)]">
                @{username}
              </h3>
              {bio ? (
                <p className="mx-auto mt-3 line-clamp-3 max-w-60 whitespace-pre-wrap text-sm leading-5 text-[var(--color-muted)]">
                  {bio}
                </p>
              ) : null}
            </div>

            <div className="mt-7 space-y-2.5">
              {activeLinks.length > 0 ? (
                activeLinks.map((link) => (
                  <div
                    className="preview-item flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm font-bold text-[var(--color-text)]"
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
