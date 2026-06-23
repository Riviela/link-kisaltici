import Link from "next/link";

import { ProfileHeader } from "@/components/profile/profile-header";
import { PublicLinkButton } from "@/components/profile/public-link-button";
import { PublicShareButton } from "@/components/profile/public-share-button";
import { APP_NAME } from "@/lib/config/site";
import { copy } from "@/lib/copy";
import type { SocialHandles } from "@/lib/profile/social";

import styles from "./public-profile.module.css";

export interface PublicProfileSurfaceLink {
  id: number;
  title: string;
  url: string;
}

interface PublicProfileSurfaceProps {
  avatarUrl: string | null;
  bio: string | null;
  links: PublicProfileSurfaceLink[];
  mode?: "public" | "preview";
  profileUrl: string;
  socialHandles: SocialHandles;
  username: string;
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
  avatarUrl,
  bio,
  links,
  mode = "public",
  profileUrl,
  socialHandles,
  username,
}: PublicProfileSurfaceProps) {
  const isPreview = mode === "preview";

  return (
    <article
      className={`${styles.profileSurface} ${
        isPreview ? styles.profileSurfacePreview : ""
      }`}
    >
      <div className={styles.profileChrome}>
        <div aria-label={APP_NAME} className={styles.brandMark}>
          <CanvasMark />
        </div>

        <PublicShareButton profileUrl={profileUrl} username={username} />
      </div>

      <div className={styles.profileContent}>
        <ProfileHeader
          avatarUrl={avatarUrl}
          bio={bio}
          socialHandles={socialHandles}
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
