"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useId } from "react";

import { LinkCard } from "@/components/dashboard/link-card";
import type { LinkPanelType } from "@/components/dashboard/link-card-panel";
import { copy } from "@/lib/copy";
import type { LinkItem } from "@/lib/links/types";

interface OpenPanelState {
  linkId: number;
  panel: LinkPanelType;
}

interface SortableLinkListProps {
  disabled: boolean;
  editingLinkId: number | null;
  links: LinkItem[];
  onDelete: (linkId: number) => Promise<boolean>;
  onDragEnd: (event: DragEndEvent) => void;
  onEdit: (linkId: number | null) => void;
  onFormPendingChange: (pending: boolean) => void;
  onPanelToggle: (linkId: number, panel: LinkPanelType) => void;
  onToggle: (linkId: number, isActive: boolean) => Promise<void>;
  onUpdate: (link: LinkItem, message: string) => void;
  openPanel: OpenPanelState | null;
}

export function SortableLinkList({
  disabled,
  editingLinkId,
  links,
  onDelete,
  onDragEnd,
  onEdit,
  onFormPendingChange,
  onPanelToggle,
  onToggle,
  onUpdate,
  openPanel,
}: SortableLinkListProps) {
  const dndContextId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 160, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (links.length === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-raised)] px-6 py-14 text-center text-sm leading-6 text-[var(--color-muted)]">
        {copy.links.empty}
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      id={dndContextId}
      onDragEnd={onDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={links.map((link) => link.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 overflow-x-clip">
          {links.map((link) => (
            <LinkCard
              activePanel={openPanel?.linkId === link.id ? openPanel.panel : null}
              disabled={disabled}
              isEditing={editingLinkId === link.id}
              key={link.id}
              link={link}
              onDelete={onDelete}
              onEdit={onEdit}
              onFormPendingChange={onFormPendingChange}
              onPanelToggle={onPanelToggle}
              onToggle={onToggle}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
