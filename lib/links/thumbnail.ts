import type { createClient } from "@/lib/supabase/server";

export const LINK_THUMBNAILS_BUCKET = "link-thumbnails";
export const LINK_THUMBNAIL_MAX_BYTES = 2 * 1024 * 1024;
export const LINK_THUMBNAIL_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type LinkThumbnailMimeType = (typeof LINK_THUMBNAIL_MIME_TYPES)[number];

const THUMBNAIL_EXTENSION_BY_MIME: Record<LinkThumbnailMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export interface LinkThumbnailValidationFailure {
  success: false;
  message: string;
}

export interface LinkThumbnailValidationSuccess {
  success: true;
  extension: string;
  mimeType: LinkThumbnailMimeType;
}

export type LinkThumbnailValidationResult =
  | LinkThumbnailValidationFailure
  | LinkThumbnailValidationSuccess;

export function isLinkThumbnailMimeType(
  value: unknown,
): value is LinkThumbnailMimeType {
  return (
    typeof value === "string" &&
    LINK_THUMBNAIL_MIME_TYPES.includes(value as LinkThumbnailMimeType)
  );
}

export function validateLinkThumbnailFile(
  file: File,
): LinkThumbnailValidationResult {
  if (file.size <= 0) {
    return {
      success: false,
      message: "Choose an image file to upload.",
    };
  }

  if (file.size > LINK_THUMBNAIL_MAX_BYTES) {
    return {
      success: false,
      message: "Choose an image under 2 MB.",
    };
  }

  if (!isLinkThumbnailMimeType(file.type)) {
    return {
      success: false,
      message: "Use a JPG, PNG, or WebP image.",
    };
  }

  return {
    success: true,
    extension: THUMBNAIL_EXTENSION_BY_MIME[file.type],
    mimeType: file.type,
  };
}

export function getLinkThumbnailPath(
  userId: string,
  linkId: number,
  extension: string,
) {
  return `${userId}/${linkId}/thumbnail.${extension}`;
}

export function isValidLinkThumbnailPath(
  userId: string,
  linkId: number,
  path: unknown,
) {
  if (typeof path !== "string") return false;

  const escapedUserId = userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `^${escapedUserId}/${linkId}/thumbnail\\.(jpg|jpeg|png|webp)$`,
  ).test(path);
}

export function getPublicLinkThumbnailUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  thumbnailPath: string | null,
) {
  if (!thumbnailPath) return null;

  const { data } = supabase.storage
    .from(LINK_THUMBNAILS_BUCKET)
    .getPublicUrl(thumbnailPath);

  return data.publicUrl;
}
