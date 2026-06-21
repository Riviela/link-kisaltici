import { notFound } from "next/navigation";

import { PublicProfile } from "@/components/profile/public-profile";
import { copy } from "@/lib/copy";
import {
  getPublicProfile,
  PublicProfileLookupError,
} from "@/lib/profile/get-public-profile";
import {
  isValidPublicUsername,
  normalizePublicUsername,
} from "@/lib/profile/public-username";

interface PublicProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const routeParams = await params;
  const username = normalizePublicUsername(routeParams.username);

  if (!isValidPublicUsername(username)) {
    notFound();
  }

  let data;

  try {
    data = await getPublicProfile(username);
  } catch (error) {
    if (error instanceof PublicProfileLookupError) {
      throw new Error(copy.publicProfile.failure.load);
    }

    throw error;
  }

  if (!data) {
    notFound();
  }

  return <PublicProfile data={data} />;
}
