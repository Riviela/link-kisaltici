import "server-only";

import { getPublicAvatarUrl } from "@/lib/profile/avatar-url";
import type { SocialHandles } from "@/lib/profile/social";
import { createClient } from "@/lib/supabase/server";

export interface CurrentProfile {
  id: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  socialHandles: SocialHandles;
}

export interface CurrentProfileResult {
  userId: string;
  profile: CurrentProfile | null;
}

export class ProfileAuthenticationError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "ProfileAuthenticationError";
  }
}

export class ProfileLookupError extends Error {
  constructor() {
    super("The profile could not be loaded.");
    this.name = "ProfileLookupError";
  }
}

export async function getCurrentProfile(): Promise<CurrentProfileResult> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || userId.length === 0) {
    throw new ProfileAuthenticationError();
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, username, bio, avatar_path, instagram_handle, tiktok_handle, youtube_handle",
    )
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new ProfileLookupError();
  }

  return {
    userId,
    profile: profile
      ? {
          id: profile.id,
          username: profile.username,
          bio: profile.bio,
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
        }
      : null,
  };
}
