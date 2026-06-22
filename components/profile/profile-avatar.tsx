"use client";

import { useState, useSyncExternalStore } from "react";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  className?: string;
}

const subscribeToHydration = () => () => {};

export function ProfileAvatar({
  avatarUrl,
  className = "size-20 rounded-[1.75rem]",
}: ProfileAvatarProps) {
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imageUrl =
    isHydrated && avatarUrl && failedUrl !== avatarUrl ? avatarUrl : null;

  return (
    <div
      aria-hidden="true"
      className={`${className} relative grid shrink-0 place-items-center overflow-hidden bg-[var(--color-surface-raised)] text-[var(--color-muted)] ring-1 ring-[var(--color-border)]`}
    >
      {imageUrl ? (
        // Storage paths are constrained to the public avatars bucket.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailedUrl(imageUrl)}
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
