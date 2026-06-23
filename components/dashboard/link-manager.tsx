"use client";

import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";

import {
  deleteLinkAction,
  removeLinkThumbnailAction,
  reorderLinksAction,
  toggleLinkAction,
  updateLinkLayoutAction,
  uploadLinkThumbnailAction,
} from "@/app/actions/links";
import { updateProfileAppearanceAction } from "@/app/actions/profile";
import { AddLinkModal } from "@/components/dashboard/add-link-modal";
import { DashboardProfileHeader } from "@/components/dashboard/dashboard-profile-header";
import { DesignEditor } from "@/components/dashboard/design-editor";
import type { LinkPanelType } from "@/components/dashboard/link-card-panel";
import { ProfilePreview } from "@/components/dashboard/profile-preview";
import { SortableLinkList } from "@/components/dashboard/sortable-link-list";
import { copy } from "@/lib/copy";
import type { LinkLayout } from "@/lib/links/layout";
import type { LinkItem } from "@/lib/links/types";
import {
  normalizeAppearance,
  type ProfileAppearance,
} from "@/lib/profile/appearance";
import type { SocialHandles } from "@/lib/profile/social";

import styles from "./dashboard-interactions.module.css";

interface LinkManagerProps {
  initialLinks: LinkItem[];
  profile: {
    appearance: ProfileAppearance;
    avatarUrl: string | null;
    username: string;
    bio: string | null;
    socialHandles: SocialHandles;
  };
}

