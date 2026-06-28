import { redirect } from "next/navigation";

import { logoutAction } from "@/app/actions/auth";
import { AccountDropdown } from "@/components/dashboard/account-dropdown";
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

import dashboardStyles from "@/components/dashboard/dashboard-interactions.module.css";

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

  const profileUrl = `${process.env.NEXT_PUBLIC_PROFILE_HOST ?? "localhost:3000"}/${current.profile.username}`;

  return (
    <main className={dashboardStyles.dashboardPage}>
      <header className={dashboardStyles.dashboardTopBar}>
        <AccountDropdown
          avatarUrl={current.profile.avatarUrl}
          profileUrl={profileUrl}
          username={current.profile.username}
        />
        <form action={logoutAction}>
          <button
            className={dashboardStyles.dashboardLogout}
            type="submit"
          >
            {copy.dashboard.logout}
          </button>
        </form>
      </header>

      <div className={dashboardStyles.dashboardShell}>
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
