import { redirect } from "next/navigation";
import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import { AccountDeleteModalTrigger } from "@/components/account/account-delete-modal-trigger";
import { AccountDropdown } from "@/components/dashboard/account-dropdown";
import { copy } from "@/lib/copy";
import {
  getCurrentProfile,
  ProfileAuthenticationError,
  ProfileLookupError,
  type CurrentProfileResult,
} from "@/lib/profile/get-current-profile";
import { createClient } from "@/lib/supabase/server";

import accountStyles from "@/components/account/account.module.css";
import dashboardStyles from "@/components/dashboard/dashboard-interactions.module.css";

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

  // Get user email from auth session
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const userEmail = userData?.user?.email ?? "";

  const profileUrl = `${process.env.NEXT_PUBLIC_PROFILE_HOST ?? "localhost:3000"}/${current.profile.username}`;

  return (
    <main className={accountStyles.page}>
      <header className={accountStyles.topBar}>
        <AccountDropdown
          avatarUrl={current.profile.avatarUrl}
          profileUrl={profileUrl}
          username={current.profile.username}
        />
        <form action={logoutAction}>
          <button
            className={dashboardStyles.dashboardLogout}
            type="submit"
          >
            {copy.dashboard.logout}
          </button>
        </form>
      </header>

      <div className={accountStyles.shell}>
        <h1 className={accountStyles.title}>{copy.account.title}</h1>

        {/* My information */}
        <section className={accountStyles.section}>
          <h2 className={accountStyles.sectionTitle}>
            {copy.account.myInformation}
          </h2>
          <div className={accountStyles.card}>
            <div className={accountStyles.cardBody}>
              <div className={accountStyles.fieldRow}>
                <span className={accountStyles.fieldLabel}>
                  {copy.account.nameLabel}
                </span>
                <input
                  className={accountStyles.fieldInput}
                  defaultValue={current.profile.username}
                  disabled
                  title={copy.account.nameDisabledHint}
                  type="text"
                />
              </div>
              <div className={accountStyles.fieldRow}>
                <span className={accountStyles.fieldLabel}>
                  {copy.account.emailLabel}
                </span>
                <input
                  className={accountStyles.fieldInput}
                  defaultValue={userEmail}
                  disabled
                  readOnly
                  type="email"
                />
              </div>
            </div>
            <div
              style={{
                borderTop: "1px solid var(--color-border)",
                padding: "0.6rem 1.25rem 1rem",
              }}
            >
              <button
                className="button-secondary"
                disabled
                style={{ fontSize: "0.85rem", minHeight: "2.4rem", padding: "0 1.15rem" }}
                type="button"
              >
                {copy.account.saveDetails}
              </button>
            </div>
          </div>
        </section>

        {/* Security and privacy */}
        <section className={accountStyles.section}>
          <h2 className={accountStyles.sectionTitle}>
            {copy.account.securityAndPrivacy}
          </h2>

          {/* Multi-Factor Authentication */}
          <div className={accountStyles.card} style={{ marginBottom: "0.75rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                margin: 0,
                padding: "1.25rem 1.25rem 0",
              }}
            >
              {copy.account.multiFactorAuthentication}
            </h3>
            <div className={accountStyles.securityRow}>
              <div className={accountStyles.securityRowInfo}>
                <span className={accountStyles.securityRowLabel}>
                  {copy.account.sms}
                </span>
              </div>
              <button
                className={accountStyles.enableButton}
                disabled
                type="button"
                title={copy.account.enableMfaHint}
              >
                {copy.account.enable}
              </button>
            </div>
            <div className={accountStyles.securityRow}>
              <div className={accountStyles.securityRowInfo}>
                <span className={accountStyles.securityRowLabel}>
                  {copy.account.authenticatorApp}
                </span>
              </div>
              <button
                className={accountStyles.enableButton}
                disabled
                type="button"
                title={copy.account.enableMfaHint}
              >
                {copy.account.enable}
              </button>
            </div>
          </div>

          {/* Trusted devices */}
          <div className={accountStyles.card} style={{ marginBottom: "0.75rem" }}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                margin: 0,
                padding: "1.25rem 1.25rem 0",
              }}
            >
              {copy.account.trustedDevices}
            </h3>
            <p
              style={{
                color: "var(--color-muted)",
                fontSize: "0.85rem",
                lineHeight: 1.45,
                margin: 0,
                padding: "0.5rem 1.25rem 0",
              }}
            >
              {copy.account.trustedDevicesDescription}
            </p>
            <p className={accountStyles.emptyState}>
              {copy.account.noTrustedDevices}
            </p>
          </div>

          {/* Privacy settings */}
          <div className={accountStyles.card} style={{ marginBottom: "0.75rem" }}>
            <div className={accountStyles.privacyRow}>
              <div className={accountStyles.securityRowInfo}>
                <span className={accountStyles.securityRowLabel}>
                  {copy.account.allowDataSharing}
                </span>
              </div>
              <div className={accountStyles.privacyStatus}>
                <span className={accountStyles.privacyDot} />
                {copy.account.dataSharingEnabled}
              </div>
              <button
                className={accountStyles.disableButton}
                disabled
                type="button"
                title={copy.account.privacyComingSoon}
              >
                {copy.account.disable}
              </button>
            </div>
          </div>

          {/* Password */}
          <div className={accountStyles.card}>
            <div className={accountStyles.passwordSection}>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  margin: "0 0 0.35rem",
                }}
              >
                {copy.account.password}
              </h3>
              <p className={accountStyles.passwordText}>
                {copy.account.passwordDescription}
              </p>
              <button
                className={accountStyles.passwordButton}
                disabled
                type="button"
                title={copy.account.passwordComingSoon}
              >
                {copy.account.createPassword}
              </button>
            </div>
          </div>
        </section>

        {/* Account management */}
        <section className={accountStyles.section}>
          <h2 className={accountStyles.sectionTitle}>
            {copy.account.accountManagement}
          </h2>

          <div className={accountStyles.card}>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                margin: 0,
                padding: "1.25rem 1.25rem 0",
              }}
            >
              {copy.account.profilesYouOwn}
            </h3>

            <div className={accountStyles.profileCard}>
              {current.profile.avatarUrl ? (
                <div className={accountStyles.profileAvatar}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    className="size-full object-cover"
                    src={current.profile.avatarUrl}
                  />
                </div>
              ) : (
                <div className={accountStyles.profileAvatarFallback}>
                  <svg
                    fill="none"
                    height="48%"
                    viewBox="0 0 48 48"
                    width="48%"
                  >
                    <circle
                      cx="24"
                      cy="17"
                      fill="currentColor"
                      opacity="0.72"
                      r="8"
                    />
                    <path
                      d="M10.5 40c.7-8 6-12.5 13.5-12.5S36.8 32 37.5 40"
                      fill="currentColor"
                      opacity="0.72"
                    />
                  </svg>
                </div>
              )}
              <div className={accountStyles.profileInfo}>
                <span className={accountStyles.profileUsername}>
                  @{current.profile.username}
                </span>
                <div className={accountStyles.profileMeta}>
                  <span className={accountStyles.profilePlan}>
                    {copy.accountDropdown.freePlan}
                  </span>
                  <span>{userEmail}</span>
                  <span className={accountStyles.ownerBadge}>
                    {copy.account.owner}
                  </span>
                </div>
              </div>
            </div>

            <div className={accountStyles.upgradePanel}>
              <p className={accountStyles.upgradeText}>
                {copy.account.upgradeToProInvite}
              </p>
              <Link
                className={accountStyles.upgradeLink}
                href="/pricing"
              >
                {copy.account.upgradeToPro}
              </Link>
            </div>

            <div className={accountStyles.deletionSection}>
              <h4 className={accountStyles.deletionTitle}>
                {copy.account.manageAccountDeletion}
              </h4>
              <p className={accountStyles.deletionText}>
                {copy.account.deletionNotAvailable}
              </p>
              <AccountDeleteModalTrigger />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
