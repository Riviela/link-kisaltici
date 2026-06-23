import styles from "./public-profile.module.css";
import type { LinkLayout } from "@/lib/links/layout";

interface PublicLink {
  id: number;
  title: string;
  url: string;
  layout?: LinkLayout;
  thumbnailUrl?: string | null;
}

interface PublicLinkButtonProps {
  inert?: boolean;
  link: PublicLink;
}

export function PublicLinkButton({ inert = false, link }: PublicLinkButtonProps) {
  const thumbnailUrl = typeof link.thumbnailUrl === "string" ? link.thumbnailUrl : null;
  const isFeatured = link.layout === "featured";

  const content = (
    <>
      {isFeatured ? (
        <>
          <span
            aria-hidden={!thumbnailUrl}
            className={
              thumbnailUrl
                ? styles.publicFeaturedMedia
                : styles.publicFeaturedMediaFallback
            }
          >
            {thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" src={thumbnailUrl} />
            ) : null}
          </span>
          <span className={styles.publicFeaturedRow}>
            <span className={styles.publicLinkTitle}>{link.title}</span>
            <span aria-hidden="true" className={styles.publicLinkMenu}>
              <span />
              <span />
              <span />
            </span>
          </span>
        </>
      ) : (
        <>
          {thumbnailUrl ? (
            <span className={styles.publicLinkThumb}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src={thumbnailUrl} />
            </span>
          ) : (
            <span aria-hidden="true" className={styles.publicLinkBalance} />
          )}

          <span className={styles.publicLinkTitle}>{link.title}</span>
          <span aria-hidden="true" className={styles.publicLinkMenu}>
            <span />
            <span />
            <span />
          </span>
        </>
      )}
    </>
  );
  const className = `${styles.publicLinkButton} ${isFeatured ? styles.publicLinkFeatured : ""}`;

  if (inert) {
    return (
      <div aria-disabled="true" className={className}>
        {content}
      </div>
    );
  }

  return (
    <a className={className} href={link.url}>
      {content}
    </a>
  );
}
