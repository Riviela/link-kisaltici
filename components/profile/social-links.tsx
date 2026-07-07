import { SocialIcon } from "@/components/profile/social-icon";
import {
  getEnabledSocialLinks,
  SOCIAL_PLATFORM_CONFIG,
  type SocialLink,
} from "@/lib/profile/social";

interface SocialLinksProps {
  className?: string;
  links: SocialLink[];
  size?: "default" | "preview";
}

export function SocialLinks({
  className = "",
  links,
  size = "default",
}: SocialLinksProps) {
  const enabledLinks = getEnabledSocialLinks(links);

  if (enabledLinks.length === 0) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {enabledLinks.map((link) => {
        const label = SOCIAL_PLATFORM_CONFIG[link.platform].label;

        return (
          <a
            aria-label={`${label}: ${link.value}`}
            className={`${size === "preview" ? "size-6" : "size-7"} grid place-items-center text-[var(--color-text)]`}
            href={link.url}
            key={link.platform}
            rel="noopener noreferrer"
            target="_blank"
          >
            <SocialIcon className={size === "preview" ? "size-5" : "size-6"} platform={link.platform} />
          </a>
        );
      })}
    </div>
  );
}
