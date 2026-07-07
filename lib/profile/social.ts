export const SOCIAL_PLATFORMS = [
  "threads",
  "instagram",
  "email",
  "facebook",
  "youtube",
  "x",
  "tiktok",
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export type SocialLinksPosition = "top" | "bottom";

export interface SocialLink {
  enabled: boolean;
  platform: SocialPlatform;
  value: string;
  url: string;
}

export interface SocialHandleActionState {
  status: "idle" | "success" | "error";
  message: string;
  socialLinks: SocialLink[];
  socialLinksPosition: SocialLinksPosition;
}

export const EMPTY_SOCIAL_LINKS: SocialLink[] = [];
export const DEFAULT_SOCIAL_LINKS_POSITION: SocialLinksPosition = "top";

export const SOCIAL_PLATFORM_CONFIG = {
  threads: {
    example: "@threadsusername",
    inputPattern: "@?[A-Za-z0-9._]{1,30}",
    label: "Threads",
    maxLength: 31,
    pattern: /^[A-Za-z0-9._]{1,30}$/,
    placeholder: "Enter Threads Username*",
    profileUrl: (value: string) => `https://threads.net/@${value}`,
  },
  instagram: {
    example: "@instagramusername",
    inputPattern: "@?[A-Za-z0-9._]{1,30}",
    label: "Instagram",
    maxLength: 31,
    pattern: /^[A-Za-z0-9._]{1,30}$/,
    placeholder: "Enter Instagram Username*",
    profileUrl: (value: string) => `https://instagram.com/${value}`,
  },
  email: {
    example: "name@example.com",
    inputPattern: "[^\\s@]+@[^\\s@]+\\.[^\\s@]+",
    label: "Email",
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    placeholder: "Enter Email Address*",
    profileUrl: (value: string) => `mailto:${value}`,
  },
  facebook: {
    example: "facebookusername",
    inputPattern: "@?[A-Za-z0-9.]{3,50}",
    label: "Facebook",
    maxLength: 51,
    pattern: /^[A-Za-z0-9.]{3,50}$/,
    placeholder: "Enter Facebook Username*",
    profileUrl: (value: string) => `https://facebook.com/${value}`,
  },
  youtube: {
    example: "@youtubechannel",
    inputPattern: "(https?://)?(www\\.)?(youtube\\.com|youtu\\.be)/[^\\s]+|@?[A-Za-z0-9._-]{3,64}",
    label: "YouTube",
    maxLength: 120,
    pattern: /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+$|^@?[A-Za-z0-9._-]{3,64}$/,
    placeholder: "Enter YouTube Username or Channel*",
    profileUrl: (value: string) => {
      if (/^https?:\/\//i.test(value)) return value;
      if (/^(www\.)?(youtube\.com|youtu\.be)\//i.test(value)) {
        return `https://${value}`;
      }
      const handle = value.startsWith("@") ? value : `@${value}`;
      return `https://youtube.com/${handle}`;
    },
  },
  x: {
    example: "@xusername",
    inputPattern: "@?[A-Za-z0-9_]{1,15}",
    label: "X (formerly Twitter)",
    maxLength: 16,
    pattern: /^[A-Za-z0-9_]{1,15}$/,
    placeholder: "Enter X Username*",
    profileUrl: (value: string) => `https://x.com/${value}`,
  },
  tiktok: {
    example: "@tiktokusername",
    inputPattern: "@?[A-Za-z0-9._]{2,24}",
    label: "TikTok",
    maxLength: 25,
    pattern: /^[A-Za-z0-9._]{2,24}$/,
    placeholder: "Enter TikTok Username*",
    profileUrl: (value: string) => `https://tiktok.com/@${value}`,
  },
} as const;

export const LEGACY_SOCIAL_PLATFORM_CONFIG = {
  instagram: {
    column: "instagram_handle",
    pattern: /^[A-Za-z0-9._]{1,30}$/,
  },
  tiktok: {
    column: "tiktok_handle",
    pattern: /^[A-Za-z0-9._]{2,24}$/,
  },
  youtube: {
    column: "youtube_handle",
    pattern: /^[A-Za-z0-9._-]{3,30}$/,
  },
} as const;

export function isSocialPlatform(value: unknown): value is SocialPlatform {
  return (
    typeof value === "string" &&
    SOCIAL_PLATFORMS.includes(value as SocialPlatform)
  );
}

export function normalizeSocialLinksPosition(
  value: unknown,
): SocialLinksPosition {
  return value === "bottom" ? "bottom" : "top";
}

export function normalizeSocialHandle(
  value: unknown,
  platform?: SocialPlatform,
) {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  if (platform === "email") return trimmed.toLowerCase();
  if (platform === "youtube" && /^https?:\/\//i.test(trimmed)) return trimmed;
  return (trimmed.startsWith("@") ? trimmed.slice(1) : trimmed).trim();
}

export function validateSocialHandle(platform: SocialPlatform, value: unknown) {
  const handle = normalizeSocialHandle(value, platform);

  if (handle.length === 0) {
    return { success: false as const };
  }

  if (!SOCIAL_PLATFORM_CONFIG[platform].pattern.test(handle)) {
    return { success: false as const };
  }

  return { success: true as const, handle };
}

export function getSocialProfileUrl(
  platform: SocialPlatform,
  handle: string,
) {
  return SOCIAL_PLATFORM_CONFIG[platform].profileUrl(handle);
}

export function normalizeSocialLinks(
  value: unknown,
  legacyHandles?: Partial<Record<"instagram" | "tiktok" | "youtube", string | null>>,
): SocialLink[] {
  const parsedLinks = Array.isArray(value) ? value : [];
  const links: SocialLink[] = [];

  for (const item of parsedLinks) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const platform = record.platform;
    const value = record.value;

    if (!isSocialPlatform(platform) || typeof value !== "string") continue;

    const validated = validateSocialHandle(platform, value);
    if (!validated.success) continue;

    links.push({
      enabled: record.enabled !== false,
      platform,
      value: validated.handle,
      url: getSocialProfileUrl(platform, validated.handle),
    });
  }

  if (links.length > 0 || !legacyHandles) return dedupeSocialLinks(links);

  return dedupeSocialLinks(
    (["instagram", "tiktok", "youtube"] as const).flatMap((platform) => {
      const value = legacyHandles[platform];
      const validated = validateSocialHandle(platform, value);
      if (!validated.success) return [];

      return {
        enabled: true,
        platform,
        value: validated.handle,
        url: getSocialProfileUrl(platform, validated.handle),
      };
    }),
  );
}

export function upsertSocialLink(
  links: SocialLink[],
  platform: SocialPlatform,
  value: string,
) {
  const nextLink: SocialLink = {
    enabled: links.find((link) => link.platform === platform)?.enabled ?? true,
    platform,
    value,
    url: getSocialProfileUrl(platform, value),
  };
  const withoutPlatform = links.filter((link) => link.platform !== platform);
  const platformIndex = links.findIndex((link) => link.platform === platform);

  if (platformIndex === -1) return [...withoutPlatform, nextLink];

  return [
    ...links.slice(0, platformIndex),
    nextLink,
    ...links.slice(platformIndex + 1).filter((link) => link.platform !== platform),
  ];
}

export function dedupeSocialLinks(links: SocialLink[]) {
  const seen = new Set<SocialPlatform>();
  return links.filter((link) => {
    if (seen.has(link.platform)) return false;
    seen.add(link.platform);
    return true;
  });
}

export function getSocialLink(links: SocialLink[], platform: SocialPlatform) {
  return links.find((link) => link.platform === platform) ?? null;
}

export function removeSocialLink(
  links: SocialLink[],
  platform: SocialPlatform,
) {
  return links.filter((link) => link.platform !== platform);
}

export function setSocialLinkEnabled(
  links: SocialLink[],
  platform: SocialPlatform,
  enabled: boolean,
) {
  return links.map((link) =>
    link.platform === platform ? { ...link, enabled } : link,
  );
}

export function getEnabledSocialLinks(links: SocialLink[]) {
  return links.filter((link) => link.enabled);
}
