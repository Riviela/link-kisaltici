import type { Metadata } from "next";
import Link from "next/link";

import { PricingBackButton } from "@/components/pricing/pricing-back-button";
import { PricingCard } from "@/components/pricing/pricing-card";
import { APP_NAME } from "@/lib/config/site";
import { copy } from "@/lib/copy";
import { getCurrentPlan } from "@/lib/subscriptions/get-current-plan";

import styles from "./pricing.module.css";

export const metadata: Metadata = {
  title: `Pricing | ${APP_NAME}`,
  description: "Find the Canvas Links plan that fits you.",
};

export default async function PricingPage() {
  const plans = copy.pricing.plans;
  const currentPlan = await getCurrentPlan();

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
        <PricingCard
          isCurrent={currentPlan === "starter"}
          plan={plans.starter}
        />
        <PricingCard
          featured
          isCurrent={currentPlan === "pro"}
          plan={plans.pro}
        />
        <PricingCard
          isCurrent={currentPlan === "premium"}
          plan={plans.premium}
        />
      </section>

      <section className={styles.testimonial} aria-label="Customer testimonial">
        <blockquote className={styles.quote}>
          &quot;Canvas Links Pro brings marketing and commerce into one place. Building
          my brand feels easier.&quot;
        </blockquote>
        <p className={styles.quoteAuthor}>varskidajahles</p>
        <p className={styles.quoteRole}>Pro member</p>
        <div className={styles.quoteControls} aria-hidden="true">
          <span>2 / 5</span>
          <span className={styles.quoteArrow}>
            <svg fill="none" height="20" viewBox="0 0 24 24" width="20">
              <path d="m15 18-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </span>
          <span className={styles.quoteArrow}>
            <svg fill="none" height="20" viewBox="0 0 24 24" width="20">
              <path d="m9 18 6-6-6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </span>
        </div>
      </section>

      <section className={styles.enterprise} aria-label="Agency and enterprise plans">
        <div>
          <h2>Agency or Enterprise</h2>
          <p>Team licenses, SSO, dedicated support and custom contracts</p>
        </div>
        <button className={styles.enterpriseButton} type="button">
          Contact us
          <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </button>
      </section>

      <p className={styles.disclaimer}>
        *Some features shown may not be available to all users. For more information,
        see our <button type="button">feature eligibility article</button>.
      </p>

      <a className={styles.backToTop} href="#pricing-title">
        Back to top
        <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
          <path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </a>

      <footer className={styles.footer}>
        <button className={styles.cookieLink} type="button">
          {copy.pricing.footer.cookiePreferences}
        </button>
      </footer>
    </main>
  );
}
