import { redirect } from "next/navigation";

import { logoutAction } from "@/app/actions/auth";
import { copy } from "@/lib/copy";
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

        <section className="mt-24 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.06)] sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
            {copy.dashboard.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            {copy.dashboard.titlePrefix}, {current.profile.display_name}
          </h1>
          <p className="mt-3 font-medium text-slate-700">
            @{current.profile.username}
          </p>
          <p className="mt-6 text-slate-600">
            {copy.dashboard.linksComingSoon}
          </p>
        </section>
      </div>
    </main>
  );
}
