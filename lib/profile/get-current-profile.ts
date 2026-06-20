import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface CurrentProfile {
  id: string;
  username: string;
  display_name: string;
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
    .select("id, username, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new ProfileLookupError();
  }

  return {
    userId,
    profile,
  };
}
