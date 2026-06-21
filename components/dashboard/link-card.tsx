"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { useState } from "react";

import { LinkForm } from "@/components/dashboard/link-form";
import { copy } from "@/lib/copy";
import type { LinkItem } from "@/lib/links/types";

interface LinkCardProps {
  link: LinkItem;
  disabled: boolean;
  isEditing: boolean;
  onDelete: (linkId: number) => Promise<boolean>;
  onEdit: (linkId: number | null) => void;
  onFormPendingChange: (pending: boolean) => void;
  onToggle: (linkId: number, isActive: boolean) => Promise<void>;
  onUpdate: (link: LinkItem, message: string) => void;
}

export function LinkCard({
  link,
  disabled,
  isEditing,
  onDelete,
  onEdit,
  onFormPendingChange,
  onToggle,
  onUpdate,
}: LinkCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: link.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  if (isEditing) {
    return (
      <article
        className="rounded-[var(--radius-card)] border border-[#cbc6ff] bg-[#f7f6ff] p-5"
        ref={setNodeRef}
        style={style}
      >
        <LinkForm
          disabled={disabled}
          link={link}
          mode="edit"
          onCancel={() => onEdit(null)}
          onPendingChange={onFormPendingChange}
          onSuccess={onUpdate}
        />
      </article>
    );
  }

  return (
    <article
      className={`rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-[border-color,box-shadow,transform] duration-200 sm:p-5 ${isDragging ? "z-10 scale-[1.01] border-[#bbb4ff] shadow-[0_22px_50px_rgba(62,54,120,0.18)]" : "shadow-[0_8px_24px_rgba(62,54,120,0.05)] hover:border-[var(--color-border-strong)]"}`}
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <button
          aria-label={copy.links.dragHandle}
          className="button-quiet mt-0.5 grid size-10 min-h-10 shrink-0 touch-none place-items-center rounded-xl p-0 text-[var(--color-muted)] disabled:opacity-40"
          disabled={disabled}
          type="button"
          {...attributes}
          {...listeners}
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="18"
            viewBox="0 0 18 18"
            width="18"
          >
            <path
              d="M6 4.5h.01M12 4.5h.01M6 9h.01M12 9h.01M6 13.5h.01M12 13.5h.01"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2.5"
            />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-bold text-[var(--color-text)]">
                {link.title}
              </h3>
              <p className="mt-1 break-all text-sm text-[var(--color-muted)]">
                {link.url}
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-[var(--color-muted)]">
              <input
                checked={link.is_active}
                className="peer sr-only"
                disabled={disabled}
                onChange={(event) => {
                  void onToggle(link.id, event.currentTarget.checked);
                }}
                type="checkbox"
              />
              <span className="relative h-6 w-11 rounded-full bg-[#d9dbe2] transition-colors after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:bg-[var(--color-accent)] peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-[#d7d3ff] peer-disabled:opacity-45" />
              {link.is_active ? copy.links.active : copy.links.inactive}
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              className="button-secondary min-h-9 rounded-xl px-3 text-xs"
              disabled={disabled}
              onClick={() => onEdit(link.id)}
              type="button"
            >
              {copy.links.edit}
            </button>

            {isConfirmingDelete ? (
              <>
                <span className="text-xs font-semibold text-[var(--color-danger)]">
                  {copy.links.deleteConfirm}
                </span>
                <button
                  className="button-danger min-h-9 rounded-xl px-3 text-xs"
                  disabled={disabled}
                  onClick={async () => {
                    const deleted = await onDelete(link.id);
                    if (!deleted) setIsConfirmingDelete(false);
                  }}
                  type="button"
                >
                  {copy.links.delete}
                </button>
                <button
                  className="button-secondary min-h-9 rounded-xl px-3 text-xs"
                  disabled={disabled}
                  onClick={() => setIsConfirmingDelete(false)}
                  type="button"
                >
                  {copy.links.cancel}
                </button>
              </>
            ) : (
              <button
                className="button-quiet min-h-9 rounded-xl px-3 text-xs text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]"
                disabled={disabled}
                onClick={() => setIsConfirmingDelete(true)}
                type="button"
              >
                {copy.links.delete}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
