import Link from "next/link";

import { ProfileHeader } from "@/components/profile/profile-header";
import { PublicLinkButton } from "@/components/profile/public-link-button";
import { PublicShareButton } from "@/components/profile/public-share-button";
import { APP_NAME, PUBLIC_PROFILE_HOST } from "@/lib/config/site";
import { copy } from "@/lib/copy";
import type { PublicProfileData } from "@/lib/profile/get-public-profile";

import styles from "./public-profile.module.css";

interface PublicProfileProps {
  data: PublicProfileData;
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

function DecorativeQr() {
  return (
    <aside aria-label="View on mobile" className={styles.qrDock}>
      <p>View on mobile</p>
      <div aria-hidden="true" className={styles.qrCode}>
        <span className={styles.qrCorner} />
        <span className={styles.qrCorner} />
        <span className={styles.qrCorner} />
      </div>
    </aside>
  );
}

export function PublicProfile({ data }: PublicProfileProps) {
  const publicUrl = `https://${PUBLIC_PROFILE_HOST}/${data.profile.username}`;

  return (
    <main className={styles.publicCanvas}>
      <article className={styles.profileSurface}>
        <div className={styles.profileChrome}>
          <div aria-label={APP_NAME} className={styles.brandMark}>
            <CanvasMark />
          </div>

          <PublicShareButton
            profileUrl={publicUrl}
            username={data.profile.username}
          />
        </div>

        <div className={styles.profileContent}>
          <ProfileHeader
            avatarUrl={data.profile.avatarUrl}
            bio={data.profile.bio}
            socialHandles={data.profile.socialHandles}
            username={data.profile.username}
          />

          <section aria-label="Links" className={styles.linkStack}>
            {data.links.length > 0 ? (
              data.links.map((link) => (
                <PublicLinkButton key={link.id} link={link} />
              ))
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  +
                </div>
                <p>
                  {copy.publicProfile.empty}
                </p>
              </div>
            )}
          </section>
        </div>

        <div className={styles.profileFooter}>
          <Link className={styles.joinCta} href="/register">
            Join {APP_NAME}
          </Link>

          <nav aria-label="Public profile footer" className={styles.footerLinks}>
            <span>Privacy</span>
            <span>Report</span>
            <span>About {APP_NAME}</span>
          </nav>
        </div>
      </article>

      <DecorativeQr />
    </main>
  );
}
