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
import { AccountDropdown } from "@/components/dashboard/account-dropdown";
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
    profileUrl: string;
    planLabel: string;
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
type SidebarIconName =
  | "audience"
  | "bell"
  | "business"
  | "earn"
  | "flag"
  | "help"
  | "insights"
  | "instagram"
  | "link"
  | "overview"
  | "planner"
  | "post"
  | "shop"
  | "tiles";

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

function SidebarIcon({ name }: { name: SidebarIconName }) {
  const content = (() => {
    switch (name) {
      case "tiles":
        return <><circle cx="7" cy="7" r="1.6" /><circle cx="17" cy="7" r="1.6" /><circle cx="7" cy="17" r="1.6" /><path d="M17 14v6M14 17h6" /></>;
      case "shop":
        return <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M8 8a4 4 0 0 1 8 0" /></>;
      case "earn":
        return <><ellipse cx="9" cy="8" rx="6" ry="3" /><path d="M3 8v4c0 1.7 2.7 3 6 3 1 0 2-.1 2.8-.4" /><ellipse cx="16" cy="15" rx="5" ry="3" /><path d="M11 15v3c0 1.7 2.2 3 5 3s5-1.3 5-3v-3" /></>;
      case "overview":
        return <><path d="M4 5h16M4 12h16M4 19h16" /><path d="M8 5v14" /></>;
      case "audience":
        return <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c.5-4 2.7-6 6-6s5.5 2 6 6M14 15c3.5-.5 6.2 1.2 7 4.5" /></>;
      case "insights":
        return <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>;
      case "business":
        return <><rect height="13" rx="1.4" width="18" x="3" y="6" /><path d="M7 10h4M7 14h7M17 10h.01" /></>;
      case "planner":
        return <><rect height="17" rx="2" width="18" x="3" y="4" /><path d="M7 2v4M17 2v4M3 9h18M8 14l2 2 5-5" /></>;
      case "instagram":
        return <><path d="M4 6h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H8l-4 3V8a2 2 0 0 1 2-2Z" /><path d="M8 11h8M8 15h5" /></>;
      case "link":
        return <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" /></>;
      case "post":
        return <><path d="m4 20 8-16 2 7 6 2-16 7Z" /><path d="m12 11 4-4M4 4l2 2M18 18l2 2M4 10h3M14 4v3" /></>;
      case "bell":
        return <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>;
      case "help":
        return <><circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.6 2.6 0 1 1 4.1 2.1c-1.1.8-1.7 1.2-1.7 2.7M12 17h.01" /></>;
      case "flag":
        return <><path d="M5 21V4M5 5h10l1 3h4v9h-9l-1-3H5" /><circle cx="18.4" cy="18.3" r="1.9" fill="#ff4358" stroke="none" /></>;
    }
  })();

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.55"
      viewBox="0 0 24 24"
      width="18"
    >
      {content}
    </svg>
  );
}

