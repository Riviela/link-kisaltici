"use client";

import { useRef } from "react";

import styles from "./dashboard-interactions.module.css";
import type { LinkLayout } from "@/lib/links/layout";
import type { LinkItem } from "@/lib/links/types";

export const LINK_PANEL_TYPES = [
  "layout",
  "thumbnail",
  "prioritize",
  "rules",
  "schedule",
  "lock",
  "insights",
] as const;

export type LinkPanelType = (typeof LINK_PANEL_TYPES)[number];

export const LINK_PANEL_LABELS: Record<LinkPanelType, string> = {
  layout: "Layout",
  thumbnail: "Thumbnail",
  prioritize: "Prioritize",
  rules: "Rules",
  schedule: "Schedule",
  lock: "Lock",
  insights: "Insights",
};

const LINK_PANEL_TITLES: Record<LinkPanelType, string> = {
  ...LINK_PANEL_LABELS,
  thumbnail: "Add Thumbnail",
  lock: "",
};

interface LinkCardPanelsProps {
  activePanel: LinkPanelType | null;
  isLayoutPending: boolean;
  isThumbnailPending: boolean;
  link: LinkItem;
  message: string | null;
  onClose: () => void;
  onLayoutChange: (layout: LinkLayout) => void;
  onThumbnailRemove: () => void;
  onThumbnailUpload: (file: File) => void;
}

