import "server-only";

import { normalizeUsernameInput } from "@/lib/auth/register-validation";
import { USERNAME_PATTERN } from "@/lib/profile/validation";
import { createClient } from "@/lib/supabase/server";

export interface PendingUsernameResult {
  userId: string;
  username: string | null;
}

export class PendingUsernameAuthenticationError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "PendingUsernameAuthenticationError";
  }
}

export class PendingUsernameLookupError extends Error {
  constructor() {
    super("Registration profile metadata could not be loaded.");
    this.name = "PendingUsernameLookupError";
  }
}

export async function getPendingUsername(): Promise<PendingUsernameResult> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || userId.length === 0) {
    throw new PendingUsernameAuthenticationError();
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new PendingUsernameLookupError();
  }

  if (userData.user.id !== userId) {
    throw new PendingUsernameAuthenticationError();
  }

  const metadataValue = userData.user.user_metadata?.pending_username;

  if (typeof metadataValue !== "string") {
    return { userId, username: null };
  }

  const username = normalizeUsernameInput(metadataValue);

  return {
    userId,
    username: USERNAME_PATTERN.test(username) ? username : null,
  };
}
