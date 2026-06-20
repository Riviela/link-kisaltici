"use server";

import { revalidatePath } from "next/cache";

import { copy } from "@/lib/copy";
import { LINK_SELECT } from "@/lib/links/get-current-links";
import type {
  DeleteLinkResult,
  LinkActionFailure,
  LinkFormActionState,
  LinkItem,
  LinkMutationResult,
  ReorderLinksResult,
} from "@/lib/links/types";
import {
  isValidLinkIdList,
  parseLinkId,
  validateLinkInput,
} from "@/lib/links/validation";
import { createClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>;

interface AuthenticatedContext {
  success: true;
  userId: string;
  supabase: ServerSupabaseClient;
}

interface UnauthenticatedContext {
  success: false;
  failure: LinkActionFailure;
}

async function getAuthenticatedContext(): Promise<
  AuthenticatedContext | UnauthenticatedContext
> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string" || userId.length === 0) {
    return {
      success: false,
      failure: {
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: copy.links.failure.authentication,
      },
    };
  }

  return { success: true, userId, supabase };
}

async function readOwnedLinks(
  supabase: ServerSupabaseClient,
  userId: string,
): Promise<LinkItem[] | null> {
  const { data, error } = await supabase
    .from("links")
    .select(LINK_SELECT)
    .eq("user_id", userId)
    .order("position", { ascending: true })
    .order("id", { ascending: true });

  return error ? null : data;
}

function toFormFailure(failure: LinkActionFailure): LinkFormActionState {
  return { status: "error", message: failure.message };
}

export async function createLinkAction(
  previousState: LinkFormActionState,
  formData: FormData,
): Promise<LinkFormActionState> {
  void previousState;

  const auth = await getAuthenticatedContext();

  if (!auth.success) {
    return toFormFailure(auth.failure);
  }

  const input = validateLinkInput(formData);

  if (!input.success) {
    return { status: "error", message: input.message };
  }

  const { data, error } = await auth.supabase
    .from("links")
    .insert({
      user_id: auth.userId,
      title: input.title,
      url: input.url,
      is_active: input.isActive,
    })
    .select(LINK_SELECT)
    .single();

  if (error || !data) {
    return { status: "error", message: copy.links.failure.create };
  }

  revalidatePath("/dashboard");

  return {
    status: "success",
    message: copy.links.success.created,
    link: data,
  };
}

export async function updateLinkAction(
  previousState: LinkFormActionState,
  formData: FormData,
): Promise<LinkFormActionState> {
  void previousState;

  const auth = await getAuthenticatedContext();

  if (!auth.success) {
    return toFormFailure(auth.failure);
  }

  const linkId = parseLinkId(formData.get("linkId"));
  const input = validateLinkInput(formData);

  if (!linkId || !input.success) {
    return {
      status: "error",
      message: !input.success ? input.message : copy.links.failure.invalid,
    };
  }

  const { data, error } = await auth.supabase
    .from("links")
    .update({
      title: input.title,
      url: input.url,
      is_active: input.isActive,
    })
    .eq("id", linkId)
    .eq("user_id", auth.userId)
    .select(LINK_SELECT)
    .maybeSingle();

  if (error || !data) {
    return { status: "error", message: copy.links.failure.update };
  }

  revalidatePath("/dashboard");

  return {
    status: "success",
    message: copy.links.success.updated,
    link: data,
  };
}

export async function toggleLinkAction(
  linkId: number,
  isActive: boolean,
): Promise<LinkMutationResult> {
  const auth = await getAuthenticatedContext();

  if (!auth.success) {
    return auth.failure;
  }

  if (!Number.isSafeInteger(linkId) || linkId <= 0) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: copy.links.failure.invalid,
    };
  }

  const { data, error } = await auth.supabase
    .from("links")
    .update({ is_active: isActive })
    .eq("id", linkId)
    .eq("user_id", auth.userId)
    .select(LINK_SELECT)
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      code: "UPDATE_FAILED",
      message: copy.links.failure.toggle,
    };
  }

  revalidatePath("/dashboard");

  return {
    success: true,
    link: data,
    message: copy.links.success.updated,
  };
}

export async function deleteLinkAction(
  linkId: number,
): Promise<DeleteLinkResult> {
  const auth = await getAuthenticatedContext();

  if (!auth.success) {
    return auth.failure;
  }

  if (!Number.isSafeInteger(linkId) || linkId <= 0) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: copy.links.failure.invalid,
    };
  }

  const { data, error } = await auth.supabase
    .from("links")
    .delete()
    .eq("id", linkId)
    .eq("user_id", auth.userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      code: "DELETE_FAILED",
      message: copy.links.failure.delete,
    };
  }

  revalidatePath("/dashboard");

  return {
    success: true,
    deletedId: data.id,
    message: copy.links.success.deleted,
  };
}

export async function reorderLinksAction(
  linkIds: number[],
): Promise<ReorderLinksResult> {
  const auth = await getAuthenticatedContext();

  if (!auth.success) {
    return auth.failure;
  }

  if (!isValidLinkIdList(linkIds)) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: copy.links.failure.reorder,
    };
  }

  const ownedLinks = await readOwnedLinks(auth.supabase, auth.userId);

  if (!ownedLinks) {
    return {
      success: false,
      code: "REORDER_FAILED",
      message: copy.links.failure.reorder,
    };
  }

  const ownedIds = new Set(ownedLinks.map((link) => link.id));
  const containsExactlyOwnedIds =
    ownedIds.size === linkIds.length && linkIds.every((id) => ownedIds.has(id));

  if (!containsExactlyOwnedIds) {
    return {
      success: false,
      code: "REORDER_FAILED",
      message: copy.links.failure.reorderRestored,
      links: ownedLinks,
    };
  }

  const { error } = await auth.supabase.rpc("reorder_links", {
    p_link_ids: linkIds,
  });

  if (error) {
    const latestLinks = await readOwnedLinks(auth.supabase, auth.userId);

    return {
      success: false,
      code: "REORDER_FAILED",
      message: copy.links.failure.reorderRestored,
      ...(latestLinks ? { links: latestLinks } : {}),
    };
  }

  revalidatePath("/dashboard");

  const latestLinks = await readOwnedLinks(auth.supabase, auth.userId);

  if (latestLinks) {
    return { success: true, links: latestLinks };
  }

  const linksById = new Map(ownedLinks.map((link) => [link.id, link]));
  const optimisticLinks = linkIds.flatMap((id, position) => {
    const link = linksById.get(id);
    return link ? [{ ...link, position }] : [];
  });

  return { success: true, links: optimisticLinks };
}
