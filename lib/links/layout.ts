export const LINK_LAYOUTS = ["classic", "featured"] as const;
export const DEFAULT_LINK_LAYOUT: LinkLayout = "classic";

export type LinkLayout = (typeof LINK_LAYOUTS)[number];

export function isLinkLayout(value: unknown): value is LinkLayout {
  return typeof value === "string" && LINK_LAYOUTS.includes(value as LinkLayout);
}

export function normalizeLinkLayout(value: unknown): LinkLayout {
  return isLinkLayout(value) ? value : DEFAULT_LINK_LAYOUT;
}
