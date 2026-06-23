import styles from "./public-profile.module.css";

interface PublicLink {
  id: number;
  title: string;
  url: string;
}

interface PublicLinkButtonProps {
  inert?: boolean;
  link: PublicLink;
}

export function PublicLinkButton({ inert = false, link }: PublicLinkButtonProps) {
  const thumbnailUrl =
    "thumbnailUrl" in link && typeof link.thumbnailUrl === "string"
      ? link.thumbnailUrl
      : null;

  const content = (
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
      <span
        aria-hidden="true"
        className={styles.publicLinkMenu}
      >
        <span />
        <span />
        <span />
      </span>
    </>
  );

  if (inert) {
    return (
      <div aria-disabled="true" className={styles.publicLinkButton}>
        {content}
      </div>
    );
  }

  return (
    <a className={styles.publicLinkButton} href={link.url}>
      {content}
    </a>
  );
}
