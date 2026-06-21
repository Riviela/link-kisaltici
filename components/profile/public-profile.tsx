import { ProfileHeader } from "@/components/profile/profile-header";
import { PublicLinkButton } from "@/components/profile/public-link-button";
import { copy } from "@/lib/copy";
import type { PublicProfileData } from "@/lib/profile/get-public-profile";

interface PublicProfileProps {
  data: PublicProfileData;
}

export function PublicProfile({ data }: PublicProfileProps) {
  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-12 sm:px-8 sm:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,#ffd7bd_0,transparent_68%)] opacity-70"
      />

      <div className="relative mx-auto max-w-xl">
        <ProfileHeader
          bio={data.profile.bio}
          displayName={data.profile.displayName}
          username={data.profile.username}
        />

        <section aria-label="Links" className="mt-10 space-y-3">
          {data.links.length > 0 ? (
            data.links.map((link) => (
              <PublicLinkButton key={link.id} link={link} />
            ))
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center text-sm text-slate-500">
              {copy.publicProfile.empty}
            </p>
          )}
        </section>

        <p className="mt-10 text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
          {copy.metadata.title}
        </p>
      </div>
    </main>
  );
}
