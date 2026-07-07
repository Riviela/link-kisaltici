import { PublicProfileSurface } from "@/components/profile/public-profile-surface";
import { PUBLIC_PROFILE_HOST } from "@/lib/config/site";
import type { PublicProfileData } from "@/lib/profile/get-public-profile";

import styles from "./public-profile.module.css";

interface PublicProfileProps {
  data: PublicProfileData;
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
      <PublicProfileSurface
        appearance={data.profile.appearance}
        avatarUrl={data.profile.avatarUrl}
        bio={data.profile.bio}
        links={data.links}
        profileUrl={publicUrl}
        socialLinks={data.profile.socialLinks}
        socialLinksPosition={data.profile.socialLinksPosition}
        username={data.profile.username}
      />

      <DecorativeQr />
    </main>
  );
}
