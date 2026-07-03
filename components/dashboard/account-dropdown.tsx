"use client";

import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { copy } from "@/lib/copy";
import { useCallback, useEffect, useRef, useState } from "react";

import styles from "./account-dropdown.module.css";

interface AccountDropdownProps {
  avatarUrl: string | null;
  profileUrl: string;
  username: string;
  variant?: "dark" | "rail" | "sidebar";
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="16"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width="16"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="14"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.5"
      viewBox="0 0 18 18"
      width="18"
    >
      <path d="M4 5h10M4 9h10M4 13h10" />
    </svg>
  );
}

export function AccountDropdown({
  avatarUrl,
  profileUrl,
  username,
  variant = "dark",
}: AccountDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        close();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, close]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, close]);

  // Focus first menu item when opened
  useEffect(() => {
    if (!isOpen) return;

    const timer = requestAnimationFrame(() => {
      const firstItem = panelRef.current?.querySelector<HTMLElement>(
        '[role="menuitem"]',
      );
      firstItem?.focus();
    });

    return () => cancelAnimationFrame(timer);
  }, [isOpen]);

  // Handle menu item keyboard navigation
  const handleMenuKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const items = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          '[role="menuitem"]',
        ) ?? [],
      );

      if (items.length === 0) return;

      const currentIndex = items.indexOf(
        document.activeElement as HTMLElement,
      );

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          const nextIndex =
            currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
          items[nextIndex]?.focus();
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          const prevIndex =
            currentIndex <= 0
              ? items.length - 1
              : (currentIndex - 1) % items.length;
          items[prevIndex]?.focus();
          break;
        }
        case "Home": {
          event.preventDefault();
          items[0]?.focus();
          break;
        }
        case "End": {
          event.preventDefault();
          items[items.length - 1]?.focus();
          break;
        }
        case "Tab": {
          close();
          break;
        }
      }
    },
    [close],
  );

  const inertHandler = useCallback(() => {
    // Inert V1 item - no operation
  }, []);

  return (
    <div
      className={`${styles.wrapper} ${
        variant === "sidebar"
          ? styles.wrapperSidebar
          : variant === "rail"
            ? styles.wrapperRail
            : ""
      }`}
    >
      <button
        aria-label={variant === "rail" ? copy.accountDropdown.openMenu : undefined}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={`${styles.trigger} ${
          variant === "sidebar"
            ? styles.triggerSidebar
            : variant === "rail"
              ? styles.triggerRail
              : ""
        }`}
        onClick={toggle}
        ref={triggerRef}
        type="button"
      >
        {variant === "rail" ? (
          <MenuIcon />
        ) : avatarUrl ? (
          <div className={styles.triggerAvatar}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              className="size-full object-cover"
              src={avatarUrl}
            />
          </div>
        ) : (
          <div className={styles.triggerAvatarFallback}>
            <UserIcon />
          </div>
        )}
        {variant !== "rail" ? (
          <>
            <span className={styles.triggerUsername}>
              {variant === "sidebar" ? username : `@${username}`}
            </span>
            <span
              className={`${styles.triggerChevron} ${isOpen ? styles.triggerChevronOpen : ""}`}
            >
              <ChevronDownIcon />
            </span>
          </>
        ) : null}
      </button>

      {isOpen ? (
        <div
          className={`${styles.panel} ${variant === "rail" ? styles.panelRail : ""}`}
          onKeyDown={handleMenuKeyDown}
          ref={panelRef}
          role="menu"
        >
          <div className={styles.accountSummary}>
            {avatarUrl ? (
              <div className={styles.summaryAvatar}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  className="size-full object-cover"
                  src={avatarUrl}
                />
              </div>
            ) : (
              <div className={styles.summaryAvatarFallback}>
                <UserIcon />
              </div>
            )}
            <div className={styles.summaryInfo}>
              <span className={styles.summaryUsername}>@{username}</span>
              <span className={styles.summaryUrl}>{profileUrl}</span>
            </div>
            <span className={styles.planBadge}>
              {copy.accountDropdown.freePlan}
            </span>
          </div>

          <div className={styles.divider} />

          <div className={styles.menuList} ref={menuRef}>
            <button
              aria-label={copy.accountDropdown.inertHint}
              className={styles.menuItem}
              onClick={inertHandler}
              role="menuitem"
              tabIndex={-1}
              type="button"
            >
              <span className={styles.menuItemIcon}>
                <PlusIcon />
              </span>
              <span className={styles.menuItemLabel}>
                {copy.accountDropdown.createNewProfile}
              </span>
            </button>

            <Link
              className={styles.menuItem}
              href="/account"
              role="menuitem"
              tabIndex={-1}
            >
              <span className={styles.menuItemIcon}>
                <SettingsIcon />
              </span>
              <span className={styles.menuItemLabel}>
                {copy.accountDropdown.account}
              </span>
            </Link>

            <Link
              className={styles.menuItem}
              href="/pricing"
              role="menuitem"
              tabIndex={-1}
            >
              <span className={styles.menuItemIcon}>
                <ZapIcon />
              </span>
              <span className={styles.menuItemLabel}>
                {copy.accountDropdown.upgrade}
              </span>
            </Link>
          </div>

          <div className={styles.divider} />

          <div className={styles.menuList}>
            <button
              aria-label={copy.accountDropdown.inertHint}
              className={styles.menuItem}
              onClick={inertHandler}
              role="menuitem"
              tabIndex={-1}
              type="button"
            >
              <span className={styles.menuItemIcon}>
                <HelpIcon />
              </span>
              <span className={styles.menuItemLabel}>
                {copy.accountDropdown.askAQuestion}
              </span>
            </button>

            <button
              aria-label={copy.accountDropdown.inertHint}
              className={styles.menuItem}
              onClick={inertHandler}
              role="menuitem"
              tabIndex={-1}
              type="button"
            >
              <span className={styles.menuItemIcon}>
                <ExternalIcon />
              </span>
              <span className={styles.menuItemLabel}>
                {copy.accountDropdown.helpCenter}
              </span>
            </button>

            <button
              aria-label={copy.accountDropdown.inertHint}
              className={styles.menuItem}
              onClick={inertHandler}
              role="menuitem"
              tabIndex={-1}
              type="button"
            >
              <span className={styles.menuItemIcon}>
                <MessageIcon />
              </span>
              <span className={styles.menuItemLabel}>
                {copy.accountDropdown.shareFeedback}
              </span>
            </button>
          </div>

          <div className={styles.divider} />

          <div className={styles.menuList}>
            <form action={logoutAction}>
              <button
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                role="menuitem"
                tabIndex={-1}
                type="submit"
              >
                <span className={styles.menuItemIcon}>
                  <LogOutIcon />
                </span>
                <span className={styles.menuItemLabel}>
                  {copy.accountDropdown.logOut}
                </span>
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
