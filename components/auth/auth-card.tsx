import Link from "next/link";
import type { ReactNode } from "react";

import { AuthVisual } from "@/components/auth/auth-visual";
import { copy } from "@/lib/copy";

interface AuthCardProps {
  title: string;
  description: string;
  alternatePrompt: string;
  alternateLink: string;
  alternateHref: "/login" | "/register";
  children: ReactNode;
}

export function AuthCard({
  title,
  description,
  alternatePrompt,
  alternateLink,
  alternateHref,
  children,
}: AuthCardProps) {
  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-[minmax(31rem,0.9fr)_minmax(34rem,1.1fr)]">
      <section className="flex min-h-dvh px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
        <div className="mx-auto flex w-full max-w-md flex-col">
          <Link
            className="w-fit text-sm font-extrabold tracking-[-0.02em] text-[var(--color-text)]"
            href="/"
          >
            {copy.metadata.title}
          </Link>

          <div className="my-auto py-14">
            <h1 className="text-balance text-4xl font-bold tracking-[-0.045em] text-[var(--color-text)] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-sm text-base leading-7 text-[var(--color-muted)]">
              {description}
            </p>
            <div className="mt-10">{children}</div>
            <p className="mt-8 text-center text-sm text-[var(--color-muted)]">
              {alternatePrompt}{" "}
              <Link
                className="font-bold text-[var(--color-accent-strong)] hover:underline"
                href={alternateHref}
              >
                {alternateLink}
              </Link>
            </p>
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
