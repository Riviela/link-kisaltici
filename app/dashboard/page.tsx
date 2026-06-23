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
    <main className="min-h-dvh overflow-x-hidden bg-[var(--color-surface)]">
      <header className="flex h-14 items-center justify-end bg-[var(--color-text)] px-5 text-white sm:px-8">
        <form action={logoutAction}>
          <button
            className={styles.dashboardLogout}
            type="submit"
          >
            {copy.dashboard.logout}
          </button>
        </form>
      </header>

      <div className="xl:grid xl:grid-cols-[84px_minmax(0,1fr)]">
        <nav className="hidden min-h-[calc(100dvh-3.5rem)] border-r border-[var(--color-border)] bg-[var(--color-surface)] xl:sticky xl:top-0 xl:flex xl:h-[calc(100dvh-3.5rem)] xl:flex-col xl:items-center">
          <div
            aria-hidden="true"
            className="mt-5 grid size-10 place-items-center rounded-full border border-[var(--color-border)] text-[var(--color-text)]"
          >
            <svg fill="none" height="18" viewBox="0 0 18 18" width="18">
              <path d="M4 5h10M4 9h10M4 13h10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
            </svg>
          </div>
          <a
            aria-current="page"
            className="mt-auto mb-[42vh] flex w-full flex-col items-center gap-2 border-r-2 border-[var(--color-text)] py-3 text-[var(--color-text)]"
            href="#content"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="20"
              viewBox="0 0 20 20"
              width="20"
            >
              <path
                d="M4 5.5h12M4 10h12M4 14.5h8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.7"
              />
            </svg>
            <span className="text-[0.68rem] font-bold">
              {copy.dashboard.content}
            </span>
          </a>
        </nav>

        <div className="min-w-0" id="content">
          <div className="mx-auto max-w-[118rem]">
            <LinkManager
              initialLinks={initialLinks}
              profile={{
                avatarUrl: current.profile.avatarUrl,
                bio: current.profile.bio,
                socialHandles: current.profile.socialHandles,
                username: current.profile.username,
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
