import Link from "next/link";

import { copy } from "@/lib/copy";

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-16">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
        <div
          aria-hidden="true"
          className="mx-auto grid size-16 place-items-center rounded-2xl bg-slate-950 text-xl font-bold text-orange-400"
        >
          404
        </div>
        <h1 className="mt-7 text-3xl font-semibold tracking-tight text-slate-950">
          {copy.notFound.title}
        </h1>
        <p className="mt-3 leading-7 text-slate-600">
          {copy.notFound.description}
        </p>
        <Link
          className="mt-7 inline-flex rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200 motion-reduce:transition-none"
          href="/"
        >
          {copy.notFound.home}
        </Link>
      </section>
    </main>
  );
}
