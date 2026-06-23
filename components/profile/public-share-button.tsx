"use client";

import { useState } from "react";

import { copy } from "@/lib/copy";

import styles from "./public-profile.module.css";

interface PublicShareButtonProps {
  profileUrl: string;
  username: string;
}

function copyWithFallback(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  textarea.style.position = "fixed";
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

export function PublicShareButton({
  profileUrl,
  username,
}: PublicShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleShare() {
    setStatus("idle");

    if (navigator.share) {
      try {
        await navigator.share({
          title: `@${username}`,
          url: profileUrl,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      let copied = false;

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(profileUrl);
        copied = true;
      } else {
        copied = copyWithFallback(profileUrl);
      }

      if (!copied) throw new Error("Copy failed");
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={styles.publicShareWrap}>
      <button
        aria-label={copy.share.title}
        className={styles.publicShareButton}
        onClick={handleShare}
        type="button"
      >
        <svg aria-hidden="true" fill="none" viewBox="0 0 20 20">
          <path
            d="M10 3v9M6.8 6.2 10 3l3.2 3.2M5 9.5v5.2c0 .7.6 1.3 1.3 1.3h7.4c.7 0 1.3-.6 1.3-1.3V9.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      </button>
      {status !== "idle" ? (
        <span aria-live="polite" className={styles.publicShareStatus}>
          {status === "copied" ? copy.share.copied : copy.share.copyFailed}
        </span>
      ) : null}
    </div>
  );
}
