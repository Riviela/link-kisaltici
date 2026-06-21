import type { PublicProfileLink } from "@/lib/profile/get-public-profile";

interface PublicLinkButtonProps {
  link: PublicProfileLink;
}

export function PublicLinkButton({ link }: PublicLinkButtonProps) {
  return (
    <a
      className="public-link-button group flex items-center justify-between gap-4 border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-5 py-4 font-bold text-[var(--color-text)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d7d3ff]"
      href={link.url}
    >
      <span className="min-w-0 break-words">{link.title}</span>
      <span
        aria-hidden="true"
        className="status-badge grid size-9 shrink-0 place-items-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] group-hover:bg-[var(--color-accent)] group-hover:text-white"
      >
        <svg fill="none" height="16" viewBox="0 0 16 16" width="16">
          <path
            d="M3.5 8h9M8.5 4l4 4-4 4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </span>
    </a>
  );
}
