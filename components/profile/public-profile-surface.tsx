import Link from "next/link";
import type { CSSProperties } from "react";

import { ProfileHeader } from "@/components/profile/profile-header";
import { SocialLinks } from "@/components/profile/social-links";
import { PublicLinkButton } from "@/components/profile/public-link-button";
import { PublicShareButton } from "@/components/profile/public-share-button";
import { APP_NAME } from "@/lib/config/site";
import { copy } from "@/lib/copy";
import type { LinkLayout } from "@/lib/links/layout";
import {
  DEFAULT_APPEARANCE,
  normalizeAppearance,
  type ProfileAppearance,
} from "@/lib/profile/appearance";
import type { SocialLink, SocialLinksPosition } from "@/lib/profile/social";

import styles from "./public-profile.module.css";

export interface PublicProfileSurfaceLink {
  id: number;
  title: string;
  url: string;
  layout?: LinkLayout;
  thumbnailUrl?: string | null;
}

interface PublicProfileSurfaceProps {
  appearance?: ProfileAppearance;
  avatarUrl: string | null;
  bio: string | null;
  links: PublicProfileSurfaceLink[];
  mode?: "public" | "preview";
  profileUrl: string;
  socialLinks: SocialLink[];
  socialLinksPosition: SocialLinksPosition;
  username: string;
}

type ProfileSurfaceStyle = CSSProperties & {
  "--profile-background": string;
  "--profile-surface": string;
  "--profile-page-text": string;
  "--profile-title": string;
  "--profile-button-background": string;
  "--profile-button-text": string;
};

function getWallpaperClass(appearance: ProfileAppearance) {
  switch (appearance.wallpaper.style) {
    case "gradient":
      return styles.profileWallpaperGradient;
    case "soft-blur":
      return styles.profileWallpaperSoftBlur;
    case "pattern-grid":
      return styles.profileWallpaperPatternGrid;
    case "fill":
    default:
      return styles.profileWallpaperFill;
  }
}

function getFontClass(appearance: ProfileAppearance) {
  switch (appearance.text.font) {
    case "system-sans":
      return styles.profileFontSystemSans;
    case "serif-soft":
      return styles.profileFontSerifSoft;
    case "mono-quiet":
      return styles.profileFontMonoQuiet;
    case "schibsted-grotesk":
    default:
      return styles.profileFontSchibstedGrotesk;
  }
}

function CanvasMark() {
  return (
    <svg
      aria-hidden="true"
      className={styles.brandMarkIcon}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 4v16M4 12h16M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

export function PublicProfileSurface({
  appearance: appearanceInput = DEFAULT_APPEARANCE,
  avatarUrl,
  bio,
  links,
  mode = "public",
  profileUrl,
  socialLinks,
  socialLinksPosition,
  username,
}: PublicProfileSurfaceProps) {
  const isPreview = mode === "preview";
  const appearance = normalizeAppearance(appearanceInput);
  const profileStyle: ProfileSurfaceStyle = {
    "--profile-background": appearance.tokens.background,
    "--profile-surface": appearance.tokens.surface,
    "--profile-page-text": appearance.tokens.pageText,
    "--profile-title": appearance.tokens.title,
    "--profile-button-background": appearance.tokens.buttonBackground,
    "--profile-button-text": appearance.tokens.buttonText,
  };

  const bottomSocialLinks = socialLinksPosition === "bottom" ? (
    <div className={styles.profileBottomSocial}>
      <SocialLinks
        className={isPreview ? styles.profileSocialPreview : styles.profileSocial}
        links={socialLinks}
        size={isPreview ? "preview" : "default"}
      />
    </div>
  ) : null;

  return (
    <article
      className={[
        styles.profileSurface,
        getWallpaperClass(appearance),
        getFontClass(appearance),
        styles[`profileSurfaceHeader${appearance.header.layout}`],
        styles[`profileButtons${appearance.buttons.style}`],
        styles[`profileButtonRadius${appearance.buttons.radius}`],
        styles[`profileButtonShadow${appearance.buttons.shadow}`],
        styles[`profileButtonAlign${appearance.buttons.alignment}`],
        isPreview ? styles.profileSurfacePreview : "",
      ].join(" ")}
      style={profileStyle}
    >
      <div className={styles.profileChrome}>
        <div aria-label={APP_NAME} className={styles.brandMark}>
          <CanvasMark />
        </div>

        <PublicShareButton profileUrl={profileUrl} username={username} />
      </div>

      <div className={styles.profileContent}>
        <ProfileHeader
          appearance={appearance}
          avatarUrl={avatarUrl}
          bio={bio}
          variant={isPreview ? "preview" : "default"}
          socialLinks={socialLinksPosition === "top" ? socialLinks : []}
          username={username}
        />

        <section aria-label="Links" className={styles.linkStack}>
          {links.length > 0 ? (
            links.map((link) => (
              <PublicLinkButton
                inert={isPreview}
                key={link.id}
                link={link}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>+</div>
              <p>{copy.publicProfile.empty}</p>
            </div>
          )}
        </section>
        {bottomSocialLinks}
      </div>

      <div className={styles.profileFooter}>
        {isPreview ? (
          <span className={styles.joinCta}>Join {APP_NAME}</span>
        ) : (
          <Link className={styles.joinCta} href="/register">
            Join {APP_NAME}
          </Link>
        )}

        <nav aria-label="Public profile footer" className={styles.footerLinks}>
          <span>Privacy</span>
          <span>Report</span>
          <span>About {APP_NAME}</span>
        </nav>
      </div>
    </article>
  );
}
