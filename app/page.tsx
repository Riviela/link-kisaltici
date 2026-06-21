import Link from "next/link";

import { copy } from "@/lib/copy";

export default function Home() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[var(--color-page)] px-5 py-6 sm:px-8 lg:px-10">
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 shadow-[0_10px_30px_rgba(62,54,120,0.06)] sm:px-5">
        <Link className="font-extrabold tracking-[-0.025em]" href="/">
          {copy.metadata.title}
        </Link>
        <div className="flex items-center gap-3">
          <Link
            className="button-quiet min-h-10 rounded-full px-4 text-sm"
            href="/login"
          >
            {copy.navigation.login}
          </Link>
          <Link
            className="button-primary min-h-10 rounded-full px-4 text-sm"
            href="/register"
          >
            {copy.navigation.register}
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100dvh-7rem)] max-w-7xl items-center gap-14 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.82fr)] lg:py-20">
        <div>
          <p className="text-sm font-bold text-[var(--color-accent-strong)]">
            {copy.home.eyebrow}
          </p>
          <h1 className="mt-5 max-w-3xl text-balance text-5xl font-bold tracking-[-0.065em] text-[var(--color-text)] sm:text-7xl">
            {copy.home.title}
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[var(--color-muted)]">
            {copy.home.description}
          </p>
          <Link
            className="button-primary mt-9 rounded-full px-7 py-3.5"
            href="/register"
          >
            {copy.navigation.register}
          </Link>
        </div>

        <div aria-hidden="true" className="relative mx-auto w-full max-w-lg">
          <div className="absolute -left-8 top-12 h-40 w-40 rounded-[2.75rem] bg-[#d8d3ff]" />
          <div className="absolute -right-10 bottom-16 size-52 rounded-full bg-[#b7afff] opacity-80" />
          <div className="relative mx-auto w-[82%] rotate-[2deg] rounded-[2.75rem] border border-white bg-white p-7 shadow-[0_35px_90px_rgba(62,54,120,0.2)]">
            <div className="grid size-20 place-items-center rounded-[1.75rem] bg-[var(--color-accent-soft)] text-2xl font-bold text-[var(--color-accent-strong)]">
              C
            </div>
            <div className="mt-5 h-5 w-36 rounded-full bg-[#28262f]" />
            <div className="mt-3 h-3 w-24 rounded-full bg-[#d7d8df]" />
            <div className="mt-9 space-y-3">
              <div className="h-16 rounded-2xl bg-[#f0efff]" />
              <div className="h-16 rounded-2xl bg-[#f0efff]" />
              <div className="h-16 rounded-2xl bg-[#f0efff]" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
