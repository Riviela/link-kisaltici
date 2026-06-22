import { ProfileAvatar } from "@/components/profile/profile-avatar";

interface ProfileHeaderProps {
  avatarUrl: string | null;
  username: string;
  bio: string | null;
}

export function ProfileHeader({
  avatarUrl,
  username,
  bio,
}: ProfileHeaderProps) {
  return (
    <header className="text-center">
      <ProfileAvatar
        avatarUrl={avatarUrl}
        className="mx-auto size-24 rounded-[2rem]"
      />

      <h1 className="mt-7 text-3xl font-bold tracking-[-0.045em] text-[var(--color-text)] sm:text-4xl">
        @{username}
      </h1>

      {bio ? (
        <p className="mx-auto mt-4 max-w-md whitespace-pre-wrap text-pretty text-sm leading-6 text-[var(--color-muted)]">
          {bio}
        </p>
      ) : null}
    </header>
  );
}