interface FeedbackMessage {
  tone: "success" | "error" | "neutral";
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

interface OpenPanelState {
  linkId: number;
  panel: LinkPanelType;
}

interface PendingPanelState {
  linkId: number;
  type: "layout" | "thumbnail";
}

interface PanelMessageState {
  linkId: number;
  text: string;
}

type DashboardMode = "content" | "design";

function sortLinks(links: LinkItem[]) {
  return [...links].sort(
    (left, right) => left.position - right.position || left.id - right.id,
  );
}

function areAppearancesEqual(
  left: ProfileAppearance,
  right: ProfileAppearance,
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function RailIcon({ type }: { type: "menu" | "content" | "design" | "enhance" | "settings" }) {
  if (type === "menu") {
    return (
      <svg fill="none" height="18" viewBox="0 0 18 18" width="18">
        <path d="M4 5h10M4 9h10M4 13h10" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      </svg>
    );
  }

  if (type === "design") {
    return (
      <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 20 20" width="20">
        <path d="M4 5.5h12v4H4zM6 12h8v3H6z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" />
      </svg>
    );
  }

  if (type === "enhance") {
    return (
      <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 20 20" width="20">
        <path d="M10 2.8 11.6 7l4.3 1.5-4.3 1.6L10 14.2 8.4 10 4.1 8.5 8.4 7 10 2.8Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.45" />
      </svg>
    );
  }

  if (type === "settings") {
    return (
      <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 20 20" width="20">
        <path d="M10 12.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Zm6-2.8 1.2-1-1.2-2-1.5.5a6 6 0 0 0-1.1-.6L13.1 5H6.9l-.3 1.9c-.4.2-.8.4-1.1.6L4 7 2.8 9 4 10l-.2 1.2-1 1.2L4 14.4l1.5-.5c.3.2.7.4 1.1.6l.3 1.9h6.2l.3-1.9c.4-.2.8-.4 1.1-.6l1.5.5 1.2-2-1-1.2L16 10Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.25" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 20 20" width="20">
      <path d="M4 5.5h12M4 10h12M4 14.5h8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.7" />
    </svg>
  );
}

function DashboardRail({
  mode,
  onModeChange,
}: {
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
}) {
  return (
    <nav className={styles.dashboardRail}>
      <div aria-hidden="true" className={styles.dashboardRailMenu}>
        <RailIcon type="menu" />
      </div>

      <div className={styles.dashboardRailItems}>
        <button
          aria-current={mode === "content" ? "page" : undefined}
          className={styles.dashboardRailItem}
          data-active={mode === "content"}
          onClick={() => onModeChange("content")}
          type="button"
        >
          <RailIcon type="content" />
          <span>{copy.dashboard.content}</span>
        </button>
        <button
          aria-current={mode === "design" ? "page" : undefined}
          className={styles.dashboardRailItem}
          data-active={mode === "design"}
          onClick={() => onModeChange("design")}
          type="button"
        >
          <RailIcon type="design" />
          <span>Design</span>
        </button>
        <button
          aria-disabled="true"
          className={styles.dashboardRailItem}
          disabled
          type="button"
        >
          <RailIcon type="enhance" />
          <span>Enhance</span>
        </button>
        <button
          aria-disabled="true"
          className={styles.dashboardRailItem}
          disabled
          type="button"
        >
          <RailIcon type="settings" />
          <span>Settings</span>
        </button>
      </div>
    </nav>
  );
}

export function LinkManager({ initialLinks, profile }: LinkManagerProps) {
  const router = useRouter();
  const initialAppearance = normalizeAppearance(profile.appearance);
  const [linkState, setLinkState] = useState<LinkState>(() => {
    const sortedLinks = sortLinks(initialLinks);
    return { current: sortedLinks, safe: sortedLinks };
  });
  const [dashboardMode, setDashboardMode] =
    useState<DashboardMode>("content");
  const [editingLinkId, setEditingLinkId] = useState<number | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [pendingPanel, setPendingPanel] = useState<PendingPanelState | null>(
    null,
  );
  const [panelMessage, setPanelMessage] = useState<PanelMessageState | null>(
    null,
  );
  const [isSavingAppearance, setIsSavingAppearance] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [appearanceFeedback, setAppearanceFeedback] =
    useState<FeedbackMessage | null>(null);
  const [appearanceDraft, setAppearanceDraft] =
    useState<ProfileAppearance>(initialAppearance);
  const [appearanceSaved, setAppearanceSaved] =
    useState<ProfileAppearance>(initialAppearance);
  const [profileBio, setProfileBio] = useState(profile.bio);
  const [profileSocialHandles, setProfileSocialHandles] = useState(
    profile.socialHandles,
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<OpenPanelState | null>(null);
  const desiredLayoutByLinkRef = useRef(new Map<number, LinkLayout>());
  const layoutInFlightByLinkRef = useRef(new Set<number>());
  const layoutCanonicalByLinkRef = useRef(new Map<number, LinkItem>());
  const isBusy = isMutating || isReordering || pendingPanel !== null;
  const isAppearanceDirty = !areAppearancesEqual(
    appearanceDraft,
    appearanceSaved,
  );
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
    setOpenPanel((current) =>
      current && !sortedLinks.some((link) => link.id === current.linkId)
        ? null
        : current,
    );
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
      setOpenPanel((current) =>
        current && !sortedLinks.some((link) => link.id === current.linkId)
          ? null
          : current,
      );
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

  const clearQueuedInitialLinks = useCallback(() => {
    setReconciliationState({
      initialLinks,
      isBusy: false,
      pendingSnapshot: null,
    });
  }, [initialLinks]);

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

  const persistLatestLayout = useCallback(
    async (linkId: number) => {
      if (layoutInFlightByLinkRef.current.has(linkId)) return;

      layoutInFlightByLinkRef.current.add(linkId);
      setPendingPanel({ linkId, type: "layout" });

      try {
        while (true) {
          const targetLayout = desiredLayoutByLinkRef.current.get(linkId);
          if (!targetLayout) break;

          const result = await updateLinkLayoutAction(linkId, targetLayout);
          const latestLayout = desiredLayoutByLinkRef.current.get(linkId);

          if (result.success) {
            layoutCanonicalByLinkRef.current.set(linkId, result.link);

            if (latestLayout !== targetLayout) {
              continue;
            }

            desiredLayoutByLinkRef.current.delete(linkId);
            applyReturnedLink(result.link);
            clearQueuedInitialLinks();
            setPanelMessage({ linkId, text: result.message });
            router.refresh();
            break;
          }

          if (latestLayout !== targetLayout) {
            continue;
          }

          desiredLayoutByLinkRef.current.delete(linkId);
          const canonicalLink = layoutCanonicalByLinkRef.current.get(linkId);

          if (canonicalLink) {
            applyReturnedLink(canonicalLink);
          }

          clearQueuedInitialLinks();
          setPanelMessage({ linkId, text: result.message });
          break;
        }
      } catch {
        const latestLayout = desiredLayoutByLinkRef.current.get(linkId);

        if (latestLayout) {
          desiredLayoutByLinkRef.current.delete(linkId);
          const canonicalLink = layoutCanonicalByLinkRef.current.get(linkId);

          if (canonicalLink) {
            applyReturnedLink(canonicalLink);
          }

          clearQueuedInitialLinks();
          setPanelMessage({ linkId, text: copy.links.failure.update });
        }
      } finally {
        layoutInFlightByLinkRef.current.delete(linkId);
        setPendingPanel((current) =>
          current?.linkId === linkId && current.type === "layout"
            ? null
            : current,
        );
      }
    },
    [applyReturnedLink, clearQueuedInitialLinks, router],
  );

  const handleLayoutChange = useCallback(
    (linkId: number, layout: LinkLayout) => {
      if (isMutating || isReordering || pendingPanel?.type === "thumbnail") {
        return;
      }

      const currentLink = links.find((link) => link.id === linkId);
      if (!currentLink || currentLink.layout === layout) return;

      if (!layoutCanonicalByLinkRef.current.has(linkId)) {
        layoutCanonicalByLinkRef.current.set(linkId, currentLink);
      }

      desiredLayoutByLinkRef.current.set(linkId, layout);
      setPanelMessage(null);
      setPendingPanel({ linkId, type: "layout" });
      setLinkState((currentState) => ({
        current: sortLinks(
          currentState.current.map((link) =>
            link.id === linkId ? { ...link, layout } : link,
          ),
        ),
        safe: currentState.safe,
      }));
      void persistLatestLayout(linkId);
    },
    [
      isMutating,
      isReordering,
      links,
      pendingPanel?.type,
      persistLatestLayout,
    ],
  );

  const handleThumbnailUpload = useCallback(
    async (linkId: number, file: File) => {
      if (isBusy) return;

      const previousLink = links.find((link) => link.id === linkId);
      if (!previousLink) return;

      const localPreviewUrl = URL.createObjectURL(file);
      setPanelMessage(null);
      setPendingPanel({ linkId, type: "thumbnail" });
      setLinkState((currentState) => ({
        current: sortLinks(
          currentState.current.map((link) =>
            link.id === linkId
              ? { ...link, thumbnailUrl: localPreviewUrl }
              : link,
          ),
        ),
        safe: currentState.safe,
      }));

      try {
        const formData = new FormData();
        formData.set("thumbnail", file);
        const result = await uploadLinkThumbnailAction(linkId, formData);

        if (result.success) {
          applyReturnedLink(result.link);
          setPanelMessage({ linkId, text: result.message });
          router.refresh();
        } else {
          applyReturnedLink(previousLink);
          setPanelMessage({ linkId, text: result.message });
        }
      } catch {
        applyReturnedLink(previousLink);
        setPanelMessage({ linkId, text: copy.links.failure.thumbnail });
      } finally {
        URL.revokeObjectURL(localPreviewUrl);
        setPendingPanel(null);
      }
    },
    [applyReturnedLink, isBusy, links, router],
  );

  const handleThumbnailRemove = useCallback(
    async (linkId: number) => {
      if (isBusy) return;

      const previousLink = links.find((link) => link.id === linkId);
      if (!previousLink || !previousLink.thumbnailUrl) return;

      setPanelMessage(null);
      setPendingPanel({ linkId, type: "thumbnail" });
      setLinkState((currentState) => ({
        current: sortLinks(
          currentState.current.map((link) =>
            link.id === linkId
              ? { ...link, thumbnail_path: null, thumbnailUrl: null }
              : link,
          ),
        ),
        safe: currentState.safe,
      }));

      try {
        const result = await removeLinkThumbnailAction(linkId);

        if (result.success) {
          applyReturnedLink(result.link);
          setPanelMessage({ linkId, text: result.message });
          router.refresh();
        } else {
          applyReturnedLink(previousLink);
          setPanelMessage({ linkId, text: result.message });
        }
      } catch {
        applyReturnedLink(previousLink);
        setPanelMessage({ linkId, text: copy.links.failure.thumbnail });
      } finally {
        setPendingPanel(null);
      }
    },
    [applyReturnedLink, isBusy, links, router],
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
        setOpenPanel((current) =>
          current?.linkId === result.deletedId ? null : current,
        );
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

  const handleAppearanceChange = useCallback((appearance: ProfileAppearance) => {
    setAppearanceDraft(appearance);
    setAppearanceFeedback(null);
  }, []);

  const handleAppearanceSave = useCallback(async () => {
    if (!isAppearanceDirty || isSavingAppearance) return;

    setIsSavingAppearance(true);
    setAppearanceFeedback({ tone: "neutral", text: copy.appearance.saving });

    try {
      const result = await updateProfileAppearanceAction(appearanceDraft);

      if (result.status === "success" && result.appearance) {
        const normalizedAppearance = normalizeAppearance(result.appearance);
        setAppearanceDraft(normalizedAppearance);
        setAppearanceSaved(normalizedAppearance);
        setAppearanceFeedback({ tone: "success", text: result.message });
        router.refresh();
      } else {
        setAppearanceFeedback({ tone: "error", text: result.message });
      }
    } catch {
      setAppearanceFeedback({
        tone: "error",
        text: copy.appearance.failure.update,
      });
    } finally {
      setIsSavingAppearance(false);
    }
  }, [
    appearanceDraft,
    isAppearanceDirty,
    isSavingAppearance,
    router,
  ]);

  return (
    <>
      <DashboardRail mode={dashboardMode} onModeChange={setDashboardMode} />

      <div className={styles.dashboardWorkspace} id="content">
        <section className={styles.dashboardColumns}>
      <div className={styles.editorPane}>
        <div className={styles.editorContent}>
          {dashboardMode === "content" ? (
            <>
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
            onEdit={(linkId) => {
              setEditingLinkId(linkId);
              setPanelMessage(null);
              if (linkId !== null) {
                setOpenPanel((current) =>
                  current?.linkId === linkId ? null : current,
                );
              }
            }}
            onFormPendingChange={setIsMutating}
            onLayoutChange={handleLayoutChange}
            onPanelToggle={(linkId, panel) => {
              setPanelMessage(null);
              setOpenPanel((current) =>
                current?.linkId === linkId && current.panel === panel
                  ? null
                  : { linkId, panel },
              );
            }}
            onThumbnailRemove={handleThumbnailRemove}
            onThumbnailUpload={handleThumbnailUpload}
            openPanel={openPanel}
            panelMessage={panelMessage}
            pendingPanel={pendingPanel}
            onToggle={handleToggle}
            onUpdate={handleFormSuccess}
          />
            </>
          ) : (
            <DesignEditor
              appearance={appearanceDraft}
              avatarUrl={profile.avatarUrl}
              isDirty={isAppearanceDirty}
              isSaving={isSavingAppearance}
              onChange={handleAppearanceChange}
              onSave={handleAppearanceSave}
              status={appearanceFeedback}
              username={profile.username}
            />
          )}
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
        appearance={appearanceDraft}
        avatarUrl={profile.avatarUrl}
        bio={profileBio}
        links={links}
        socialHandles={profileSocialHandles}
        username={profile.username}
      />
        </section>
      </div>
    </>
  );
}
