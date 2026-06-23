"use client";

import { useState, useSyncExternalStore } from "react";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  className?: string;
  shape?: "circle" | "none";
}

const subscribeToHydration = () => () => {};
const DEFAULT_AVATAR_URL = "/default-profile-avatar.svg";

export function ProfileAvatar({
  avatarUrl,
  className = "size-20",
  shape = "circle",
}: ProfileAvatarProps) {
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [failedUrls, setFailedUrls] = useState<string[]>([]);
  const preferredImageUrl =
    avatarUrl && !failedUrls.includes(avatarUrl)
      ? avatarUrl
      : !failedUrls.includes(DEFAULT_AVATAR_URL)
        ? DEFAULT_AVATAR_URL
        : null;
  const imageUrl = isHydrated ? preferredImageUrl : null;

  return (
    <div
      aria-hidden="true"
      className={`${className} relative grid shrink-0 place-items-center overflow-hidden bg-[var(--color-surface-raised)] text-[var(--color-muted)] ring-1 ring-[var(--color-border)]`}
      style={shape === "circle" ? { borderRadius: "50%" } : undefined}
    >
      {imageUrl ? (
        // Storage paths are constrained to the public avatars bucket.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={() =>
            setFailedUrls((current) =>
              current.includes(imageUrl) ? current : [...current, imageUrl],
            )
          }
          src={imageUrl}
        />
      ) : (
        <svg
          fill="none"
          height="52%"
          viewBox="0 0 48 48"
          width="52%"
        >
          <circle cx="24" cy="17" r="8" fill="currentColor" opacity="0.72" />
          <path
            d="M10.5 40c.7-8 6-12.5 13.5-12.5S36.8 32 37.5 40"
            fill="currentColor"
            opacity="0.72"
          />
        </svg>
      )}
    </div>
  );
}
