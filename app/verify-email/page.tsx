import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthVisual } from "@/components/auth/auth-visual";
import { OtpVerificationForm } from "@/components/auth/otp-verification-form";
import {
  getPendingResendSeconds,
  readPendingSignupEmail,
} from "@/lib/auth/pending-signup";
import { copy } from "@/lib/copy";

export default async function VerifyEmailPage() {
  const email = await readPendingSignupEmail();

  if (!email) {
    redirect("/register?notice=verification-expired");
  }

  const initialResendSeconds = await getPendingResendSeconds();

  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-[minmax(31rem,0.9fr)_minmax(34rem,1.1fr)]">
      <section className="flex min-h-dvh px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
        <div className="mx-auto flex w-full max-w-lg flex-col">
          <Link
            className="w-fit text-sm font-extrabold tracking-[-0.02em] text-[var(--color-text)]"
            href="/"
          >
            {copy.metadata.title}
          </Link>

          <div className="my-auto py-12">
            <p className="text-sm font-bold text-[var(--color-accent-strong)]">
              {copy.auth.otp.eyebrow}
            </p>
            <h1 className="mt-4 text-balance text-4xl font-bold tracking-[-0.045em] text-[var(--color-text)] sm:text-5xl">
              {copy.auth.otp.title}
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-[var(--color-muted)]">
              {copy.auth.otp.description}
            </p>
            <div className="mt-10">
              <OtpVerificationForm
                initialResendSeconds={initialResendSeconds}
              />
            </div>
          </div>

          <p className="text-xs text-[var(--color-muted)]">
            {copy.metadata.description}
          </p>
        </div>
      </section>

      <AuthVisual />
    </main>
  );
}
