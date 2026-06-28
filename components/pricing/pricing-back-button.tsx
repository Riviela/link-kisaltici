"use client";

import { useRouter } from "next/navigation";

import { copy } from "@/lib/copy";

import styles from "@/app/pricing/pricing.module.css";

export function PricingBackButton() {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/dashboard");
  }

  return (
    <button
      aria-label={copy.pricing.back}
      className={`${styles.backButton} button-quiet`}
      onClick={handleBack}
      type="button"
    >
      <svg
        aria-hidden="true"
        fill="none"
        height="20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="20"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
