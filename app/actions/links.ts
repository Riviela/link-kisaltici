"use server";

import { revalidatePath } from "next/cache";

import { copy } from "@/lib/copy";
import {
  LINK_SELECT,
  mapLinkRow,
  type LinkRow,
} from "@/lib/links/get-current-links";
import { isLinkLayout, type LinkLayout } from "@/lib/links/layout";
import {
  getLinkThumbnailPath,
  LINK_THUMBNAILS_BUCKET,
  validateLinkThumbnailFile,
} from "@/lib/links/thumbnail";
import type {
  DeleteLinkResult,
  LinkActionFailure,
  LinkFormActionState,
  LinkItem,
  LinkMutationResult,
  LinkPickerActionState,
  ReorderLinksResult,
} from "@/lib/links/types";
import {
  deriveLinkTitle,
  isValidLinkIdList,
  parseLinkId,
  validateLinkInput,
  validateLinkUrlValue,
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

  return error ? null : (data ?? []).map((link) => mapLinkRow(supabase, link));
}

function toFormFailure(failure: LinkActionFailure): LinkFormActionState {
  return { status: "error", message: failure.message };
}

function logLinkThumbnailError(
  stage: string,
  linkId: number,
  error: unknown,
) {
  if (error && typeof error === "object") {
    const details = error as {
      code?: unknown;
      message?: unknown;
      name?: unknown;
      status?: unknown;
      statusCode?: unknown;
    };

    console.error("[link-thumbnail]", {
      code: typeof details.code === "string" ? details.code : undefined,
      linkId,
      message:
        typeof details.message === "string" ? details.message : undefined,
      name: typeof details.name === "string" ? details.name : undefined,
      stage,
      status:
        typeof details.status === "number" ||
        typeof details.status === "string"
          ? details.status
          : undefined,
      statusCode:
        typeof details.statusCode === "number" ||
        typeof details.statusCode === "string"
          ? details.statusCode
          : undefined,
    });
    return;
  }

  console.error("[link-thumbnail]", { linkId, stage });
}

function toLinkItem(
  supabase: ServerSupabaseClient,
  link: LinkRow,
): LinkItem {
  return mapLinkRow(supabase, link);
}

async function revalidateLinkSurfaces(
  supabase: ServerSupabaseClient,
  userId: string,
) {
  revalidatePath("/dashboard");

  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .maybeSingle();

  if (typeof data?.username === "string" && data.username.length > 0) {
    revalidatePath(`/${data.username}`);
  }
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

  await revalidateLinkSurfaces(auth.supabase, auth.userId);

  return {
    status: "success",
    message: copy.links.success.created,
    link: toLinkItem(auth.supabase, data),
  };
}

export async function createLinkFromUrlAction(
  previousState: LinkPickerActionState,
  formData: FormData,
): Promise<LinkPickerActionState> {
  void previousState;

  const auth = await getAuthenticatedContext();

  if (!auth.success) {
    return { status: "error", message: auth.failure.message };
  }

  const validatedUrl = validateLinkUrlValue(formData.get("url"));

  if (!validatedUrl.success) {
    return { status: "error", message: copy.linkPicker.invalid };
  }

  let title: string;

  try {
    title = deriveLinkTitle(validatedUrl.url).trim().slice(0, 120);
  } catch {
    return { status: "error", message: copy.linkPicker.invalid };
  }

  if (title.length === 0) {
    return { status: "error", message: copy.linkPicker.invalid };
  }

  const { data, error } = await auth.supabase
    .from("links")
    .insert({
      user_id: auth.userId,
      title,
      url: validatedUrl.url,
      is_active: true,
    })
    .select(LINK_SELECT)
    .single();

  if (error || !data) {
    return { status: "error", message: copy.links.failure.create };
  }

  await revalidateLinkSurfaces(auth.supabase, auth.userId);

  return {
    status: "success",
    message: copy.links.success.created,
    link: toLinkItem(auth.supabase, data),
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

  await revalidateLinkSurfaces(auth.supabase, auth.userId);

  return {
    status: "success",
    message: copy.links.success.updated,
    link: toLinkItem(auth.supabase, data),
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

  await revalidateLinkSurfaces(auth.supabase, auth.userId);

  return {
    success: true,
    link: toLinkItem(auth.supabase, data),
    message: copy.links.success.updated,
  };
}

export async function updateLinkLayoutAction(
  linkId: number,
  layout: LinkLayout,
): Promise<LinkMutationResult> {
  const auth = await getAuthenticatedContext();

  if (!auth.success) {
    return auth.failure;
  }

  if (!Number.isSafeInteger(linkId) || linkId <= 0 || !isLinkLayout(layout)) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: copy.links.failure.invalid,
    };
  }

  const { data, error } = await auth.supabase
    .from("links")
    .update({ layout })
    .eq("id", linkId)
    .eq("user_id", auth.userId)
    .select(LINK_SELECT)
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      code: "UPDATE_FAILED",
      message: copy.links.failure.update,
    };
  }

  await revalidateLinkSurfaces(auth.supabase, auth.userId);

  return {
    success: true,
    link: toLinkItem(auth.supabase, data),
    message: copy.links.success.layoutUpdated,
  };
}

