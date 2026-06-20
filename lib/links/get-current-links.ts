import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { LinkItem } from "@/lib/links/types";

const LINK_SELECT = "id, title, url, is_active, position";

export class LinksAuthenticationError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "LinksAuthenticationError";
  }
}

export class LinksLookupError extends Error {
  constructor() {
    super("Links could not be loaded.");
    this.name = "LinksLookupError";
  }
}

export async function getCurrentLinks(): Promise<LinkItem[]> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || userId.length === 0) {
    throw new LinksAuthenticationError();
  }

  const { data, error } = await supabase
    .from("links")
    .select(LINK_SELECT)
    .eq("user_id", userId)
    .order("position", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new LinksLookupError();
  }

  return data;
}

export { LINK_SELECT };
