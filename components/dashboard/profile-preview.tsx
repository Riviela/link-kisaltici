import { copy } from "@/lib/copy";
import type { LinkItem } from "@/lib/links/types";

interface ProfilePreviewProps {
  displayName: string;
  username: string;
  bio: string | null;
  links: LinkItem[];
}

export function ProfilePreview({
  displayName,
  username,
  bio,
  links,
}: ProfilePreviewProps) {
  const activeLinks = links.filter((link) => link.is_active);
  const monogram = displayName.trim().charAt(0).toUpperCase();

  return (
    <aside className="hidden xl:block" aria-label={copy.dashboard.preview}>
      <div className="sticky top-8">
        <div className="mb-4 flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-[var(--color-text)]">
            {copy.dashboard.preview}
          </h2>
          <span className="status-badge rounded-full bg-[var(--color-accent-soft)] px-3 py-1 text-xs font-bold text-[var(--color-accent-strong)]">
            @{username}
          </span>
        </div>

        <div className="rounded-[2.5rem] border border-white bg-[#e8e9ef] p-3 shadow-[0_28px_70px_rgba(62,54,120,0.16)] ring-1 ring-[var(--color-border)]">
          <div className="min-h-[38rem] rounded-[2rem] bg-[var(--color-surface)] px-5 pb-8 pt-10">
            <div className="text-center">
              <div className="mx-auto grid size-20 place-items-center rounded-[1.75rem] bg-[var(--color-accent-soft)] text-2xl font-bold text-[var(--color-accent-strong)]">
                {monogram}
              </div>
              <h3 className="mt-5 text-xl font-bold tracking-[-0.03em] text-[var(--color-text)]">
                {displayName}
              </h3>
              <p className="mt-1 text-sm font-semibold text-[var(--color-muted)]">
                @{username}
              </p>
              {bio ? (
                <p className="mx-auto mt-3 line-clamp-3 max-w-60 text-sm leading-5 text-[var(--color-muted)]">
                  {bio}
                </p>
              ) : null}
            </div>

            <div className="mt-7 space-y-2.5">
              {activeLinks.length > 0 ? (
                activeLinks.map((link) => (
                  <div
                    className="preview-item flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-4 py-3 text-sm font-bold text-[var(--color-text)]"
                    key={link.id}
                  >
                    <span className="truncate">{link.title}</span>
                    <svg
                      aria-hidden="true"
                      className="shrink-0 text-[var(--color-accent)]"
                      fill="none"
                      height="14"
                      viewBox="0 0 14 14"
                      width="14"
                    >
                      <path
                        d="M3 11 11 3M5 3h6v6"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.6"
                      />
                    </svg>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] px-4 py-8 text-center text-xs leading-5 text-[var(--color-muted)]">
                  {copy.publicProfile.empty}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
