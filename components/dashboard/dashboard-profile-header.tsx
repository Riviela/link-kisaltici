"use client";

import { useCallback, useState } from "react";

import { ProfileDetailsModal } from "@/components/dashboard/profile-details-modal";
import { SocialHandleModal } from "@/components/dashboard/social-handle-modal";
import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { SocialIcon } from "@/components/profile/social-icon";
import {
  SOCIAL_PLATFORM_CONFIG,
  SOCIAL_PLATFORMS,
  type SocialHandles,
  type SocialPlatform,
} from "@/lib/profile/social";

import styles from "./dashboard-interactions.module.css";

interface DashboardProfileHeaderProps {
  avatarUrl: string | null;
  bio: string | null;
  onBioSaved: (bio: string | null) => void;
  onSocialSaved: (handles: SocialHandles) => void;
  socialHandles: SocialHandles;
  username: string;
}

export function DashboardProfileHeader({
  avatarUrl,
  bio,
  onBioSaved,
  onSocialSaved,
  socialHandles,
  username,
}: DashboardProfileHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [socialPlatform, setSocialPlatform] = useState<SocialPlatform | null>(null);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <>
      <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <ProfileAvatar
            avatarUrl={avatarUrl}
            className="size-14"
          />
          <div className="min-w-0">
            <button
              className={`${styles.usernameButton} max-w-full`}
              onClick={() => setIsModalOpen(true)}
              type="button"
            >
              <span className="block truncate">@{username}</span>
            </button>
            {bio ? (
              <p className="mt-1 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-[var(--color-muted)]">
                {bio}
              </p>
            ) : null}
            <div className="mt-3 flex items-center gap-2">
              {SOCIAL_PLATFORMS.map((platform) => {
                const label = SOCIAL_PLATFORM_CONFIG[platform].label;
                const connected = Boolean(socialHandles[platform]);
                return (
                  <button
                    aria-label={`${connected ? "Edit" : "Add"} ${label}`}
                    className={`grid size-9 place-items-center rounded-full border transition-colors duration-200 ${connected ? "border-[var(--color-success)] bg-[var(--color-success-soft)] text-[var(--color-success)]" : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:bg-[var(--color-surface-hover)]"}`}
                    key={platform}
                    onClick={() => setSocialPlatform(platform)}
                    type="button"
                  >
                    <SocialIcon platform={platform} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {isModalOpen ? (
        <ProfileDetailsModal
          bio={bio}
          onClose={closeModal}
          onSaved={onBioSaved}
          username={username}
        />
      ) : null}

      {socialPlatform ? (
        <SocialHandleModal
          handles={socialHandles}
          onClose={() => setSocialPlatform(null)}
          onSaved={onSocialSaved}
          platform={socialPlatform}
        />
      ) : null}
    </>
  );
}
