import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountDeleteModalTrigger } from "@/components/account/account-delete-modal-trigger";
import { AccountSidebar } from "@/components/account/account-sidebar";
import { copy } from "@/lib/copy";
import {
  getCurrentProfile,
  ProfileAuthenticationError,
  ProfileLookupError,
  type CurrentProfileResult,
} from "@/lib/profile/get-current-profile";
import { createClient } from "@/lib/supabase/server";

import styles from "@/components/account/account.module.css";

function BrandMark() {
  return (
    <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 24 24" width="18">
      <path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
    </svg>
  );
}

function UpgradeIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="14">
      <path d="m13 2-9 12h8l-1 8 9-12h-8l1-8Z" />
    </svg>
  );
}

function MethodIcon({ type }: { type: "authenticator" | "sms" }) {
  return (
    <span className={`${styles.methodIcon} ${type === "sms" ? styles.methodIconSms : styles.methodIconAuthenticator}`}>
      {type === "sms" ? (
        <svg aria-hidden="true" fill="none" height="19" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24" width="19">
          <rect height="19" rx="2" width="11" x="6.5" y="2.5" />
          <path d="M10 5h4M11 18h2" />
        </svg>
      ) : (
        <svg aria-hidden="true" fill="none" height="19" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="19">
          <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 14h2v7h-7v-2M6 6h1M17 6h1M6 17h1" />
        </svg>
      )}
    </span>
  );
}

function PrivacyIcon() {
  return (
    <span className={styles.privacyIcon}>
      <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 24 24" width="18">
        <path d="M12 3 5 6v5c0 4.7 2.8 8.4 7 10 4.2-1.6 7-5.3 7-10V6l-7-3Z" />
      </svg>
    </span>
  );
}

function MoreIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
      <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

function ProfileAvatar({ avatarUrl, username }: { avatarUrl: string | null; username: string }) {
  if (avatarUrl) {
    return (
      <div className={styles.profileAvatar}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={`@${username}`} className={styles.profileAvatarImage} src={avatarUrl} />
      </div>
    );
  }

  return (
    <div className={styles.profileAvatarFallback}>
      <svg aria-hidden="true" fill="none" height="58%" viewBox="0 0 48 48" width="58%">
        <circle cx="24" cy="17" fill="currentColor" opacity="0.72" r="8" />
        <path d="M10.5 40c.7-8 6-12.5 13.5-12.5S36.8 32 37.5 40" fill="currentColor" opacity="0.72" />
      </svg>
    </div>
  );
}