export async function uploadLinkThumbnailAction(
  linkId: number,
  formData: FormData,
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

  const file = formData.get("thumbnail");

  if (!(file instanceof File)) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: copy.links.failure.thumbnail,
    };
  }

  const validatedFile = validateLinkThumbnailFile(file);

  if (!validatedFile.success) {
    return {
      success: false,
      code: "INVALID_INPUT",
      message: validatedFile.message,
    };
  }

  const { data: existingLink, error: lookupError } = await auth.supabase
    .from("links")
    .select("id, thumbnail_path")
    .eq("id", linkId)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (lookupError || !existingLink) {
    if (lookupError) {
      logLinkThumbnailError("lookup-owned-link", linkId, lookupError);
    }

    return {
      success: false,
      code: "NOT_FOUND",
      message: copy.links.failure.update,
    };
  }

  const thumbnailPath = getLinkThumbnailPath(
    auth.userId,
    linkId,
    validatedFile.extension,
  );
  const isSameThumbnailPath = existingLink.thumbnail_path === thumbnailPath;

  if (isSameThumbnailPath) {
    const { error: removeExistingError } = await auth.supabase.storage
      .from(LINK_THUMBNAILS_BUCKET)
      .remove([thumbnailPath]);

    if (removeExistingError) {
      logLinkThumbnailError(
        "remove-existing-thumbnail-before-replace",
        linkId,
        removeExistingError,
      );

      return {
        success: false,
        code: "UPDATE_FAILED",
        message: copy.links.failure.thumbnail,
      };
    }
  }

  const { error: uploadError } = await auth.supabase.storage
    .from(LINK_THUMBNAILS_BUCKET)
    .upload(thumbnailPath, file, {
      cacheControl: "3600",
      contentType: validatedFile.mimeType,
      upsert: false,
    });

  if (uploadError) {
    logLinkThumbnailError("storage-upload", linkId, uploadError);

    return {
      success: false,
      code: "UPDATE_FAILED",
      message: copy.links.failure.thumbnail,
    };
  }

  const { data, error } = await auth.supabase
    .from("links")
    .update({
      thumbnail_path: thumbnailPath,
      thumbnail_updated_at: new Date().toISOString(),
    })
    .eq("id", linkId)
    .eq("user_id", auth.userId)
    .select(LINK_SELECT)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      logLinkThumbnailError("update-thumbnail-path", linkId, error);
    }

    if (!isSameThumbnailPath) {
      await auth.supabase.storage
        .from(LINK_THUMBNAILS_BUCKET)
        .remove([thumbnailPath]);
    }

    return {
      success: false,
      code: "UPDATE_FAILED",
      message: copy.links.failure.thumbnail,
    };
  }

  if (
    existingLink.thumbnail_path &&
    existingLink.thumbnail_path !== thumbnailPath
  ) {
    const { error: removeOldError } = await auth.supabase.storage
      .from(LINK_THUMBNAILS_BUCKET)
      .remove([existingLink.thumbnail_path]);

    if (removeOldError) {
      logLinkThumbnailError("remove-replaced-thumbnail", linkId, removeOldError);
    }
  }

  await revalidateLinkSurfaces(auth.supabase, auth.userId);

  return {
    success: true,
    link: toLinkItem(auth.supabase, data),
    message: copy.links.success.thumbnailUpdated,
  };
}

export async function removeLinkThumbnailAction(
  linkId: number,
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

  const { data: existingLink, error: lookupError } = await auth.supabase
    .from("links")
    .select("id, thumbnail_path")
    .eq("id", linkId)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (lookupError || !existingLink) {
    if (lookupError) {
      logLinkThumbnailError("remove-lookup-owned-link", linkId, lookupError);
    }

    return {
      success: false,
      code: "NOT_FOUND",
      message: copy.links.failure.update,
    };
  }

  const { data, error } = await auth.supabase
    .from("links")
    .update({ thumbnail_path: null, thumbnail_updated_at: null })
    .eq("id", linkId)
    .eq("user_id", auth.userId)
    .select(LINK_SELECT)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      logLinkThumbnailError("clear-thumbnail-path", linkId, error);
    }

    return {
      success: false,
      code: "UPDATE_FAILED",
      message: copy.links.failure.thumbnail,
    };
  }

  if (existingLink.thumbnail_path) {
    const { error: removeError } = await auth.supabase.storage
      .from(LINK_THUMBNAILS_BUCKET)
      .remove([existingLink.thumbnail_path]);

    if (removeError) {
      logLinkThumbnailError("remove-thumbnail-object", linkId, removeError);
    }
  }

  await revalidateLinkSurfaces(auth.supabase, auth.userId);

  return {
    success: true,
    link: toLinkItem(auth.supabase, data),
    message: copy.links.success.thumbnailRemoved,
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

  const { data: existingLink, error: lookupError } = await auth.supabase
    .from("links")
    .select("id, thumbnail_path")
    .eq("id", linkId)
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (lookupError || !existingLink) {
    return {
      success: false,
      code: "DELETE_FAILED",
      message: copy.links.failure.delete,
    };
  }

  if (existingLink.thumbnail_path) {
    await auth.supabase.storage
      .from(LINK_THUMBNAILS_BUCKET)
      .remove([existingLink.thumbnail_path]);
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

  await revalidateLinkSurfaces(auth.supabase, auth.userId);

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
