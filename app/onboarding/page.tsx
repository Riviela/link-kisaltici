import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/onboarding/profile-form";
import { copy } from "@/lib/copy";
import {
  getCurrentProfile,
  ProfileAuthenticationError,
  ProfileLookupError,
  type CurrentProfileResult,
} from "@/lib/profile/get-current-profile";

export default async function OnboardingPage() {
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

  if (current.profile) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-9">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
          {copy.onboarding.eyebrow}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          {copy.onboarding.title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {copy.onboarding.description}
        </p>
        <div className="mt-8">
          <ProfileForm />
        </div>
      </section>
    </main>
  );
}
