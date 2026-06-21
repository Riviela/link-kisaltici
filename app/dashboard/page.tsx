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
    <main className="min-h-screen px-6 py-8 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <p className="font-bold tracking-tight">{copy.metadata.title}</p>
          <form action={logoutAction}>
            <button
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
              type="submit"
            >
              {copy.dashboard.logout}
            </button>
          </form>
        </header>

        <section className="mt-20 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-12">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
                {copy.dashboard.eyebrow}
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
                {copy.dashboard.titlePrefix}, {current.profile.display_name}
              </h1>
              <p className="mt-3 font-medium text-slate-700">
                @{current.profile.username}
              </p>
            </div>

            <ProfileVisibilityControl
              initialIsPublished={current.profile.is_published}
            />
          </div>
        </section>

        <div className="mt-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
            {copy.links.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {copy.links.title}
          </h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            {copy.links.description}
          </p>
        </div>

        <LinkManager initialLinks={initialLinks} />
      </div>
    </main>
  );
}
