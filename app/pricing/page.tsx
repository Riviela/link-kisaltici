import type { Metadata } from "next";
import Link from "next/link";

import { PricingBackButton } from "@/components/pricing/pricing-back-button";
import { PricingCard } from "@/components/pricing/pricing-card";
import { APP_NAME } from "@/lib/config/site";
import { copy } from "@/lib/copy";

import styles from "./pricing.module.css";

export const metadata: Metadata = {
  title: `Pricing | ${APP_NAME}`,
  description: "Find the Canvas Links plan that fits you.",
};

export default function PricingPage() {
  const plans = copy.pricing.plans;

  return (
    <main className={styles.page}>
      <Link className={styles.brand} href="/" aria-label={`${APP_NAME} home`}>
        {APP_NAME}
      </Link>

      <section className={styles.headerRow} aria-labelledby="pricing-title">
        <PricingBackButton />
        <h1 className={styles.title} id="pricing-title">
          {copy.pricing.title}
        </h1>
        <p className={styles.subtitle}>{copy.pricing.subtitle}</p>
      </section>

      <section className={styles.cards} aria-label="Pricing plans">
        <PricingCard plan={plans.starter} />
        <PricingCard plan={plans.pro} featured />
        <PricingCard plan={plans.premium} />
      </section>

      <footer className={styles.footer}>
        <button className={styles.cookieLink} type="button">
          {copy.pricing.footer.cookiePreferences}
        </button>
      </footer>
    </main>
  );
}
