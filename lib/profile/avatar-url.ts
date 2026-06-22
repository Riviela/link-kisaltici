import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

const AVATAR_PATH_PATTERN = /\/avatar\.(?:jpg|jpeg|png|webp)$/;

export function getPublicAvatarUrl(
  supabase: SupabaseClient,
  profileId: string,
  avatarPath: string | null,
) {
  if (
    !avatarPath ||
    avatarPath !== `${profileId}${avatarPath.match(AVATAR_PATH_PATTERN)?.[0] ?? ""}`
  ) {
    return null;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(avatarPath);

  try {
    const publicUrl = new URL(data.publicUrl);
    const projectUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);

    return publicUrl.origin === projectUrl.origin ? publicUrl.toString() : null;
  } catch {
    return null;
  }
}
