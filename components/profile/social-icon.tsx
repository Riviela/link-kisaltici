import type { SocialPlatform } from "@/lib/profile/social";

interface SocialIconProps {
  className?: string;
  platform: SocialPlatform;
}

export function SocialIcon({ className = "size-5", platform }: SocialIconProps) {
  if (platform === "instagram") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
        <rect height="17" rx="5" stroke="currentColor" strokeWidth="1.8" width="17" x="3.5" y="3.5" />
        <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.4" cy="6.7" fill="currentColor" r="1.1" />
      </svg>
    );
  }

  if (platform === "tiktok") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
        <path d="M14 4v10.1a4.2 4.2 0 1 1-3.2-4.08M14 6c1.2 2 2.8 3 5 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path d="M20.2 7.1c-.2-1-1-1.8-2-2C16.6 4.7 14.5 4.6 12 4.6s-4.6.1-6.2.5c-1 .2-1.8 1-2 2-.3 1.3-.4 3-.4 4.9s.1 3.6.4 4.9c.2 1 1 1.8 2 2 1.6.4 3.7.5 6.2.5s4.6-.1 6.2-.5c1-.2 1.8-1 2-2 .3-1.3.4-3 .4-4.9s-.1-3.6-.4-4.9Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="m10 9 5 3-5 3V9Z" fill="currentColor" />
    </svg>
  );
}
