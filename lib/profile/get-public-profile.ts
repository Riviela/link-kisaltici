import "server-only";

import {
  isValidPublicUsername,
  normalizePublicUsername,
} from "@/lib/profile/public-username";
import { getPublicAvatarUrl } from "@/lib/profile/avatar-url";
import { createClient } from "@/lib/supabase/server";

export interface PublicProfileLink {
  id: number;
  title: string;
  url: string;
  position: number;
}

export interface PublicProfileData {
  profile: {
    username: string;
    bio: string | null;
    avatarUrl: string | null;
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
    .select("id, username, bio, avatar_path")
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
    .select("id, title, url, position")
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
      avatarUrl: getPublicAvatarUrl(
        supabase,
        profile.id,
        profile.avatar_path,
      ),
    },
    links,
  };
}
