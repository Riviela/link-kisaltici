import { redirect } from "next/navigation";

import { logoutAction } from "@/app/actions/auth";
import { LinkManager } from "@/components/dashboard/link-manager";
import { ProfileVisibilityControl } from "@/components/dashboard/profile-visibility-control";
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

          <div className="mx-auto max-w-[91rem] px-4 py-5 sm:px-7 sm:py-8 lg:px-9">
            <section className="surface-panel mb-7 p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="grid size-14 shrink-0 place-items-center rounded-[1.15rem] bg-[var(--color-accent-soft)] text-lg font-bold text-[var(--color-accent-strong)]">
                    {current.profile.display_name.trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--color-accent-strong)]">
                      {copy.dashboard.eyebrow}
                    </p>
                    <h1 className="mt-1 truncate text-2xl font-bold tracking-[-0.035em] text-[var(--color-text)] sm:text-3xl">
                      {copy.dashboard.titlePrefix}, {current.profile.display_name}
                    </h1>
                    <p className="mt-1 text-sm font-semibold text-[var(--color-muted)]">
                      @{current.profile.username}
                    </p>
                  </div>
                </div>

                <ProfileVisibilityControl
                  initialIsPublished={current.profile.is_published}
                />
              </div>
            </section>

            <div id="content">
              <LinkManager
                initialLinks={initialLinks}
                profile={{
                  bio: current.profile.bio,
                  displayName: current.profile.display_name,
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
