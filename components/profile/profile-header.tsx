interface ProfileHeaderProps {
  username: string;
  displayName: string;
  bio: string | null;
}

export function ProfileHeader({
  username,
  displayName,
  bio,
}: ProfileHeaderProps) {
  const monogram = displayName.trim().charAt(0).toUpperCase();

  return (
    <header className="text-center">
      <div
        aria-hidden="true"
        className="mx-auto grid size-24 place-items-center rounded-[2rem] bg-[var(--color-accent-soft)] text-3xl font-bold text-[var(--color-accent-strong)] ring-1 ring-[#d8d4ff]"
      >
        {monogram}
      </div>

      <h1 className="mt-7 text-3xl font-bold tracking-[-0.045em] text-[var(--color-text)] sm:text-4xl">
        {displayName}
      </h1>
      <p className="mt-2 text-sm font-semibold text-[var(--color-muted)]">
        @{username}
      </p>

      {bio ? (
        <p className="mx-auto mt-5 max-w-md whitespace-pre-wrap text-pretty text-base leading-7 text-[var(--color-muted)]">
          {bio}
        </p>
      ) : null}
    </header>
  );
}
