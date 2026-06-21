import { redirect } from "next/navigation";

import { AuthVisual } from "@/components/auth/auth-visual";
import { ProfileForm } from "@/components/onboarding/profile-form";
import { copy } from "@/lib/copy";
import {
  getCurrentProfile,
  ProfileAuthenticationError,
  ProfileLookupError,
  type CurrentProfileResult,
} from "@/lib/profile/get-current-profile";
import {
  getPendingUsername,
  PendingUsernameAuthenticationError,
  PendingUsernameLookupError,
  type PendingUsernameResult,
} from "@/lib/profile/get-pending-username";

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

  let pending: PendingUsernameResult;

  try {
    pending = await getPendingUsername();
  } catch (error) {
    if (error instanceof PendingUsernameAuthenticationError) {
      redirect("/login");
    }

    if (error instanceof PendingUsernameLookupError) {
      throw new Error(copy.onboarding.failure.load);
    }

    throw error;
  }

  if (pending.userId !== current.userId) {
    redirect("/login");
  }

  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-[minmax(31rem,0.9fr)_minmax(34rem,1.1fr)]">
      <section className="flex min-h-dvh px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
        <div className="mx-auto flex w-full max-w-lg flex-col">
          <p className="text-sm font-extrabold tracking-[-0.02em] text-[var(--color-text)]">
            {copy.metadata.title}
          </p>

          <div className="my-auto py-12">
            <p className="text-sm font-bold text-[var(--color-accent-strong)]">
              {copy.onboarding.eyebrow}
            </p>
            <h1 className="mt-4 text-balance text-4xl font-bold tracking-[-0.045em] text-[var(--color-text)] sm:text-5xl">
              {copy.onboarding.title}
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-[var(--color-muted)]">
              {copy.onboarding.description}
            </p>
            <div className="mt-10">
              <ProfileForm pendingUsername={pending.username} />
            </div>
          </div>

          <p className="text-xs text-[var(--color-muted)]">
            {copy.metadata.description}
          </p>
        </div>
      </section>

      <AuthVisual />
    </main>
  );
}
