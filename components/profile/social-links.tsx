import { SocialIcon } from "@/components/profile/social-icon";
import {
  getSocialProfileUrl,
  SOCIAL_PLATFORM_CONFIG,
  SOCIAL_PLATFORMS,
  type SocialHandles,
} from "@/lib/profile/social";

interface SocialLinksProps {
  handles: SocialHandles;
  className?: string;
  size?: "default" | "preview";
}

export function SocialLinks({
  handles,
  className = "",
  size = "default",
}: SocialLinksProps) {
  const connectedPlatforms = SOCIAL_PLATFORMS.filter(
    (platform) => handles[platform],
  );

  if (connectedPlatforms.length === 0) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {connectedPlatforms.map((platform) => {
        const handle = handles[platform];
        if (!handle) return null;

        const label = SOCIAL_PLATFORM_CONFIG[platform].label;

        return (
          <a
            aria-label={`${label}: @${handle}`}
            className={`${size === "preview" ? "size-7" : "size-9"} grid place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text)] transition-colors duration-200 hover:bg-[var(--color-surface-hover)]`}
            href={getSocialProfileUrl(platform, handle)}
            key={platform}
            rel="noopener noreferrer"
            target="_blank"
          >
            <SocialIcon platform={platform} />
          </a>
        );
      })}
    </div>
  );
}
