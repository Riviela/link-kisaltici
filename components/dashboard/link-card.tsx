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
        className="rounded-2xl border border-orange-200 bg-orange-50/40 p-5"
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
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow motion-reduce:transition-none ${isDragging ? "z-10 shadow-xl" : ""}`}
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-start gap-3">
        <button
          aria-label={copy.links.dragHandle}
          className="mt-0.5 grid size-10 shrink-0 touch-none place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
          disabled={disabled}
          type="button"
          {...attributes}
          {...listeners}
        >
          <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
            <path d="M6 4.5h.01M12 4.5h.01M6 9h.01M12 9h.01M6 13.5h.01M12 13.5h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
          </svg>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-slate-950">{link.title}</h3>
              <p className="mt-1 break-all text-sm text-slate-500">{link.url}</p>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <input
                checked={link.is_active}
                className="size-4 accent-orange-500"
                disabled={disabled}
                onChange={(event) => {
                  void onToggle(link.id, event.currentTarget.checked);
                }}
                type="checkbox"
              />
              {link.is_active ? copy.links.active : copy.links.inactive}
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={disabled}
              onClick={() => onEdit(link.id)}
              type="button"
            >
              {copy.links.edit}
            </button>

            {isConfirmingDelete ? (
              <>
                <span className="text-xs font-medium text-red-700">
                  {copy.links.deleteConfirm}
                </span>
                <button
                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
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
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={disabled}
                  onClick={() => setIsConfirmingDelete(false)}
                  type="button"
                >
                  {copy.links.cancel}
                </button>
              </>
            ) : (
              <button
                className="rounded-lg px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
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
