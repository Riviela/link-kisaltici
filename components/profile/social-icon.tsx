import type { SocialPlatform } from "@/lib/profile/social";

interface SocialIconProps {
  className?: string;
  platform: SocialPlatform;
}

export function SocialIcon({ className = "size-5", platform }: SocialIconProps) {
  if (platform === "threads") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
        <path d="M17.5 11.2c-.5-4.5-3-6.7-6.6-6.7-3.7 0-6.4 2.7-6.4 7.5s2.7 7.5 6.6 7.5c3.2 0 5.3-1.6 5.3-4 0-2.2-1.8-3.5-4.8-3.5-2.1 0-3.4.9-3.4 2.2 0 1.1 1 1.8 2.4 1.8 2.7 0 4.7-2.2 4.7-4.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    );
  }

  if (platform === "instagram") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
        <rect height="17" rx="5" stroke="currentColor" strokeWidth="1.8" width="17" x="3.5" y="3.5" />
        <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.4" cy="6.7" fill="currentColor" r="1.1" />
      </svg>
    );
  }

  if (platform === "email") {
    return (
      <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
        <path d="M4 6.5h16v11H4z" fill="currentColor" />
        <path d="m5 7 7 6 7-6" stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      </svg>
    );
  }

  if (platform === "facebook") {
    return (
      <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M14.2 8.4h2.2V5h-2.8c-3.1 0-4.6 1.8-4.6 4.7v2H6.7v3.6H9V22h3.7v-6.7h3l.5-3.6h-3.5v-1.6c0-1.1.4-1.7 1.5-1.7Z" />
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

  if (platform === "x") {
    return (
      <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.2 3.8h3.1l-5 5.7 5.9 10.7h-4.6l-3.6-6.4-5.6 6.4H2.3l5.4-6.1L2 3.8h4.7l3.2 5.8 5.3-5.8Zm-1.1 14.5h1.7L5.8 5.6H4l10.1 12.7Z" />
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
