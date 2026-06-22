"use client";

import { useCallback, useState } from "react";

import { ProfileDetailsModal } from "@/components/dashboard/profile-details-modal";
import { ProfileVisibilityControl } from "@/components/dashboard/profile-visibility-control";
import { ProfileAvatar } from "@/components/profile/profile-avatar";

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
            className="size-14 rounded-[1.15rem]"
          />
          <div className="min-w-0">
            <button
              className="button-quiet min-h-0 max-w-full border-0 p-0 text-left text-2xl font-bold tracking-[-0.035em] text-[var(--color-text)] hover:text-[var(--color-accent-strong)]"
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
          key={bio ?? "empty-bio"}
          onClose={closeModal}
          onSaved={(savedBio) => {
            onBioSaved(savedBio);
            closeModal();
          }}
          username={username}
        />
      ) : null}
    </>
  );
}
