import Link from "next/link";

import { copy } from "@/lib/copy";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--color-page)] px-6 py-16">
      <section className="surface-panel w-full max-w-md p-8 text-center sm:p-10">
        <div
          aria-hidden="true"
          className="mx-auto grid size-16 place-items-center rounded-2xl bg-[var(--color-accent-soft)] text-xl font-bold text-[var(--color-accent-strong)]"
        >
          404
        </div>
        <h1 className="mt-7 text-3xl font-bold tracking-[-0.04em] text-[var(--color-text)]">
          {copy.notFound.title}
        </h1>
        <p className="mt-3 leading-7 text-[var(--color-muted)]">
          {copy.notFound.description}
        </p>
        <Link
          className="button-primary mt-7 px-5 py-3 text-sm"
          href="/"
        >
          {copy.notFound.home}
        </Link>
      </section>
    </main>
  );
}
