import Link from "next/link";

import { copy } from "@/lib/copy";

export default function AuthErrorPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--color-page)] px-6 py-12">
      <section className="surface-panel w-full max-w-md p-8 text-center sm:p-10">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-[var(--color-accent-soft)] text-xl font-bold text-[var(--color-accent-strong)]">
          !
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-[var(--color-text)]">
          {copy.auth.error.title}
        </h1>
        <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
          {copy.auth.error.description}
        </p>
        <Link
          className="button-primary mt-7 rounded-full px-5 py-3 text-sm"
          href="/register"
        >
          {copy.auth.error.backToRegister}
        </Link>
      </section>
    </main>
  );
}
