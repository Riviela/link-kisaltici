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
import { AddLinkModal } from "@/components/dashboard/add-link-modal";
import { DashboardProfileHeader } from "@/components/dashboard/dashboard-profile-header";
import { ProfilePreview } from "@/components/dashboard/profile-preview";
import { SortableLinkList } from "@/components/dashboard/sortable-link-list";
import { copy } from "@/lib/copy";
import type { LinkItem } from "@/lib/links/types";
import type { SocialHandles } from "@/lib/profile/social";

import styles from "./dashboard-interactions.module.css";

interface LinkManagerProps {
  initialLinks: LinkItem[];
  profile: {
    avatarUrl: string | null;
    username: string;
    bio: string | null;
    socialHandles: SocialHandles;
  };
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

export function LinkManager({ initialLinks, profile }: LinkManagerProps) {
  const router = useRouter();
  const [linkState, setLinkState] = useState<LinkState>(() => {
    const sortedLinks = sortLinks(initialLinks);
    return { current: sortedLinks, safe: sortedLinks };
  });
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [profileBio, setProfileBio] = useState(profile.bio);
  const [profileSocialHandles, setProfileSocialHandles] = useState(
    profile.socialHandles,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
    <section className={styles.dashboardColumns}>
      <div className={styles.editorPane}>
        <div className={styles.editorContent}>
          <div className="mb-9 flex items-center justify-between border-b border-[var(--color-border)] pb-4">
            <p className="text-base font-bold text-[var(--color-text)]">Links</p>
            <span className="text-xs font-semibold text-[var(--color-muted)]">Content</span>
          </div>

          <DashboardProfileHeader
            avatarUrl={profile.avatarUrl}
            bio={profileBio}
            onBioSaved={setProfileBio}
            onSocialSaved={(handles) => {
              setProfileSocialHandles(handles);
              router.refresh();
            }}
            socialHandles={profileSocialHandles}
            username={profile.username}
          />

          <button
            className={styles.addLinkButton}
            disabled={isBusy}
            onClick={() => setIsAddModalOpen(true)}
            type="button"
          >
            <span aria-hidden="true">+</span>
            <span>Add</span>
          </button>

          <div className={styles.placeholderActions}>
            <button
              aria-disabled="true"
              className={styles.placeholderButton}
              disabled
              type="button"
            >
              <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
                <path d="M3 5.5h12v9H3zM5 3.5h8v2H5z" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              Add collection
            </button>
            <button
              aria-disabled="true"
              className={styles.placeholderLink}
              disabled
              type="button"
            >
              <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16">
                <path d="M3 5.5h10v7H3zM5 3.5h6v2H5z" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              View archive
              <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14">
                <path d="m5 3 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.3" />
              </svg>
            </button>
          </div>

          <div className="mb-3 flex min-h-6 items-center justify-end">
            {managerStatus ? (
              <p
                aria-live="polite"
                className={
                  managerStatus.tone === "error"
                    ? "text-sm font-semibold text-[var(--color-danger)]"
                    : managerStatus.tone === "success"
                      ? "text-sm font-semibold text-[var(--color-success)]"
                      : "text-sm font-semibold text-[var(--color-muted)]"
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

        {isAddModalOpen ? (
          <AddLinkModal
            onClose={() => setIsAddModalOpen(false)}
            onPendingChange={setIsMutating}
            onSuccess={handleFormSuccess}
          />
        ) : null}
        </div>

      <ProfilePreview
        avatarUrl={profile.avatarUrl}
        bio={profileBio}
        links={links}
        socialHandles={profileSocialHandles}
        username={profile.username}
      />
    </section>
  );
}
