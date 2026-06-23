"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

import {
  LINK_PANEL_LABELS,
  LINK_PANEL_TYPES,
  LinkCardPanels,
  LinkPanelIcon,
  type LinkPanelType,
} from "@/components/dashboard/link-card-panel";
import { LinkForm } from "@/components/dashboard/link-form";
import { copy } from "@/lib/copy";
import type { LinkItem } from "@/lib/links/types";

import styles from "./dashboard-interactions.module.css";

interface LinkCardProps {
  link: LinkItem;
  activePanel: LinkPanelType | null;
  disabled: boolean;
  isEditing: boolean;
  onDelete: (linkId: number) => Promise<boolean>;
  onEdit: (linkId: number | null) => void;
  onFormPendingChange: (pending: boolean) => void;
  onPanelToggle: (linkId: number, panel: LinkPanelType) => void;
  onToggle: (linkId: number, isActive: boolean) => Promise<void>;
  onUpdate: (link: LinkItem, message: string) => void;
}

export function LinkCard({
  link,
  activePanel,
  disabled,
  isEditing,
  onDelete,
  onEdit,
  onFormPendingChange,
  onPanelToggle,
  onToggle,
  onUpdate,
}: LinkCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id: link.id, disabled });

  const style = {
    transform: CSS.Transform.toString(
      transform ? { ...transform, x: 0 } : null,
    ),
  };

  if (isEditing) {
    return (
      <article
        className={`${styles.linkEditorCard} border border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-5`}
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
      className={styles.linkCard}
      data-panel-open={activePanel ? "true" : undefined}
      data-dragging={isDragging ? "true" : undefined}
      ref={setNodeRef}
      style={style}
    >
      <div className={styles.linkCardMain}>
        <button
          aria-label={copy.links.dragHandle}
          className={`${styles.linkDragHandle} drag-handle`}
          data-dragging={isDragging ? "true" : undefined}
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
          <div className="flex min-w-0 items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="truncate text-[0.95rem] font-bold text-[var(--color-text)]">
                  {link.title}
                </h3>
                <button
                  aria-label={copy.links.edit}
                  className={styles.inlineEditButton}
                  disabled={disabled}
                  onClick={() => onEdit(link.id)}
                  type="button"
                >
                  <svg aria-hidden="true" fill="none" height="15" viewBox="0 0 16 16" width="15"><path d="m3 11-.5 2.5L5 13l7.2-7.2-2-2L3 11ZM9.5 4.5l2 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" /></svg>
                </button>
              </div>
              <div className="mt-1 flex min-w-0 items-center gap-2">
                <p className="truncate text-sm text-[var(--color-muted)]">
                  {link.url}
                </p>
                <button
                  aria-label={copy.links.edit}
                  className={styles.inlineEditButton}
                  disabled={disabled}
                  onClick={() => onEdit(link.id)}
                  type="button"
                >
                  <svg aria-hidden="true" fill="none" height="15" viewBox="0 0 16 16" width="15"><path d="m3 11-.5 2.5L5 13l7.2-7.2-2-2L3 11ZM9.5 4.5l2 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.35" /></svg>
                </button>
              </div>
            </div>

            <div className={styles.linkCardTopActions}>
              <button
                aria-disabled="true"
                aria-label="Share link"
                className={styles.linkIconButton}
                disabled
                type="button"
              >
                <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16"><path d="M8 2.75v7m0-7L5.75 5M8 2.75 10.25 5M4.5 7.25v5h7v-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" /></svg>
              </button>
              <label className="toggle-control flex shrink-0 items-center gap-2 text-xs font-semibold text-[var(--color-muted)]">
                <span className="sr-only">
                  {link.is_active ? copy.links.active : copy.links.inactive}
                </span>
                <input
                  checked={link.is_active}
                  className="peer sr-only"
                  disabled={disabled}
                  onChange={(event) => {
                    void onToggle(link.id, event.currentTarget.checked);
                  }}
                  type="checkbox"
                />
                <span className={`${styles.toggleTrack} toggle-track relative h-6 w-11 rounded-full bg-[var(--color-border-strong)] after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-[var(--color-surface)] peer-checked:bg-[#22C55E] peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--color-accent-soft)] peer-disabled:opacity-45`} />
              </label>
            </div>
          </div>

          <div className={styles.linkToolbarRow}>
            <div className={styles.linkPanelToolbar} aria-label="Link controls">
              {LINK_PANEL_TYPES.map((panel) => {
                const isActive = activePanel === panel;
                return (
                  <button
                    aria-label={LINK_PANEL_LABELS[panel]}
                    aria-pressed={isActive}
                    className={styles.linkPanelButton}
                    data-active={isActive ? "true" : undefined}
                    disabled={disabled}
                    key={panel}
                    onClick={() => onPanelToggle(link.id, panel)}
                    type="button"
                  >
                    <LinkPanelIcon panel={panel} />
                    {panel === "insights" ? <span>0 clicks</span> : null}
                  </button>
                );
              })}
            </div>

            <div className={styles.linkDeleteSlot}>

          {isConfirmingDelete ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <span className="text-xs font-semibold text-[var(--color-danger)]">
                {copy.links.deleteConfirm}
              </span>
              <button
                className="button-danger min-h-8 px-3 text-xs"
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
                className="button-secondary min-h-8 px-3 text-xs"
                disabled={disabled}
                onClick={() => setIsConfirmingDelete(false)}
                type="button"
              >
                {copy.links.cancel}
              </button>
            </div>
          ) : (
            <button
              aria-label={copy.links.delete}
              className={styles.linkDeleteButton}
              disabled={disabled}
              onClick={() => setIsConfirmingDelete(true)}
              type="button"
            >
              <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16"><path d="M3.5 4.5h9M6 4.5V3h4v1.5M5 6.5v6h6v-6M7 8v2.5M9 8v2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" /></svg>
            </button>
          )}
            </div>
          </div>
        </div>
      </div>
      {activePanel ? (
        <LinkCardPanels
          activePanel={activePanel}
          onClose={() => onPanelToggle(link.id, activePanel)}
        />
      ) : null}
    </article>
  );
}
