import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { SocialLinks } from "@/components/profile/social-links";
import type { SocialHandles } from "@/lib/profile/social";

interface ProfileHeaderProps {
  avatarUrl: string | null;
  username: string;
  bio: string | null;
  variant?: "default" | "preview";
  socialHandles: SocialHandles;
}

export function ProfileHeader({
  avatarUrl,
  username,
  bio,
  variant = "default",
  socialHandles,
}: ProfileHeaderProps) {
  const isPreview = variant === "preview";

  return (
    <header className="text-center">
      <ProfileAvatar
        avatarUrl={avatarUrl}
        className={isPreview ? "mx-auto size-[4.6rem]" : "mx-auto size-24"}
      />

      <h1
        className={
          isPreview
            ? "mt-4 text-[1.32rem] font-extrabold leading-tight tracking-[-0.045em] text-[var(--color-text)]"
            : "mt-4 text-[1.65rem] font-extrabold leading-tight tracking-[-0.045em] text-[var(--color-text)] sm:text-[1.8rem]"
        }
      >
        @{username}
      </h1>

      {bio ? (
        <p
          className={
            isPreview
              ? "mx-auto mt-1 max-w-[15rem] whitespace-pre-wrap text-pretty text-xs font-semibold leading-4 text-[var(--color-text)]"
              : "mx-auto mt-1.5 max-w-md whitespace-pre-wrap text-pretty text-sm font-semibold leading-5 text-[var(--color-text)]"
          }
        >
          {bio}
        </p>
      ) : null}
      <SocialLinks
        className={isPreview ? "mt-3" : "mt-4"}
        handles={socialHandles}
        size={isPreview ? "preview" : "default"}
      />
    </header>
  );
}
