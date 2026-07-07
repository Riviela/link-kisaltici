"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createLinkAction,
  updateLinkAction,
} from "@/app/actions/links";
import { copy } from "@/lib/copy";
import {
  initialLinkFormActionState,
  type LinkItem,
} from "@/lib/links/types";
import {
  LINK_TITLE_MAX_LENGTH,
  LINK_URL_MAX_LENGTH,
} from "@/lib/links/validation";

interface LinkFormProps {
  mode: "create" | "edit";
  link?: LinkItem;
  disabled?: boolean;
  onCancel?: () => void;
  onPendingChange?: (pending: boolean) => void;
  onSuccess: (link: LinkItem, message: string) => void;
}

export function LinkForm({
  mode,
  link,
  disabled = false,
  onCancel,
  onPendingChange,
  onSuccess,
}: LinkFormProps) {
  const action = mode === "create" ? createLinkAction : updateLinkAction;
  const [state, formAction, isPending] = useActionState(
    action,
    initialLinkFormActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const handledStateRef = useRef(state);

  useEffect(() => {
    onPendingChange?.(isPending);
  }, [isPending, onPendingChange]);

  useEffect(() => {
    if (handledStateRef.current === state) {
      return;
    }

    handledStateRef.current = state;

    if (state.status === "success") {
      onSuccess(state.link, state.message);

      if (mode === "create") {
        formRef.current?.reset();
      }
    }
  }, [mode, onSuccess, state]);

  const controlsDisabled = disabled || isPending;

  return (
    <form action={formAction} className="space-y-4" ref={formRef}>
      {mode === "edit" && link ? (
        <input name="linkId" type="hidden" value={link.id} />
      ) : null}

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-[var(--color-text)]"
          htmlFor={`${mode}-title-${link?.id ?? "new"}`}
        >
          {copy.links.titleLabel}
        </label>
        <input
          className="field-control"
          defaultValue={link?.title}
          disabled={controlsDisabled}
          id={`${mode}-title-${link?.id ?? "new"}`}
          maxLength={LINK_TITLE_MAX_LENGTH}
          name="title"
          placeholder={copy.links.titlePlaceholder}
          required
          type="text"
        />
      </div>

      <div className="space-y-2">
        <label
          className="text-sm font-medium text-[var(--color-text)]"
          htmlFor={`${mode}-url-${link?.id ?? "new"}`}
        >
          {copy.links.urlLabel}
        </label>
        <input
          autoCapitalize="none"
          className="field-control"
          defaultValue={link?.url}
          disabled={controlsDisabled}
          id={`${mode}-url-${link?.id ?? "new"}`}
          inputMode="url"
          maxLength={LINK_URL_MAX_LENGTH}
          name="url"
          placeholder={copy.links.urlPlaceholder}
          required
          spellCheck={false}
          type="text"
        />
      </div>

      <label className="toggle-control flex items-center gap-3 text-sm font-medium text-[var(--color-text)]">
        <input
          className="size-4 accent-[var(--color-accent)]"
          defaultChecked={link?.is_active ?? true}
          disabled={controlsDisabled}
          name="isActive"
          type="checkbox"
        />
        {copy.links.activeLabel}
      </label>

      {state.status === "error" ? (
        <p
          aria-live="polite"
          className="status-error"
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          className={`button-primary px-5 py-3 text-sm ${mode === "create" ? "w-full" : ""}`}
          disabled={controlsDisabled}
          type="submit"
        >
          {isPending
            ? copy.links.processing
            : mode === "create"
              ? copy.links.add
              : copy.links.save}
        </button>

        {mode === "edit" && onCancel ? (
          <button
            className="button-secondary px-5 py-3 text-sm"
            disabled={controlsDisabled}
            onClick={onCancel}
            type="button"
          >
            {copy.links.cancel}
          </button>
        ) : null}
      </div>
    </form>
  );
}
