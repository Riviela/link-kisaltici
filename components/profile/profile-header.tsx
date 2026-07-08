import { ProfileAvatar } from "@/components/profile/profile-avatar";
import { SocialLinks } from "@/components/profile/social-links";
import {
  DEFAULT_APPEARANCE,
  normalizeAppearance,
  type ProfileAppearance,
} from "@/lib/profile/appearance";
import type { SocialLink } from "@/lib/profile/social";

import styles from "./public-profile.module.css";

interface ProfileHeaderProps {
  appearance?: ProfileAppearance;
  avatarUrl: string | null;
  username: string;
  bio: string | null;
  variant?: "default" | "preview";
  socialLinks: SocialLink[];
  socialLinksHoverClassName?: string;
}

export function ProfileHeader({
  appearance: appearanceInput = DEFAULT_APPEARANCE,
  avatarUrl,
  username,
  bio,
  variant = "default",
  socialLinks,
  socialLinksHoverClassName = "",
}: ProfileHeaderProps) {
  const isPreview = variant === "preview";
  const appearance = normalizeAppearance(appearanceInput);
  const layout = appearance.header.layout;
  const isHero = layout === "hero";
  const isShape = layout === "shape";
  const title = (
    <h1
      className={[
        styles.profileTitle,
        isShape ? styles.profileTitleShape : "",
        isHero ? styles.profileTitleHero : "",
        appearance.header.alternativeTitleFont
          ? styles.profileTitleAlt
          : "",
        isPreview ? styles.profileTitlePreview : "",
      ].join(" ")}
    >
      @{username}
    </h1>
  );
  const bioElement = bio ? (
    <p
      className={[
        styles.profileBio,
        isPreview ? styles.profileBioPreview : "",
      ].join(" ")}
    >
      {bio}
    </p>
  ) : null;
  const socialElement = (
    <SocialLinks
      className={isPreview ? styles.profileSocialPreview : styles.profileSocial}
      hoverClassName={socialLinksHoverClassName}
      links={socialLinks}
      size={isPreview ? "preview" : "default"}
    />
  );

  return (
    <header
      className={[
        styles.profileHeader,
        styles[`profileHeader${layout}`],
        isShape ? styles[`profileHeaderShape${appearance.header.shape}`] : "",
        styles[`profileHeaderAlign${appearance.header.alignment}`],
        isPreview ? styles.profileHeaderPreview : "",
      ].join(" ")}
    >
      {isHero ? (
        <div className={styles.profileHeroMediaSlot}>
          <ProfileAvatar
            avatarUrl={avatarUrl}
            className={styles.profileHeroMedia}
            shape="none"
          />
        </div>
      ) : null}

      {isShape ? title : null}

      {isShape ? (
        <div className={styles.profileShapeMediaSlot}>
          <ProfileAvatar
            avatarUrl={avatarUrl}
            className={styles.profileShapeMedia}
            shape="none"
          />
        </div>
      ) : null}

      {!isHero && !isShape ? (
        <div className={styles.profileHeaderAvatarSlot}>
          <ProfileAvatar
            avatarUrl={avatarUrl}
            className={isPreview ? styles.profileAvatarPreview : styles.profileAvatar}
          />
        </div>
      ) : null}

      <div className={styles.profileHeaderTextBlock}>
        {isShape ? null : title}
        {bioElement}
        {socialElement}
      </div>
    </header>
  );
}