export default async function AccountPage() {
  let current: CurrentProfileResult;

  try {
    current = await getCurrentProfile();
  } catch (error) {
    if (error instanceof ProfileAuthenticationError) {
      redirect("/login");
    }

    if (error instanceof ProfileLookupError) {
      throw new Error(copy.onboarding.failure.load);
    }

    throw error;
  }

  if (!current.profile) {
    redirect("/onboarding");
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userEmail = userData?.user?.email ?? "";
  const profileUrl = `${process.env.NEXT_PUBLIC_PROFILE_HOST ?? "localhost:3000"}/${current.profile.username}`;

  return (
    <main className={styles.page}>
      <header className={styles.announcementBar}>
        <Link aria-label={copy.account.myLinktree} className={styles.brandMark} href="/dashboard">
          <BrandMark />
        </Link>
        <div className={styles.announcementContent}>
          <span>{copy.account.announcement}</span>
          <Link className={styles.announcementUpgrade} href="/pricing">
            <UpgradeIcon />
            {copy.account.upgrade}
          </Link>
        </div>
      </header>

      <div className={styles.appFrame}>
        <AccountSidebar
          avatarUrl={current.profile.avatarUrl}
          profileUrl={profileUrl}
          username={current.profile.username}
        />

        <div className={styles.mainColumn}>
          <header className={styles.pageHeader}>
            <h1>{copy.account.title}</h1>
          </header>

          <div className={styles.pageBody}>
            <div className={styles.settingsColumn}>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{copy.account.myInformation}</h2>
                <div className={`${styles.card} ${styles.informationCard}`}>
                  <label className={styles.informationField}>
                    <span>{copy.account.nameLabel}</span>
                    <input
                      defaultValue={current.profile.username}
                      disabled
                      title={copy.account.nameDisabledHint}
                      type="text"
                    />
                  </label>
                  <label className={styles.informationField}>
                    <span>{copy.account.emailLabel}</span>
                    <input defaultValue={userEmail} disabled readOnly type="email" />
                  </label>
                  <button className={styles.saveButton} disabled type="button">
                    {copy.account.saveDetails}
                  </button>
                </div>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{copy.account.securityAndPrivacy}</h2>

                <div className={`${styles.card} ${styles.securityCard}`}>
                  <div className={styles.securityIntro}>
                    <h3>{copy.account.multiFactorAuthentication}</h3>
                    <p>{copy.account.multiFactorDescription}</p>
                  </div>

                  <div className={styles.securityMethods}>
                    <div className={styles.securityMethod}>
                      <MethodIcon type="sms" />
                      <div>
                        <strong>{copy.account.sms}</strong>
                        <span>{copy.account.smsDescription}</span>
                      </div>
                      <button disabled title={copy.account.enableMfaHint} type="button">
                        {copy.account.enable}
                      </button>
                    </div>
                    <div className={styles.securityMethod}>
                      <MethodIcon type="authenticator" />
                      <div>
                        <strong>{copy.account.authenticatorApp}</strong>
                        <span>{copy.account.authenticatorDescription}</span>
                      </div>
                      <button disabled title={copy.account.enableMfaHint} type="button">
                        {copy.account.enable}
                      </button>
                    </div>
                  </div>

                  <div className={styles.trustedDevices}>
                    <h3>{copy.account.trustedDevices}</h3>
                    <p>{copy.account.trustedDevicesDescription}</p>
                    <div className={styles.trustedDevicesEmpty}>{copy.account.noTrustedDevices}</div>
                  </div>
                </div>

                <div className={`${styles.card} ${styles.privacyCard}`}>
                  <h3>{copy.account.privacySettings}</h3>
                  <p>{copy.account.privacyDescription}</p>
                  <div className={styles.privacyRow}>
                    <PrivacyIcon />
                    <div>
                      <strong>{copy.account.allowDataSharing}</strong>
                      <span>{copy.account.dataSharingEnabled}</span>
                    </div>
                    <button disabled title={copy.account.privacyComingSoon} type="button">
                      {copy.account.disable}
                    </button>
                  </div>
                </div>

                <div className={`${styles.card} ${styles.passwordCard}`}>
                  <h3>{copy.account.password}</h3>
                  <p>{copy.account.passwordDescription}</p>
                  <button disabled title={copy.account.passwordComingSoon} type="button">
                    {copy.account.createPassword}
                  </button>
                </div>
              </section>

              <section className={`${styles.section} ${styles.accountManagementSection}`}>
                <h2 className={styles.sectionTitle}>{copy.account.accountManagement}</h2>
                <h3 className={styles.sectionSubtitle}>{copy.account.profilesYouOwn}</h3>

                <div className={`${styles.card} ${styles.ownedProfileCard}`}>
                  <div className={styles.ownerAvatarColumn}>
                    <ProfileAvatar avatarUrl={current.profile.avatarUrl} username={current.profile.username} />
                  </div>
                  <div className={styles.ownerHeader}>
                    <strong>@{current.profile.username}</strong>
                    <span aria-hidden="true"><MoreIcon /></span>
                  </div>
                  <div className={styles.ownerDetailsRow}>
                    <span>{copy.account.plan}</span>
                    <strong>{copy.accountDropdown.freePlan}</strong>
                  </div>
                  <div className={styles.ownerDetailsRow}>
                    <span className={styles.ownerLabel}>{copy.account.admins}</span>
                    <div className={styles.ownerAdminRow}>
                      <span>{userEmail}</span>
                      <strong>{copy.account.owner}</strong>
                    </div>
                  </div>
                  <div className={styles.upgradePanel}>
                    <p>{copy.account.upgradeToProInvite}</p>
                    <Link className={styles.upgradeLink} href="/pricing">
                      <UpgradeIcon />
                      {copy.account.upgradeToPro}
                    </Link>
                  </div>
                </div>

                <div className={`${styles.card} ${styles.deletionCard}`}>
                  <h3>{copy.account.manageAccountDeletion}</h3>
                  <p>{copy.account.deletionDescription}</p>
                  <AccountDeleteModalTrigger />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
