import "server-only";

import {
  isValidPublicUsername,
  normalizePublicUsername,
} from "@/lib/profile/public-username";
import { normalizeLinkLayout, type LinkLayout } from "@/lib/links/layout";
import { getPublicLinkThumbnailUrl } from "@/lib/links/thumbnail";
import {
  DEFAULT_APPEARANCE,
  normalizeAppearance,
  type ProfileAppearance,
} from "@/lib/profile/appearance";
import { getPublicAvatarUrl } from "@/lib/profile/avatar-url";
import type { SocialHandles } from "@/lib/profile/social";
import { createClient } from "@/lib/supabase/server";

export interface PublicProfileLink {
  id: number;
  title: string;
  url: string;
  position: number;
  layout: LinkLayout;
  thumbnailUrl: string | null;
}

export interface PublicProfileData {
  profile: {
    username: string;
    bio: string | null;
    avatarUrl: string | null;
    appearance: ProfileAppearance;
    socialHandles: SocialHandles;
  };
  links: PublicProfileLink[];
}

export class PublicProfileLookupError extends Error {
  constructor() {
    super("The public profile could not be loaded.");
    this.name = "PublicProfileLookupError";
  }
}

export async function getPublicProfile(
  username: string,
): Promise<PublicProfileData | null> {
  const normalizedUsername = normalizePublicUsername(username);

  if (!isValidPublicUsername(normalizedUsername)) {
    return null;
  }

  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, username, bio, avatar_path, appearance, instagram_handle, tiktok_handle, youtube_handle",
    )
    .eq("username", normalizedUsername)
    .eq("is_published", true)
    .maybeSingle();

  if (profileError) {
    throw new PublicProfileLookupError();
  }

  if (!profile) {
    return null;
  }

  const { data: links, error: linksError } = await supabase
    .from("links")
    .select(
      "id, title, url, position, layout, thumbnail_path, thumbnail_updated_at",
    )
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("id", { ascending: true });

  if (linksError) {
    throw new PublicProfileLookupError();
  }

  return {
    profile: {
      username: profile.username,
      bio: profile.bio,
      appearance: normalizeAppearance(profile.appearance ?? DEFAULT_APPEARANCE),
      avatarUrl: getPublicAvatarUrl(
        supabase,
        profile.id,
        profile.avatar_path,
      ),
      socialHandles: {
        instagram: profile.instagram_handle,
        tiktok: profile.tiktok_handle,
        youtube: profile.youtube_handle,
      },
    },
    links: (links ?? []).map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      position: link.position,
      layout: normalizeLinkLayout(link.layout),
      thumbnailUrl: getPublicLinkThumbnailUrl(
        supabase,
        link.thumbnail_path,
        link.thumbnail_updated_at,
      ),
    })),
  };
}
