import { redirect } from "next/navigation";

import { logoutAction } from "@/app/actions/auth";
import { LinkManager } from "@/components/dashboard/link-manager";
import { copy } from "@/lib/copy";
import {
  getCurrentLinks,
  LinksAuthenticationError,
  LinksLookupError,
} from "@/lib/links/get-current-links";
import {
  getCurrentProfile,
  ProfileAuthenticationError,
  ProfileLookupError,
  type CurrentProfileResult,
} from "@/lib/profile/get-current-profile";

import styles from "@/components/dashboard/dashboard-interactions.module.css";

export default async function DashboardPage() {
  let current: CurrentProfileResult;

  try {
    current = await getCurrentProfile();
  } catch (error) {
    if (error instanceof ProfileAuthenticationError) {
      redirect("/login");
    }

    if (error instanceof ProfileLookupError) {
      throw new Error(copy.onboarding.failure.load);
    }

    throw error;
  }

  if (!current.profile) {
    redirect("/onboarding");
  }

  let initialLinks;

  try {
    initialLinks = await getCurrentLinks();
  } catch (error) {
    if (error instanceof LinksAuthenticationError) {
      redirect("/login");
    }

    if (error instanceof LinksLookupError) {
      throw new Error(copy.links.failure.load);
    }

    throw error;
  }

  return (
    <main className={styles.dashboardPage}>
      <header className={styles.dashboardTopBar}>
        <form action={logoutAction}>
          <button
            className={styles.dashboardLogout}
            type="submit"
          >
            {copy.dashboard.logout}
          </button>
        </form>
      </header>

      <div className={styles.dashboardShell}>
        <LinkManager
          initialLinks={initialLinks}
          profile={{
            appearance: current.profile.appearance,
            avatarUrl: current.profile.avatarUrl,
            bio: current.profile.bio,
            socialHandles: current.profile.socialHandles,
            username: current.profile.username,
          }}
        />
      </div>
    </main>
  );
}
