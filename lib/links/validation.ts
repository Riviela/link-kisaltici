import { copy } from "@/lib/copy";

export const LINK_TITLE_MAX_LENGTH = 120;
export const LINK_URL_MAX_LENGTH = 2048;

const CONTROL_OR_WHITESPACE_PATTERN = /[\s\x00-\x1f\x7f]/;
const ALLOWED_URL_PATTERN = /^(?:https?:\/\/[^/\s\x00-\x1f\x7f][^\s\x00-\x1f\x7f]*|mailto:[^\s\x00-\x1f\x7f]+|tel:[^\s\x00-\x1f\x7f]+)$/i;
const SUPPORTED_PROTOCOL_PATTERN = /^(?:https?:\/\/|mailto:|tel:)/i;
const EXPLICIT_PROTOCOL_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

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

export type LinkUrlValidationResult =
  | { success: true; url: string }
  | { success: false; message: string };

export function normalizeLinkUrl(value: string): string {
  const trimmedValue = value.trim();

  if (
    SUPPORTED_PROTOCOL_PATTERN.test(trimmedValue) ||
    EXPLICIT_PROTOCOL_PATTERN.test(trimmedValue)
  ) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

export function validateLinkUrlValue(value: unknown): LinkUrlValidationResult {
  const url = normalizeLinkUrl(typeof value === "string" ? value : "");

  if (
    url.length === 0 ||
    url.length > LINK_URL_MAX_LENGTH ||
    CONTROL_OR_WHITESPACE_PATTERN.test(url) ||
    !ALLOWED_URL_PATTERN.test(url)
  ) {
    return { success: false, message: copy.links.validation.url };
  }

  return { success: true, url };
}

export function deriveLinkTitle(url: string) {
  if (/^https?:\/\//i.test(url)) {
    return new URL(url).hostname;
  }

  const protocolSeparator = url.indexOf(":");
  return url.slice(protocolSeparator + 1);
}

export function validateLinkInput(formData: FormData): LinkValidationResult {
  const titleValue = formData.get("title");
  const urlValue = formData.get("url");
  const title = typeof titleValue === "string" ? titleValue.trim() : "";
  const validatedUrl = validateLinkUrlValue(urlValue);

  if (title.length === 0 || title.length > LINK_TITLE_MAX_LENGTH) {
    return {
      success: false,
      message: copy.links.validation.title,
    };
  }

  if (
    !validatedUrl.success
  ) {
    return {
      success: false,
      message: copy.links.validation.url,
    };
  }

  return {
    success: true,
    title,
    url: validatedUrl.url,
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
