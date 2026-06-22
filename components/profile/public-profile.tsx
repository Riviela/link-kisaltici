import { ProfileHeader } from "@/components/profile/profile-header";
import { PublicLinkButton } from "@/components/profile/public-link-button";
import { copy } from "@/lib/copy";
import type { PublicProfileData } from "@/lib/profile/get-public-profile";

interface PublicProfileProps {
  data: PublicProfileData;
}

export function PublicProfile({ data }: PublicProfileProps) {
  return (
    <main className="min-h-dvh bg-[var(--color-page)] sm:px-6 sm:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,var(--color-accent-soft)_0,transparent_68%)] opacity-75"
      />

      <article className="relative mx-auto min-h-dvh w-full bg-[var(--color-surface)] px-5 pb-14 pt-12 sm:min-h-[calc(100dvh-5rem)] sm:max-w-[32rem] sm:rounded-[2.75rem] sm:border sm:border-[var(--color-surface)] sm:px-8 sm:pt-14 sm:shadow-[0_30px_90px_rgba(40,38,66,0.18)] sm:ring-1 sm:ring-[var(--color-border)]">
        <div className="mx-auto max-w-md">
          <ProfileHeader
            avatarUrl={data.profile.avatarUrl}
            bio={data.profile.bio}
            username={data.profile.username}
          />

          <section aria-label="Links" className="mt-10 space-y-3">
            {data.links.length > 0 ? (
              data.links.map((link) => (
                <PublicLinkButton key={link.id} link={link} />
              ))
            ) : (
              <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] px-6 py-12 text-center">
                <div className="mx-auto grid size-11 place-items-center rounded-2xl bg-[var(--color-accent-soft)] text-xl text-[var(--color-accent-strong)]">
                  +
                </div>
                <p className="mx-auto mt-4 max-w-60 text-sm leading-6 text-[var(--color-muted)]">
                  {copy.publicProfile.empty}
                </p>
              </div>
            )}
          </section>
        </div>
      </article>
    </main>
  );
}
