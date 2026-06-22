export const SOCIAL_PLATFORMS = ["instagram", "tiktok", "youtube"] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export interface SocialHandles {
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
}

export interface SocialHandleActionState {
  status: "idle" | "success" | "error";
  message: string;
  socialHandles: SocialHandles;
}

export const EMPTY_SOCIAL_HANDLES: SocialHandles = {
  instagram: null,
  tiktok: null,
  youtube: null,
};

export const SOCIAL_PLATFORM_CONFIG = {
  instagram: {
    column: "instagram_handle",
    inputPattern: "@?[A-Za-z0-9._]{1,30}",
    label: "Instagram",
    maxLength: 31,
    pattern: /^[A-Za-z0-9._]{1,30}$/,
    profileUrl: (handle: string) => `https://instagram.com/${handle}`,
  },
  tiktok: {
    column: "tiktok_handle",
    inputPattern: "@?[A-Za-z0-9._]{2,24}",
    label: "TikTok",
    maxLength: 25,
    pattern: /^[A-Za-z0-9._]{2,24}$/,
    profileUrl: (handle: string) => `https://tiktok.com/@${handle}`,
  },
  youtube: {
    column: "youtube_handle",
    inputPattern: "@?[A-Za-z0-9._-]{3,30}",
    label: "YouTube",
    maxLength: 31,
    pattern: /^[A-Za-z0-9._-]{3,30}$/,
    profileUrl: (handle: string) => `https://youtube.com/@${handle}`,
  },
} as const;

export function isSocialPlatform(value: unknown): value is SocialPlatform {
  return (
    typeof value === "string" &&
    SOCIAL_PLATFORMS.includes(value as SocialPlatform)
  );
}

export function normalizeSocialHandle(value: unknown) {
  if (typeof value !== "string") return "";

  const trimmed = value.trim();
  return (trimmed.startsWith("@") ? trimmed.slice(1) : trimmed).trim();
}

export function validateSocialHandle(platform: SocialPlatform, value: unknown) {
  const handle = normalizeSocialHandle(value);

  if (handle.length === 0) {
    return { success: true as const, handle: null };
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

export function getSocialHandle(
  handles: SocialHandles,
  platform: SocialPlatform,
) {
  return handles[platform];
}