function ChevronIcon({ open = false }: { open?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={open ? styles.sidebarChevronOpen : undefined}
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
      width="14"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function DashboardSidebar({
  avatarUrl,
  mode,
  onModeChange,
  planLabel,
  profileUrl,
  username,
}: {
  avatarUrl: string | null;
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
  planLabel: string;
  profileUrl: string;
  username: string;
}) {
  const [isCanvasSectionOpen, setIsCanvasSectionOpen] = useState(false);
  const [isEarnSectionOpen, setIsEarnSectionOpen] = useState(false);
  const inertHandler = useCallback(() => undefined, []);
  const sidebarTools: Array<{
    icon: SidebarIconName;
    isNew?: boolean;
    label: string;
  }> = [
    { icon: "business", isNew: true, label: "Business cards" },
    { icon: "planner", label: "Social planner" },
    { icon: "instagram", label: "Instagram auto-reply" },
    { icon: "link", label: "Link shortener" },
    { icon: "post", label: "Post ideas" },
  ];

  return (
    <aside className={styles.dashboardSidebar}>
      <div className={styles.dashboardSidebarTop}>
        <AccountDropdown
          avatarUrl={avatarUrl}
          planLabel={planLabel}
          profileUrl={profileUrl}
          username={username}
          variant="sidebar"
        />
        <button
          aria-label={copy.account.notificationsUnavailable}
          className={styles.sidebarIconButton}
          onClick={inertHandler}
          type="button"
        >
          <SidebarIcon name="bell" />
        </button>
      </div>

      <nav aria-label="Dashboard navigation" className={styles.sidebarNav}>
        <div className={styles.sidebarGroup}>
          <button
            aria-expanded={isCanvasSectionOpen}
            className={styles.sidebarParentItem}
            onClick={() => setIsCanvasSectionOpen((current) => !current)}
            type="button"
          >
            <span className={styles.sidebarIcon}>
              <SidebarIcon name="tiles" />
            </span>
            <span>My Canvas Links</span>
            <span className={styles.sidebarChevron}>
              <ChevronIcon open={isCanvasSectionOpen} />
            </span>
          </button>

          {isCanvasSectionOpen ? (
            <div className={styles.sidebarSubnav}>
              <button
                aria-current={mode === "content" ? "page" : undefined}
                className={styles.sidebarSubitem}
                data-active={mode === "content"}
                onClick={() => onModeChange("content")}
                type="button"
              >
                Links
              </button>
              <button
                className={styles.sidebarSubitem}
                onClick={inertHandler}
                type="button"
              >
                Shop
              </button>
              <button
                aria-current={mode === "design" ? "page" : undefined}
                className={styles.sidebarSubitem}
                data-active={mode === "design"}
                onClick={() => onModeChange("design")}
                type="button"
              >
                Design
              </button>
            </div>
          ) : null}
        </div>

        <div className={styles.sidebarGroup}>
          <button
            aria-expanded={isEarnSectionOpen}
            className={styles.sidebarParentItem}
            onClick={() => setIsEarnSectionOpen((current) => !current)}
            type="button"
          >
            <span className={styles.sidebarIcon}>
              <SidebarIcon name="earn" />
            </span>
            <span>Earn</span>
            <span className={styles.sidebarChevron}>
              <ChevronIcon open={isEarnSectionOpen} />
            </span>
          </button>

          {isEarnSectionOpen ? (
            <div className={styles.sidebarSubnav}>
              <button
                className={styles.sidebarSubitem}
                data-active="true"
                onClick={inertHandler}
                type="button"
              >
                Overview
              </button>
              <button
                className={`${styles.sidebarSubitem} ${styles.sidebarSubitemSplit}`}
                onClick={inertHandler}
                type="button"
              >
                <span>Earnings</span>
                <span className={styles.sidebarAmountBadge}>$0,00</span>
              </button>
            </div>
          ) : null}
        </div>

        <button
          className={styles.sidebarParentItem}
          onClick={inertHandler}
          type="button"
        >
          <span className={styles.sidebarIcon}>
            <SidebarIcon name="audience" />
          </span>
          <span>Audience</span>
        </button>

        <button
          className={styles.sidebarParentItem}
          onClick={inertHandler}
          type="button"
        >
          <span className={styles.sidebarIcon}>
            <SidebarIcon name="insights" />
          </span>
          <span>Insights</span>
        </button>

        <div className={styles.sidebarTools}>
          <p className={styles.sidebarToolsLabel}>Tools</p>
          {sidebarTools.map(({ icon, isNew = false, label }) => (
            <button
              className={styles.sidebarToolItem}
              key={label}
              onClick={inertHandler}
              type="button"
            >
              <span className={styles.sidebarIcon}>
                <SidebarIcon name={icon} />
              </span>
              <span>{label}</span>
              {isNew ? <span className={styles.sidebarNewBadge}>NEW</span> : null}
            </button>
          ))}
        </div>
      </nav>

      <div className={styles.sidebarFooter}>
        <button
          aria-label={copy.account.helpUnavailable}
          className={styles.sidebarFooterButton}
          onClick={inertHandler}
          type="button"
        >
          <SidebarIcon name="help" />
        </button>
        <button
          aria-label={copy.account.unavailableNavigation}
          className={styles.sidebarFooterButton}
          onClick={inertHandler}
          type="button"
        >
          <SidebarIcon name="flag" />
        </button>
      </div>
    </aside>
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
    async (linkId: number, file: File, validationMessage?: string) => {
      if (isBusy) return;

      const previousLink = links.find((link) => link.id === linkId);
      if (!previousLink) return;

      if (validationMessage) {
        setPanelMessage({ linkId, text: validationMessage });
        return;
      }

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
      <DashboardSidebar
        avatarUrl={profile.avatarUrl}
        mode={dashboardMode}
        onModeChange={setDashboardMode}
        planLabel={profile.planLabel}
        profileUrl={profile.profileUrl}
        username={profile.username}
      />

      <div className={styles.dashboardWorkspace} id="content">
        <section className={styles.dashboardColumns}>
      <div className={styles.editorPane}>
        <div className={styles.editorContent}>
          {dashboardMode === "content" ? (
            <>
              <div className="mb-9 flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <p className="text-base font-semibold text-[var(--color-text)]">Links</p>
                <span className="text-xs font-medium text-[var(--color-muted)]">Content</span>
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
                    ? "text-sm font-medium text-[var(--color-danger)]"
                    : managerStatus.tone === "success"
                      ? "text-sm font-medium text-[var(--color-success)]"
                      : "text-sm font-medium text-[var(--color-muted)]"
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
