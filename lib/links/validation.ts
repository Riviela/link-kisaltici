import { copy } from "@/lib/copy";

export const LINK_TITLE_MAX_LENGTH = 120;
export const LINK_URL_MAX_LENGTH = 2048;

const CONTROL_OR_WHITESPACE_PATTERN = /[\s\x00-\x1f\x7f]/;
const ALLOWED_URL_PATTERN = /^(?:https?:\/\/[^/\s\x00-\x1f\x7f][^\s\x00-\x1f\x7f]*|mailto:[^\s\x00-\x1f\x7f]+|tel:[^\s\x00-\x1f\x7f]+)$/i;

interface ValidLinkInput {
  success: true;
  title: string;
  url: string;
  isActive: boolean;
}

interface InvalidLinkInput {
  success: false;
  message: string;
}

export type LinkValidationResult = ValidLinkInput | InvalidLinkInput;

export function validateLinkInput(formData: FormData): LinkValidationResult {
  const titleValue = formData.get("title");
  const urlValue = formData.get("url");
  const title = typeof titleValue === "string" ? titleValue.trim() : "";
  const url = typeof urlValue === "string" ? urlValue : "";

  if (title.length === 0 || title.length > LINK_TITLE_MAX_LENGTH) {
    return {
      success: false,
      message: copy.links.validation.title,
    };
  }

  if (
    url.length === 0 ||
    url.length > LINK_URL_MAX_LENGTH ||
    CONTROL_OR_WHITESPACE_PATTERN.test(url) ||
    !ALLOWED_URL_PATTERN.test(url)
  ) {
    return {
      success: false,
      message: copy.links.validation.url,
    };
  }

  return {
    success: true,
    title,
    url,
    isActive: formData.get("isActive") === "on",
  };
}

export function parseLinkId(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const linkId = Number(value);
  return Number.isSafeInteger(linkId) && linkId > 0 ? linkId : null;
}

export function isValidLinkIdList(linkIds: number[]) {
  return (
    linkIds.length > 0 &&
    linkIds.every((id) => Number.isSafeInteger(id) && id > 0) &&
    new Set(linkIds).size === linkIds.length
  );
}
