"use client";

import { useCallback, useState } from "react";

import { ProfileDetailsModal } from "@/components/dashboard/profile-details-modal";
import { ProfileVisibilityControl } from "@/components/dashboard/profile-visibility-control";
import { ProfileAvatar } from "@/components/profile/profile-avatar";

import styles from "./dashboard-interactions.module.css";

interface DashboardProfileHeaderProps {
  avatarUrl: string | null;
  bio: string | null;
  isPublished: boolean;
  onBioSaved: (bio: string | null) => void;
  username: string;
}

export function DashboardProfileHeader({
  avatarUrl,
  bio,
  isPublished,
  onBioSaved,
  username,
}: DashboardProfileHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
          </div>
        </div>

        <ProfileVisibilityControl initialIsPublished={isPublished} />
      </section>

      {isModalOpen ? (
        <ProfileDetailsModal
          bio={bio}
          onClose={closeModal}
          onSaved={onBioSaved}
          username={username}
        />
      ) : null}
    </>
  );
}
