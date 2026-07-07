import Link from "next/link";
import { redirect } from "next/navigation";

import { LinkManager } from "@/components/dashboard/link-manager";
import { APP_NAME } from "@/lib/config/site";
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
import { getCurrentPlan } from "@/lib/subscriptions/get-current-plan";
import { getPlanLabel } from "@/lib/subscriptions/plans";

import dashboardStyles from "@/components/dashboard/dashboard-interactions.module.css";

function CanvasMark() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 4v16M4 12h16M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}

function UpgradeIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="m13 2-9 12h8l-1 8 9-12h-8l1-8Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

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
  const planLabel = getPlanLabel(await getCurrentPlan());

  return (
    <main className={dashboardStyles.dashboardPage}>
      <header className={dashboardStyles.dashboardTopBar}>
        <div
          aria-label={APP_NAME}
          className={dashboardStyles.dashboardAnnouncementMark}
          role="img"
        >
          <CanvasMark />
        </div>
        <div className={dashboardStyles.dashboardAnnouncementContent}>
          <span>{copy.dashboard.announcement}</span>
          <Link
            className={dashboardStyles.dashboardAnnouncementUpgrade}
            href="/pricing"
          >
            <UpgradeIcon />
            {copy.dashboard.upgrade}
          </Link>
        </div>
      </header>

      <div className={dashboardStyles.dashboardShell}>
        <LinkManager
          initialLinks={initialLinks}
          profile={{
            appearance: current.profile.appearance,
            avatarUrl: current.profile.avatarUrl,
            bio: current.profile.bio,
            planLabel,
            profileUrl,
            socialLinks: current.profile.socialLinks,
            socialLinksPosition: current.profile.socialLinksPosition,
            username: current.profile.username,
          }}
        />
      </div>
    </main>
  );
}
