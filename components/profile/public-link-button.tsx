import type { PublicProfileLink } from "@/lib/profile/get-public-profile";

interface PublicLinkButtonProps {
  link: PublicProfileLink;
}

export function PublicLinkButton({ link }: PublicLinkButtonProps) {
  return (
    <a
      className="group flex min-h-16 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 font-semibold text-slate-950 shadow-[0_12px_32px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 motion-reduce:transform-none motion-reduce:transition-none"
      href={link.url}
    >
      <span className="min-w-0 break-words">{link.title}</span>
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-orange-500 text-white transition group-hover:bg-orange-600 motion-reduce:transition-none"
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
