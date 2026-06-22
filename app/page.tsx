import Link from "next/link";

import { UsernameSignup } from "@/components/home/username-signup";
import { copy } from "@/lib/copy";

import styles from "./landing.module.css";

export default function Home() {
  return (
    <main className={`${styles.page} min-h-dvh overflow-hidden px-5 py-6 sm:px-8 lg:px-10`}>
      <nav className={`${styles.header} mx-auto flex max-w-7xl items-center justify-between border px-4 py-3 sm:px-5`}>
        <Link
          className={`${styles.focusable} ${styles.headerText} font-extrabold tracking-[-0.025em]`}
          href="/"
        >
          {copy.metadata.title}
        </Link>
        <div className="flex items-center gap-3">
          <Link
            className={`${styles.focusable} ${styles.headerLink} button-quiet min-h-10 px-4 text-sm`}
            href="/login"
          >
            {copy.navigation.login}
          </Link>
          <Link
            className={`${styles.focusable} button-landing-signup button-primary min-h-10 px-4 text-sm`}
            href="/register"
          >
            {copy.navigation.register}
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid min-h-[calc(100dvh-7rem)] max-w-7xl items-center gap-14 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.82fr)] lg:py-20">
        <div>
          <p className={`${styles.eyebrow} text-sm font-bold`}>
            {copy.home.eyebrow}
          </p>
          <h1 className={`${styles.heading} mt-5 max-w-3xl text-balance text-5xl font-bold tracking-[-0.065em] sm:text-7xl`}>
            {copy.home.title}
          </h1>
          <p className={`${styles.description} mt-7 max-w-xl text-lg leading-8`}>
            {copy.home.description}
          </p>
          <UsernameSignup />
        </div>

        <div aria-hidden="true" className="relative mx-auto w-full max-w-lg">
          <div className={`${styles.visualSquare} absolute -left-8 top-12 h-40 w-40 rounded-[2.75rem]`} />
          <div className={`${styles.visualCircle} absolute -right-10 bottom-16 size-52 rounded-full`} />
          <div className={`${styles.profileCard} relative mx-auto w-[82%] rotate-[2deg] rounded-[2.75rem] border p-7`}>
            <div className={`${styles.avatarPlaceholder} grid size-20 place-items-center rounded-[1.75rem] text-2xl font-bold`}>
              C
            </div>
            <div className={`${styles.profileTitle} mt-5 h-5 w-36 rounded-full`} />
            <div className={`${styles.profileSubtitle} mt-3 h-3 w-24 rounded-full`} />
            <div className="mt-9 space-y-3">
              <div className={`${styles.profileLink} h-16 rounded-2xl`} />
              <div className={`${styles.profileLink} h-16 rounded-2xl`} />
              <div className={`${styles.profileLink} h-16 rounded-2xl`} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
