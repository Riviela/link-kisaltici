import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { SocialLinks } from "@/components/profile/social-links";
import type { SocialHandles } from "@/lib/profile/social";

interface ProfileHeaderProps {
  avatarUrl: string | null;
  username: string;
  bio: string | null;
  socialHandles: SocialHandles;
}

export function ProfileHeader({
  avatarUrl,
  username,
  bio,
  socialHandles,
}: ProfileHeaderProps) {
  return (
    <header className="text-center">
      <ProfileAvatar
        avatarUrl={avatarUrl}
        className="mx-auto size-24"
      />

      <h1 className="mt-4 text-[1.65rem] font-extrabold leading-tight tracking-[-0.045em] text-[var(--color-text)] sm:text-[1.8rem]">
        @{username}
      </h1>

      {bio ? (
        <p className="mx-auto mt-1.5 max-w-md whitespace-pre-wrap text-pretty text-sm font-semibold leading-5 text-[var(--color-text)]">
          {bio}
        </p>
      ) : null}
      <SocialLinks className="mt-4" handles={socialHandles} />
    </header>
  );
}
