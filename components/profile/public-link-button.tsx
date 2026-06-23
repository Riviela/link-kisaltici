import type { PublicProfileLink } from "@/lib/profile/get-public-profile";

import styles from "./public-profile.module.css";

interface PublicLinkButtonProps {
  link: PublicProfileLink;
}

export function PublicLinkButton({ link }: PublicLinkButtonProps) {
  const thumbnailUrl =
    "thumbnailUrl" in link && typeof link.thumbnailUrl === "string"
      ? link.thumbnailUrl
      : null;

  return (
    <a
      className={styles.publicLinkButton}
      href={link.url}
    >
      {thumbnailUrl ? (
        <span className={styles.publicLinkThumb}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={thumbnailUrl} />
        </span>
      ) : (
        <span aria-hidden="true" className={styles.publicLinkBalance} />
      )}

      <span className={styles.publicLinkTitle}>{link.title}</span>
      <span
        aria-hidden="true"
        className={styles.publicLinkMenu}
      >
        <span />
        <span />
        <span />
      </span>
    </a>
  );
}
