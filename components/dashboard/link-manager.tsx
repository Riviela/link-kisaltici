"use client";

import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import {
  deleteLinkAction,
  reorderLinksAction,
  toggleLinkAction,
} from "@/app/actions/links";
import { LinkForm } from "@/components/dashboard/link-form";
import { SortableLinkList } from "@/components/dashboard/sortable-link-list";
import { copy } from "@/lib/copy";
import type { LinkItem } from "@/lib/links/types";

interface LinkManagerProps {
  initialLinks: LinkItem[];
}

interface FeedbackMessage {
  tone: "success" | "error";
  text: string;
}

interface ReconciliationState {
  initialLinks: LinkItem[];
  isBusy: boolean;
  pendingSnapshot: LinkItem[] | null;
}

interface LinkState {
  current: LinkItem[];
  safe: LinkItem[];
}

function sortLinks(links: LinkItem[]) {
  return [...links].sort(
    (left, right) => left.position - right.position || left.id - right.id,
  );
}

export function LinkManager({ initialLinks }: LinkManagerProps) {
  const router = useRouter();
  const [linkState, setLinkState] = useState<LinkState>(() => {
    const sortedLinks = sortLinks(initialLinks);
    return { current: sortedLinks, safe: sortedLinks };
  });
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const isBusy = isMutating || isReordering;
  const [reconciliationState, setReconciliationState] =
    useState<ReconciliationState>({
      initialLinks,
      isBusy,
      pendingSnapshot: null,
    });
  const links = linkState.current;

  const applyAuthoritativeLinks = useCallback((nextLinks: LinkItem[]) => {
    const sortedLinks = sortLinks(nextLinks);
    setLinkState({ current: sortedLinks, safe: sortedLinks });
  }, []);

  if (
    initialLinks !== reconciliationState.initialLinks ||
    isBusy !== reconciliationState.isBusy
  ) {
    const wasBusy = reconciliationState.isBusy;
    let pendingSnapshot = reconciliationState.pendingSnapshot;
    let snapshotToApply: LinkItem[] | null = null;

    if (initialLinks !== reconciliationState.initialLinks) {
      if (isBusy) {
        pendingSnapshot = initialLinks;
      } else {
        snapshotToApply = initialLinks;
      }
    }

    if (wasBusy && !isBusy && pendingSnapshot) {
      snapshotToApply = pendingSnapshot;
      pendingSnapshot = null;
    }

    setReconciliationState({ initialLinks, isBusy, pendingSnapshot });

    if (snapshotToApply) {
      const sortedLinks = sortLinks(snapshotToApply);
      setLinkState({ current: sortedLinks, safe: sortedLinks });
    }
  }

  const applyReturnedLink = useCallback((returnedLink: LinkItem) => {
    setLinkState((currentState) => {
      const nextLinks = sortLinks([
        ...currentState.current.filter((link) => link.id !== returnedLink.id),
        returnedLink,
      ]);
      return { current: nextLinks, safe: nextLinks };
    });
  }, []);

  const handleFormSuccess = useCallback(
    (returnedLink: LinkItem, message: string) => {
      applyReturnedLink(returnedLink);
      setEditingLinkId(null);
      setFeedback({ tone: "success", text: message });
      router.refresh();
    },
    [applyReturnedLink, router],
  );

  const handleToggle = useCallback(
    async (linkId: number, isActive: boolean) => {
      if (isBusy) return;

      setIsMutating(true);
      setFeedback(null);

      try {
        const result = await toggleLinkAction(linkId, isActive);

        if (result.success) {
          applyReturnedLink(result.link);
          setFeedback({ tone: "success", text: result.message });
          router.refresh();
        } else {
          setFeedback({ tone: "error", text: result.message });
        }
      } catch {
        setFeedback({ tone: "error", text: copy.links.failure.toggle });
      } finally {
        setIsMutating(false);
      }
    },
    [applyReturnedLink, isBusy, router],
  );

  const handleDelete = useCallback(
    async (linkId: number) => {
      if (isBusy) return false;

      setIsMutating(true);
      setFeedback(null);

      try {
        const result = await deleteLinkAction(linkId);

        if (!result.success) {
          setFeedback({ tone: "error", text: result.message });
          return false;
        }

        setLinkState((currentState) => {
          const nextLinks = currentState.current.filter(
            (link) => link.id !== result.deletedId,
          );
          return { current: nextLinks, safe: nextLinks };
        });
        setEditingLinkId(null);
        setFeedback({ tone: "success", text: result.message });
        router.refresh();
        return true;
      } catch {
        setFeedback({ tone: "error", text: copy.links.failure.delete });
        return false;
      } finally {
        setIsMutating(false);
      }
    },
    [isBusy, router],
  );

  const persistOrder = useCallback(
    async (optimisticLinks: LinkItem[]) => {
      const previousSafeLinks = linkState.safe;
      setIsReordering(true);
      setFeedback(null);

      try {
        const result = await reorderLinksAction(
          optimisticLinks.map((link) => link.id),
        );

        if (result.success) {
          applyAuthoritativeLinks(result.links);
        } else {
          applyAuthoritativeLinks(result.links ?? previousSafeLinks);
          setFeedback({ tone: "error", text: result.message });
        }
      } catch {
        applyAuthoritativeLinks(previousSafeLinks);
        setFeedback({
          tone: "error",
          text: copy.links.failure.reorderRestored,
        });
      } finally {
        setIsReordering(false);
        router.refresh();
      }
    },
    [applyAuthoritativeLinks, linkState.safe, router],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (isBusy || !event.over || event.active.id === event.over.id) {
        return;
      }

      const oldIndex = links.findIndex((link) => link.id === event.active.id);
      const newIndex = links.findIndex((link) => link.id === event.over?.id);

      if (oldIndex < 0 || newIndex < 0) {
        return;
      }

      const optimisticLinks = arrayMove(links, oldIndex, newIndex).map(
        (link, position) => ({ ...link, position }),
      );

      setLinkState((currentState) => ({
        current: optimisticLinks,
        safe: currentState.safe,
      }));
      void persistOrder(optimisticLinks);
    },
    [isBusy, links, persistOrder],
  );

  const managerStatus = useMemo(() => {
    if (isReordering) {
      return { tone: "neutral" as const, text: copy.links.saving };
    }

    return feedback;
  }, [feedback, isReordering]);

  return (
    <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.05)] sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
          {copy.links.add}
        </h2>
        <div className="mt-6">
          <LinkForm
            disabled={isBusy}
            mode="create"
            onPendingChange={setIsMutating}
            onSuccess={handleFormSuccess}
          />
        </div>
      </div>

      <div className="min-w-0 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.05)] sm:p-8">
        <div className="mb-6 flex min-h-6 items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            {copy.links.listTitle}
          </h2>
          {managerStatus ? (
            <p
              aria-live="polite"
              className={
                managerStatus.tone === "error"
                  ? "text-sm font-medium text-red-700"
                  : managerStatus.tone === "success"
                    ? "text-sm font-medium text-emerald-700"
                    : "text-sm font-medium text-slate-500"
              }
              role="status"
            >
              {managerStatus.text}
            </p>
          ) : null}
        </div>

        <SortableLinkList
          disabled={isBusy}
          editingLinkId={editingLinkId}
          links={links}
          onDelete={handleDelete}
          onDragEnd={handleDragEnd}
          onEdit={setEditingLinkId}
          onFormPendingChange={setIsMutating}
          onToggle={handleToggle}
          onUpdate={handleFormSuccess}
        />
      </div>
    </section>
  );
}
