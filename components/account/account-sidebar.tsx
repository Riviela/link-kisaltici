import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { AccountDropdown } from "@/components/dashboard/account-dropdown";
import { copy } from "@/lib/copy";

import styles from "./account.module.css";

interface AccountSidebarProps {
  avatarUrl: string | null;
  planLabel: string;
  profileUrl: string;
  username: string;
}

type SidebarIconName =
  | "audience"
  | "bell"
  | "business"
  | "earn"
  | "help"
  | "insights"
  | "instagram"
  | "link"
  | "logout"
  | "planner"
  | "post"
  | "tiles";

function SidebarIcon({ name }: { name: SidebarIconName }) {
  const content = (() => {
    switch (name) {
      case "tiles":
        return <><rect height="5" rx="1" width="5" x="3" y="3" /><rect height="5" rx="1" width="5" x="16" y="3" /><rect height="5" rx="1" width="5" x="3" y="16" /><path d="M18.5 15v7M15 18.5h7" /></>;
      case "earn":
        return <><ellipse cx="9" cy="8" rx="6" ry="3" /><path d="M3 8v4c0 1.7 2.7 3 6 3 1 0 2-.1 2.8-.4" /><ellipse cx="16" cy="15" rx="5" ry="3" /><path d="M11 15v3c0 1.7 2.2 3 5 3s5-1.3 5-3v-3" /></>;
      case "audience":
        return <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c.5-4 2.7-6 6-6s5.5 2 6 6M14 15c3.5-.5 6.2 1.2 7 4.5" /></>;
      case "insights":
        return <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>;
      case "business":
        return <><rect height="14" rx="1.5" width="18" x="3" y="5" /><path d="M7 9h4M7 13h7M17 9h.01" /></>;
      case "planner":
        return <><rect height="17" rx="2" width="18" x="3" y="4" /><path d="M7 2v4M17 2v4M3 9h18M8 13l2 2 5-5" /></>;
      case "instagram":
        return <><path d="M4 5h13a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7l-4 2V8a3 3 0 0 1 1-3Z" /><path d="m8 11 3 3 5-5" /></>;
      case "link":
        return <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" /></>;
      case "post":
        return <><path d="m4 20 8-16 2 7 6 2-16 7Z" /><path d="m12 11 4-4" /></>;
      case "bell":
        return <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>;
      case "help":
        return <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.7 2.7 0 1 1 4.3 2.2c-1.2.8-1.8 1.2-1.8 2.8M12 18h.01" /></>;
      case "logout":
        return <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></>;
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
      strokeWidth="1.6"
      viewBox="0 0 24 24"
      width="18"
    >
      {content}
    </svg>
  );
}

const primaryItems: Array<{
  chevron?: boolean;
  href?: string;
  icon: SidebarIconName;
  label: string;
}> = [
  { href: "/dashboard", icon: "tiles", label: copy.account.myLinktree },
  { chevron: true, icon: "earn", label: copy.account.earn },
  { icon: "audience", label: copy.account.audience },
  { icon: "insights", label: copy.account.insights },
];

const toolItems: Array<{
  badge?: string;
  icon: SidebarIconName;
  label: string;
}> = [
  { badge: copy.account.newBadge, icon: "business", label: copy.account.businessCards },
  { icon: "planner", label: copy.account.socialPlanner },
  { icon: "instagram", label: copy.account.instagramAutoReply },
  { icon: "link", label: copy.account.linkShortener },
  { icon: "post", label: copy.account.postIdeas },
];

function ChevronIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="13" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" width="13">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function AccountSidebar({
  avatarUrl,
  planLabel,
  profileUrl,
  username,
}: AccountSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarProfileRow}>
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
          disabled
          title={copy.account.notificationsUnavailable}
          type="button"
        >
          <SidebarIcon name="bell" />
        </button>
      </div>

      <nav aria-label="Account navigation" className={styles.sidebarNavigation}>
        <div className={styles.sidebarGroup}>
          {primaryItems.map((item) =>
            item.href ? (
              <Link className={styles.sidebarItem} href={item.href} key={item.label}>
                <SidebarIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            ) : (
              <button
                className={styles.sidebarItem}
                disabled
                key={item.label}
                title={copy.account.unavailableNavigation}
                type="button"
              >
                <SidebarIcon name={item.icon} />
                <span>{item.label}</span>
                {item.chevron ? <span className={styles.sidebarChevron}><ChevronIcon /></span> : null}
              </button>
            ),
          )}
        </div>

        <div className={styles.sidebarTools}>
          <p className={styles.sidebarGroupLabel}>{copy.account.tools}</p>
          {toolItems.map((item) => (
            <button
              className={styles.sidebarItem}
              disabled
              key={item.label}
              title={copy.account.unavailableNavigation}
              type="button"
            >
              <SidebarIcon name={item.icon} />
              <span>{item.label}</span>
              {item.badge ? <span className={styles.sidebarBadge}>{item.badge}</span> : null}
            </button>
          ))}
        </div>
      </nav>

      <div className={styles.sidebarBottom}>
        <div className={styles.setupCard}>
          <div className={styles.setupProgress}>{copy.account.setupProgress}</div>
          <strong>{copy.account.setupChecklist}</strong>
          <span>{copy.account.setupComplete}</span>
          <button disabled type="button">{copy.account.finishSetup}</button>
        </div>

        <div className={styles.sidebarUtilities}>
          <button
            aria-label={copy.account.helpUnavailable}
            className={styles.sidebarUtilityButton}
            disabled
            title={copy.account.helpUnavailable}
            type="button"
          >
            <SidebarIcon name="help" />
          </button>
          <form action={logoutAction}>
            <button
              aria-label={copy.accountDropdown.logOut}
              className={styles.sidebarUtilityButton}
              title={copy.accountDropdown.logOut}
              type="submit"
            >
              <SidebarIcon name="logout" />
              <span className={styles.logoutDot} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
