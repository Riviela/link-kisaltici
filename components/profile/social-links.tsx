import { SocialIcon } from "@/components/profile/social-icon";
import {
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
  if (links.length === 0) return null;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {links.map((link) => {
        const label = SOCIAL_PLATFORM_CONFIG[link.platform].label;

        return (
          <a
            aria-label={`${label}: ${link.value}`}
            className={`${size === "preview" ? "size-7" : "size-9"} grid place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text)] transition-colors duration-200 hover:bg-[var(--color-surface-hover)]`}
            href={link.url}
            key={link.platform}
            rel="noopener noreferrer"
            target="_blank"
          >
            <SocialIcon platform={link.platform} />
          </a>
        );
      })}
    </div>
  );
}
