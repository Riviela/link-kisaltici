import { copy } from "@/lib/copy";

export function AuthVisual() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden min-h-dvh overflow-hidden bg-[var(--color-accent)] lg:block"
    >
      <div className="absolute -left-20 top-[9%] h-64 w-[62%] rotate-[-8deg] rounded-[3.5rem] bg-[var(--color-accent-soft)]" />
      <div className="absolute -right-16 -top-14 size-72 rounded-full bg-[var(--color-lime)] opacity-80" />
      <div className="absolute bottom-[-12%] right-[-8%] size-[30rem] rounded-full bg-[var(--color-accent-strong)]" />
      <div className="absolute bottom-[12%] left-[7%] h-40 w-56 rotate-[9deg] rounded-[2.5rem] border border-white/30 bg-white/[0.12] backdrop-blur-sm" />

      <div className="absolute left-1/2 top-1/2 w-[min(72%,30rem)] -translate-x-1/2 -translate-y-1/2 rotate-[2deg] rounded-[2.75rem] border border-white/55 bg-white/[0.94] p-7 shadow-[0_35px_90px_rgba(34,27,102,0.28)]">
        <div className="flex items-center gap-4">
          <div className="grid size-16 place-items-center rounded-[1.4rem] bg-[var(--color-accent-soft)] text-xl font-bold text-[var(--color-accent-strong)]">
            C
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--color-text)]">
              {copy.auth.visual.title}
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {copy.auth.visual.username}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-[var(--color-accent-soft)] px-5 py-4 text-sm font-bold text-[var(--color-text)]">
            <span>{copy.auth.visual.firstLink}</span>
            <svg
              fill="none"
              height="14"
              viewBox="0 0 14 14"
              width="14"
            >
              <path
                d="M3 11 11 3M5 3h6v6"
                stroke="var(--color-accent)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            </svg>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-[var(--color-accent-soft)] px-5 py-4 text-sm font-bold text-[var(--color-text)]">
            <span>{copy.auth.visual.secondLink}</span>
            <svg
              fill="none"
              height="14"
              viewBox="0 0 14 14"
              width="14"
            >
              <path
                d="M3 11 11 3M5 3h6v6"
                stroke="var(--color-accent)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
              />
            </svg>
          </div>
          <div className="h-14 rounded-2xl border border-dashed border-[var(--color-accent)] bg-[var(--color-surface)]" />
        </div>
      </div>

      <div className="absolute bottom-[8%] right-[9%] h-28 w-44 rotate-[-7deg] rounded-[2rem] bg-[var(--color-accent-soft)] shadow-[0_24px_50px_rgba(34,27,102,0.2)]" />
    </aside>
  );
}