function RadioMark({ selected = false }: { selected?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.panelRadio} ${selected ? styles.panelRadioSelected : ""}`}
    />
  );
}

function UpgradeButton({ children = "Upgrade now" }: { children?: string }) {
  return (
    <button
      aria-disabled="true"
      className={styles.panelUpgradeButton}
      disabled
      type="button"
    >
      <span aria-hidden="true">&#9889;</span>
      {children}
    </button>
  );
}

function LayoutPanel({
  isPending,
  link,
  message,
  onLayoutChange,
}: {
  isPending: boolean;
  link: LinkItem;
  message: string | null;
  onLayoutChange: (layout: LinkLayout) => void;
}) {
  const isClassic = link.layout === "classic";

  return (
    <div className={styles.panelBody}>
      <p className={styles.panelDescription}>Choose a layout for your link.</p>
      <button
        aria-pressed={isClassic}
        className={`${styles.layoutChoice} ${isClassic ? styles.layoutChoiceSelected : ""}`}
        disabled={isPending || isClassic}
        onClick={() => onLayoutChange("classic")}
        type="button"
      >
        <RadioMark selected={isClassic} />
        <div className="min-w-0 flex-1">
          <p className={styles.panelOptionTitle}>Classic</p>
          <p className={styles.panelOptionDescription}>Efficient, direct and compact.</p>
          <div className={styles.classicPreview}>
            <span className={styles.classicPreviewAvatar} />
            <span className={styles.classicPreviewLine} />
            <span aria-hidden="true">...</span>
          </div>
        </div>
      </button>

      <button
        aria-pressed={!isClassic}
        className={`${styles.layoutChoice} ${!isClassic ? styles.layoutChoiceSelected : ""}`}
        disabled={isPending || !isClassic}
        onClick={() => onLayoutChange("featured")}
        type="button"
      >
        <RadioMark selected={!isClassic} />
        <div className="min-w-0 flex-1">
          <p className={styles.panelOptionTitle}>Featured</p>
          <p className={styles.panelOptionDescription}>
            Make your link stand out with a larger, more attractive display.
          </p>
          <div className={styles.panelOutlinePreview}>
            <span aria-hidden="true">&#9638;</span>
            {link.thumbnailUrl ? "Thumbnail added" : "Add thumbnail"}
          </div>
          <div aria-hidden="true" className={styles.featuredPlaceholder}>
            {link.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="" src={link.thumbnailUrl} />
            ) : (
              <span>Preview image</span>
            )}
          </div>
        </div>
      </button>
      {message ? <p className={styles.panelStatus}>{message}</p> : null}
    </div>
  );
}

function ThumbnailPanel({
  isPending,
  link,
  message,
  onThumbnailRemove,
  onThumbnailUpload,
}: {
  isPending: boolean;
  link: LinkItem;
  message: string | null;
  onThumbnailRemove: () => void;
  onThumbnailUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasThumbnail = Boolean(link.thumbnailUrl);

  return (
    <div className={`${styles.panelBody} text-center`}>
      <p className={styles.panelDescription}>Add a thumbnail or icon to this link.</p>
      {hasThumbnail ? (
        <div className={styles.thumbnailPreview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={link.thumbnailUrl ?? ""} />
        </div>
      ) : null}
      <input
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        disabled={isPending}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = "";
          if (file) onThumbnailUpload(file);
        }}
        ref={inputRef}
        type="file"
      />
      <button
        className={styles.panelPrimaryButton}
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {isPending ? "Uploading..." : hasThumbnail ? "Replace thumbnail" : "Set thumbnail"}
      </button>
      {hasThumbnail ? (
        <button
          className={styles.panelSecondaryButton}
          disabled={isPending}
          onClick={onThumbnailRemove}
          type="button"
        >
          Remove thumbnail
        </button>
      ) : null}
      {message ? <p className={styles.panelStatus}>{message}</p> : null}
    </div>
  );
}

function PrioritizePanel() {
  return (
    <div className={styles.panelBody}>
      <p className={styles.panelDescription}>
        Draw attention or redirect traffic to your most important link. Only one link can be prioritized at a time.
      </p>
      <div className={styles.panelOptionList}>
        <div className={styles.panelOptionRow}>
          <RadioMark />
          <div className="min-w-0 flex-1">
            <p className={styles.panelOptionTitle}>Animate</p>
            <p className={styles.panelOptionDescription}>Apply a fun and engaging motion effect to this link.</p>
          </div>
          <span aria-hidden="true" className={styles.premiumDot}>&#9889;</span>
        </div>
        <div className={styles.panelOptionRow}>
          <RadioMark />
          <div className="min-w-0 flex-1">
            <p className={styles.panelOptionTitle}>Redirect</p>
            <p className={styles.panelOptionDescription}>
              Temporarily send visitors directly to this destination instead of your public profile.
            </p>
          </div>
          <span aria-hidden="true" className={styles.premiumDot}>&#9889;</span>
        </div>
        <div className={styles.panelOptionRow}>
          <RadioMark selected />
          <p className={styles.panelOptionTitle}>Don&apos;t prioritize this link</p>
        </div>
      </div>
      <div className={styles.panelCtaArea}>
        <p>Upgrade to prioritize this link.</p>
        <UpgradeButton />
      </div>
    </div>
  );
}

function RulesPanel() {
  return (
    <div className={styles.panelBody}>
      <p className={styles.panelDescription}>
        Change visibility or details based on who is visiting your page.
      </p>
      <div aria-disabled="true" className={styles.ruleBuilder}>
        <div className={styles.ruleLine}>
          <strong>If</strong>
          <span>Location</span>
          <span>is</span>
          <span>Select locations</span>
        </div>
        <div className={styles.ruleLine}>
          <strong>Then</strong>
          <span>Hide link</span>
        </div>
      </div>
      <div className={styles.panelCtaArea}>
        <p>Upgrade to configure your first rule.</p>
        <UpgradeButton />
      </div>
    </div>
  );
}

function SchedulePanel() {
  return (
    <div className={`${styles.panelBody} text-center`}>
      <p className={styles.panelDescription}>
        Schedule when your links and notifications go live.
      </p>
      <div aria-disabled="true" className={styles.scheduleField}>
        <span>Start date</span>
        <span>Not configured</span>
      </div>
      <UpgradeButton />
    </div>
  );
}

const lockOptions = [
  "Subscribe",
  "Code",
  "Password",
  "Date of birth",
  "Sensitive content",
  "NFT contract address",
];

function LockPanel() {
  return (
    <div className={styles.panelBody}>
      <h4 className={styles.lockTitle}>
        <span aria-hidden="true">&#128274;</span>
        Lock this link
      </h4>
      <p className={styles.panelOptionDescription}>
        Visitors can only access this link by fulfilling certain criteria.
      </p>
      <p className="mt-6 text-sm font-bold text-[var(--color-text)]">Link locked with:</p>
      <div className={styles.lockList}>
        {lockOptions.map((option) => (
          <div className={styles.lockRow} key={option}>
            <span aria-hidden="true" className={styles.lockCheckbox} />
            <span>{option}</span>
            {option === "Code" || option === "Password" ? (
              <span className={styles.upgradeBadge}>Upgrade</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsPanel() {
  return (
    <div className={styles.panelBody}>
      <div className={styles.insightsTopline}>
        <strong>Date range</strong>
        <div aria-disabled="true" className={styles.dateFilter}>Last 7 days</div>
      </div>
      <div className={styles.insightTabs} role="tablist" aria-label="Insight views">
        <span aria-selected="true" role="tab">Clicks</span>
        <span aria-disabled="true" role="tab">Traffic sources</span>
        <span aria-disabled="true" role="tab">Locations</span>
      </div>
      <p className="mt-8 text-sm font-semibold text-[var(--color-text)]">Clicks</p>
      <div className={styles.insightsTable}>
        <div className={styles.insightsHeader}><span>Click type</span><span>Lifetime</span><span>Last 7 days</span></div>
        <div><span>Total</span><strong>0</strong><strong>0</strong></div>
        <div><span>On your profile</span><strong>0</strong><strong>0</strong></div>
        <div><span>Via shared link</span><strong>0</strong><strong>0</strong></div>
      </div>
      <div className={styles.insightsCta}>
        <div>
          <strong>Turn insights into more clicks</strong>
          <p>Understand how your audience engages over time.</p>
        </div>
        <button aria-disabled="true" disabled type="button">Upgrade</button>
      </div>
    </div>
  );
}

function PanelContent({
  isLayoutPending,
  isThumbnailPending,
  link,
  message,
  onLayoutChange,
  onThumbnailRemove,
  onThumbnailUpload,
  panel,
}: LinkCardPanelsProps & { panel: LinkPanelType }) {
  if (panel === "layout") {
    return (
      <LayoutPanel
        isPending={isLayoutPending}
        link={link}
        message={message}
        onLayoutChange={onLayoutChange}
      />
    );
  }

  if (panel === "thumbnail") {
    return (
      <ThumbnailPanel
        isPending={isThumbnailPending}
        link={link}
        message={message}
        onThumbnailRemove={onThumbnailRemove}
        onThumbnailUpload={onThumbnailUpload}
      />
    );
  }

  if (panel === "prioritize") return <PrioritizePanel />;
  if (panel === "rules") return <RulesPanel />;
  if (panel === "schedule") return <SchedulePanel />;
  if (panel === "lock") return <LockPanel />;
  return <InsightsPanel />;
}

export function LinkPanelIcon({ panel }: { panel: LinkPanelType }) {
  const common = {
    "aria-hidden": true,
    fill: "none",
    height: 18,
    viewBox: "0 0 20 20",
    width: 18,
  } as const;

  if (panel === "layout") return <svg {...common}><path d="M3.5 4h5v12h-5V4Zm8 0h5v5h-5V4Zm0 8h5v4h-5v-4Z" stroke="currentColor" strokeWidth="1.4" /></svg>;
  if (panel === "thumbnail") return <svg {...common}><rect height="12" rx="1" stroke="currentColor" strokeWidth="1.4" width="14" x="3" y="4" /><circle cx="7" cy="8" r="1.2" fill="currentColor" /><path d="m5 14 3.5-3 2.5 2 2-1.5 2 2.5" stroke="currentColor" strokeWidth="1.3" /></svg>;
  if (panel === "prioritize") return <svg {...common}><path d="m10 3 2 4 4.5.6-3.2 3.1.8 4.5-4.1-2.1-4.1 2.1.8-4.5-3.2-3.1L8 7l2-4Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.3" /></svg>;
  if (panel === "rules") return <svg {...common}><path d="M10 3v4m0 0L5 11m5-4 5 4M5 11v5m10-5v5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" /><circle cx="10" cy="3" r="1" fill="currentColor" /><circle cx="5" cy="16" r="1" fill="currentColor" /><circle cx="15" cy="16" r="1" fill="currentColor" /></svg>;
  if (panel === "schedule") return <svg {...common}><rect height="12" rx="2" stroke="currentColor" strokeWidth="1.4" width="14" x="3" y="5" /><path d="M6 3v4m8-4v4M3 9h14m-4 3v2l1.5 1" stroke="currentColor" strokeLinecap="round" strokeWidth="1.3" /></svg>;
  if (panel === "lock") return <svg {...common}><rect height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" width="12" x="4" y="8" /><path d="M7 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.4" /></svg>;
  return <svg {...common}><path d="M4 16V11m4 5V7m4 9V9m4 7V4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></svg>;
}

export function LinkCardPanels(props: LinkCardPanelsProps) {
  const { activePanel, onClose } = props;

  if (!activePanel) return null;

  return (
    <div className={styles.panelStack}>
      <div className={styles.panelTransition} data-open="true">
        <div className={styles.panelTransitionInner}>
          <div className={styles.panelHeader}>
            <span>{LINK_PANEL_TITLES[activePanel]}</span>
            <button
              aria-label={`Close ${LINK_PANEL_LABELS[activePanel]} panel`}
              className={styles.panelCloseButton}
              onClick={onClose}
              type="button"
            >
              <svg aria-hidden="true" fill="none" height="16" viewBox="0 0 16 16" width="16"><path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" /></svg>
            </button>
          </div>
          <PanelContent {...props} panel={activePanel} />
        </div>
      </div>
    </div>
  );
}
