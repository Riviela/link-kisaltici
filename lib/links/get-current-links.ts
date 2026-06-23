import "server-only";

import { createClient } from "@/lib/supabase/server";
import { normalizeLinkLayout } from "@/lib/links/layout";
import { getPublicLinkThumbnailUrl } from "@/lib/links/thumbnail";
import type { LinkItem } from "@/lib/links/types";

const LINK_SELECT =
  "id, title, url, is_active, position, layout, thumbnail_path, thumbnail_updated_at";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

export interface LinkRow {
  id: number;
  title: string;
  url: string;
  is_active: boolean;
  position: number;
  layout: string | null;
  thumbnail_path: string | null;
  thumbnail_updated_at: string | null;
}

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

export function mapLinkRow(
  supabase: ServerSupabaseClient,
  link: LinkRow,
): LinkItem {
  return {
    id: link.id,
    title: link.title,
    url: link.url,
    is_active: link.is_active,
    position: link.position,
    layout: normalizeLinkLayout(link.layout),
    thumbnail_path: link.thumbnail_path,
    thumbnail_updated_at: link.thumbnail_updated_at,
    thumbnailUrl: getPublicLinkThumbnailUrl(
      supabase,
      link.thumbnail_path,
      link.thumbnail_updated_at,
    ),
  };
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

  return (data ?? []).map((link) => mapLinkRow(supabase, link));
}

export { LINK_SELECT };
