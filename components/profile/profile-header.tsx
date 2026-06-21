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
        className="mx-auto grid size-24 place-items-center rounded-[2rem] bg-slate-950 text-3xl font-semibold text-white shadow-[8px_8px_0_0_#ff6b2c]"
      >
        {monogram}
      </div>

      <h1 className="mt-8 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
        {displayName}
      </h1>
      <p className="mt-2 text-sm font-bold tracking-wide text-orange-700">
        @{username}
      </p>

      {bio ? (
        <p className="mx-auto mt-5 max-w-md whitespace-pre-wrap text-pretty text-base leading-7 text-slate-600">
          {bio}
        </p>
      ) : null}
    </header>
  );
}
