import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { SocialLinks } from "@/components/profile/social-links";
import {
  DEFAULT_APPEARANCE,
  normalizeAppearance,
  type ProfileAppearance,
} from "@/lib/profile/appearance";
import type { SocialHandles } from "@/lib/profile/social";

import styles from "./public-profile.module.css";

interface ProfileHeaderProps {
  appearance?: ProfileAppearance;
  avatarUrl: string | null;
  username: string;
  bio: string | null;
  variant?: "default" | "preview";
  socialHandles: SocialHandles;
}

export function ProfileHeader({
  appearance: appearanceInput = DEFAULT_APPEARANCE,
  avatarUrl,
  username,
  bio,
  variant = "default",
  socialHandles,
}: ProfileHeaderProps) {
  const isPreview = variant === "preview";
  const appearance = normalizeAppearance(appearanceInput);

  return (
    <header
      className={[
        styles.profileHeader,
        styles[`profileHeader${appearance.header.layout}`],
        styles[`profileHeaderAlign${appearance.header.alignment}`],
        isPreview ? styles.profileHeaderPreview : "",
      ].join(" ")}
    >
      <div className={styles.profileHeaderAvatarSlot}>
        <ProfileAvatar
          avatarUrl={avatarUrl}
          className={isPreview ? "size-[4.6rem]" : "size-24"}
        />
      </div>

      <h1
        className={[
          styles.profileTitle,
          appearance.header.alternativeTitleFont
            ? styles.profileTitleAlt
            : "",
          isPreview ? styles.profileTitlePreview : "",
        ].join(" ")}
      >
        @{username}
      </h1>

      {bio ? (
        <p
          className={[
            styles.profileBio,
            isPreview ? styles.profileBioPreview : "",
          ].join(" ")}
        >
          {bio}
        </p>
      ) : null}
      <SocialLinks
        className={isPreview ? styles.profileSocialPreview : styles.profileSocial}
        handles={socialHandles}
        size={isPreview ? "preview" : "default"}
      />
    </header>
  );
}
