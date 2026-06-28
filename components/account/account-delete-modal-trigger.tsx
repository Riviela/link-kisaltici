"use client";

import { copy } from "@/lib/copy";
import { useCallback, useState } from "react";
import { AccountDeleteModal } from "@/components/account/account-delete-modal";

import styles from "./account.module.css";

export function AccountDeleteModalTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        className={styles.deleteButton}
        onClick={open}
        type="button"
      >
        {copy.account.deleteAccount}
      </button>

      {isOpen ? <AccountDeleteModal onClose={close} /> : null}
    </>
  );
}
