export interface LinkItem {
  id: number;
  title: string;
  url: string;
  is_active: boolean;
  position: number;
}

export type LinkActionErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "INVALID_INPUT"
  | "NOT_FOUND"
  | "CREATE_FAILED"
  | "UPDATE_FAILED"
  | "DELETE_FAILED"
  | "REORDER_FAILED";

export interface LinkActionFailure {
  success: false;
  code: LinkActionErrorCode;
  message: string;
}

export interface LinkMutationSuccess {
  success: true;
  link: LinkItem;
  message: string;
}

export type LinkMutationResult = LinkMutationSuccess | LinkActionFailure;

export interface DeleteLinkSuccess {
  success: true;
  deletedId: number;
  message: string;
}

export type DeleteLinkResult = DeleteLinkSuccess | LinkActionFailure;

export interface ReorderLinksSuccess {
  success: true;
  links: LinkItem[];
}

export interface ReorderLinksFailure extends LinkActionFailure {
  links?: LinkItem[];
}

export type ReorderLinksResult = ReorderLinksSuccess | ReorderLinksFailure;

export type LinkFormActionState =
  | { status: "idle"; message: "" }
  | { status: "error"; message: string }
  | { status: "success"; message: string; link: LinkItem };

export const initialLinkFormActionState: LinkFormActionState = {
  status: "idle",
  message: "",
};
