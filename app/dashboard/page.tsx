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
    <main className="min-h-dvh bg-[var(--color-page)]">
      <div className="xl:grid xl:grid-cols-[5.25rem_minmax(0,1fr)]">
        <nav className="hidden min-h-dvh border-r border-[var(--color-border)] bg-[var(--color-surface)] xl:sticky xl:top-0 xl:flex xl:h-dvh xl:flex-col xl:items-center xl:py-7">
          <a
            aria-current="page"
            className="mt-24 flex w-full flex-col items-center gap-2 border-r-2 border-[var(--color-accent)] py-3 text-[var(--color-accent-strong)]"
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

        <div className="min-w-0">
          <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 sm:px-8 lg:px-10">
            <p className="font-extrabold tracking-[-0.025em] text-[var(--color-text)]">
              {copy.metadata.title}
            </p>
            <form action={logoutAction}>
              <button
                className="button-secondary px-4 text-sm"
                type="submit"
              >
                {copy.dashboard.logout}
              </button>
            </form>
          </header>

          <div className="mx-auto max-w-[100rem] px-4 py-5 sm:px-7 sm:py-8 lg:px-9">
            <div id="content">
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
      </div>
    </main>
  );
}
