import { copy } from "@/lib/copy";

import styles from "@/app/pricing/pricing.module.css";

type PricingPlan = {
  name: string;
  price: string;
  period: string;
  billing: string;
  cta: string;
  intro: string;
  features: readonly string[];
};

type PricingCardProps = {
  isCurrent?: boolean;
  plan: PricingPlan;
  featured?: boolean;
};

function CheckIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="14"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
      width="14"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function PricingCard({
  isCurrent = false,
  plan,
  featured = false,
}: PricingCardProps) {
  const cardClassName = featured
    ? `${styles.card} ${styles.cardFeatured}`
    : styles.card;
  const ctaClassName = [
    styles.cardCta,
    featured ? styles.cardCtaFeatured : styles.cardCtaDefault,
    isCurrent ? styles.cardCtaCurrent : "",
  ].filter(Boolean).join(" ");

  return (
    <article className={cardClassName}>
      <header className={styles.cardTitleBar}>
        <div className={styles.cardHeaderTop}>
          <h2 className={styles.cardName}>{plan.name}</h2>
          {featured ? (
            <span className={styles.recommendedBadge}>
              <svg
                aria-hidden="true"
                className={styles.recommendedStar}
                fill="currentColor"
                height="12"
                viewBox="0 0 24 24"
                width="12"
              >
                <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
              </svg>
              {copy.pricing.recommended}
            </span>
          ) : null}
        </div>
      </header>

      <div className={styles.cardContent}>
        <p className={styles.cardPrice}>
          <span className={styles.cardPriceAmount}>{plan.price}</span>
          <span className={styles.cardPricePeriod}>{plan.period}</span>
        </p>
        <p className={styles.cardBilling}>{plan.billing}</p>
        {isCurrent ? (
          <span className={ctaClassName} aria-current="true">
            {copy.pricing.currentPlan}
          </span>
        ) : (
          <button className={ctaClassName} type="button">
            {plan.cta}
          </button>
        )}

        <div className={styles.cardDivider} />
        <p className={styles.cardIntro}>{plan.intro}</p>
        <ul className={styles.featureList}>
          {plan.features.map((feature) => (
            <li className={styles.featureItem} key={feature}>
              <span
                className={
                  featured
                    ? `${styles.checkMark} ${styles.checkMarkFeatured}`
                    : styles.checkMark
                }
              >
                <CheckIcon className={styles.checkIcon} />
              </span>
              <span className={styles.featureText}>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
