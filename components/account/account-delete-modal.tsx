"use client";

import { copy } from "@/lib/copy";
import { useCallback, useEffect, useRef } from "react";

import styles from "./account.module.css";

interface AccountDeleteModalProps {
  onClose: () => void;
}

export function AccountDeleteModal({ onClose }: AccountDeleteModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  // Focus the close button on mount
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className={styles.deleteOverlay}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
    >
      <div className={styles.deleteModal}>
        <div className={styles.deleteModalHeader}>
          <h2 className={styles.deleteModalTitle} id="delete-account-title">
            {copy.account.deleteAccount}
          </h2>
          <button
            className={styles.deleteModalClose}
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
            aria-label="Close"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="18"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="18"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className={styles.deleteModalBody}>
          {copy.account.deletionNotAvailable}
        </p>

        <div className={styles.deleteModalActions}>
          <button
            className="button-secondary"
            onClick={onClose}
            type="button"
          >
            {copy.account.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
