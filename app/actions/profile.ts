"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { copy } from "@/lib/copy";
import {
  type ProfileAppearance,
  validateAppearanceUpdate,
} from "@/lib/profile/appearance";
import {
  getCurrentProfile,
  ProfileAuthenticationError,
  ProfileLookupError,
  type CurrentProfileResult,
} from "@/lib/profile/get-current-profile";
import {
  getPendingUsername,
  PendingUsernameAuthenticationError,
  PendingUsernameLookupError,
  type PendingUsernameResult,
} from "@/lib/profile/get-pending-username";
import {
  type ProfileActionState,
  type ProfileBioActionState,
  type ProfileDetailsValidationResult,
  validateProfileDetails,
  validateProfileBio,
  validateProfileUsername,
} from "@/lib/profile/validation";
import {
  isSocialPlatform,
  LEGACY_SOCIAL_PLATFORM_CONFIG,
  normalizeSocialLinks,
  normalizeSocialLinksPosition,
  removeSocialLink,
  reorderSocialLinks,
  setSocialLinkEnabled,
  type SocialHandleActionState,
  type SocialLink,
  type SocialLinksPosition,
  type SocialPlatform,
  upsertSocialLink,
  validateSocialHandle,
} from "@/lib/profile/social";
import { createClient } from "@/lib/supabase/server";

export interface AppearanceActionState {
  status: "success" | "error";
  message: string;
  appearance?: ProfileAppearance;
}

interface SocialIconsMutationResult {
  status: "success" | "error";
  message: string;
  socialLinks: SocialLink[];
  socialLinksPosition: SocialLinksPosition;
}

const USERNAME_CONSTRAINTS = [
  "profiles_username_unique",
  "profiles_username_lowercase",
  "profiles_username_length",
  "profiles_username_format",
  "profiles_username_reserved",
] as const;

function isUsernameUnavailableError(error: PostgrestError) {
  if (error.code !== "23505" && error.code !== "23514") {
    return false;
  }

  const errorContext = `${error.message} ${error.details ?? ""}`.toLowerCase();

  return (
    USERNAME_CONSTRAINTS.some((constraint) =>
      errorContext.includes(constraint),
    ) || errorContext.includes("(username)")
  );
}

async function readProfileForAction(): Promise<
  CurrentProfileResult | ProfileActionState
> {
  try {
    return await getCurrentProfile();
  } catch (error) {
    if (error instanceof ProfileAuthenticationError) {
      return {
        status: "error",
        message: copy.onboarding.failure.authentication,
        showUsernameFallback: false,
      };
    }

    if (error instanceof ProfileLookupError) {
      return {
        status: "error",
        message: copy.onboarding.failure.load,
        showUsernameFallback: false,
      };
    }

    return {
      status: "error",
      message: copy.onboarding.failure.create,
      showUsernameFallback: false,
    };
  }
}

async function readPendingUsernameForAction(): Promise<
  PendingUsernameResult | ProfileActionState
> {
  try {
    return await getPendingUsername();
  } catch (error) {
    if (error instanceof PendingUsernameAuthenticationError) {
      return {
        status: "error",
        message: copy.onboarding.failure.authentication,
        showUsernameFallback: false,
      };
    }

    if (error instanceof PendingUsernameLookupError) {
      return {
        status: "error",
        message: copy.onboarding.failure.load,
        showUsernameFallback: false,
      };
    }

    return {
      status: "error",
      message: copy.onboarding.failure.create,
      showUsernameFallback: false,
    };
  }
}

function isActionState(
  value: CurrentProfileResult | PendingUsernameResult | ProfileActionState,
): value is ProfileActionState {
  return "status" in value;
}

async function insertProfile(
  userId: string,
  username: string,
  details: Extract<ProfileDetailsValidationResult, { success: true }>,
) {
  const supabase = await createClient();

  return supabase.from("profiles").insert({
    id: userId,
    username,
    bio: details.bio,
  });
}

async function readProfileAfterRace(error: PostgrestError) {
  if (error.code !== "23505") {
    return null;
  }

  const profileAfterRace = await readProfileForAction();

  if (isActionState(profileAfterRace)) {
    return profileAfterRace;
  }

  if (profileAfterRace.profile) {
    redirect("/dashboard");
  }

  return null;
}

export async function createProfileAction(
  previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  void previousState;

  const current = await readProfileForAction();

  if (isActionState(current)) {
    return current;
  }

  if (current.profile) {
    redirect("/dashboard");
  }

  const pending = await readPendingUsernameForAction();

  if (isActionState(pending)) {
    return pending;
  }

  if (pending.userId !== current.userId) {
    return {
      status: "error",
      message: copy.onboarding.failure.authentication,
      showUsernameFallback: false,
    };
  }

  const fallbackValue = formData.get("username");
  const fallbackWasSubmitted = typeof fallbackValue === "string";
  const showUsernameFallback =
    pending.username === null || fallbackWasSubmitted;
  const profileDetails = validateProfileDetails(formData);

  if (!profileDetails.success) {
    return {
      status: "error",
      message: profileDetails.message,
      showUsernameFallback,
    };
  }

  const fallbackUsername = validateProfileUsername(fallbackValue);
  let username = pending.username;

  if (!username) {
    if (!fallbackUsername.success) {
      return {
        status: "error",
        message: fallbackUsername.message,
        showUsernameFallback: true,
      };
    }

    username = fallbackUsername.username;
  }

  let { error } = await insertProfile(
    current.userId,
    username,
    profileDetails,
  );

  if (!error) {
    redirect("/dashboard");
  }

  const raceState = await readProfileAfterRace(error);

  if (raceState) {
    return raceState;
  }

  if (!isUsernameUnavailableError(error)) {
    return {
      status: "error",
      message: copy.onboarding.failure.create,
      showUsernameFallback,
    };
  }

  if (
    pending.username &&
    fallbackUsername.success &&
    fallbackUsername.username !== pending.username
  ) {
    const fallbackInsert = await insertProfile(
      current.userId,
      fallbackUsername.username,
      profileDetails,
    );

    if (!fallbackInsert.error) {
      redirect("/dashboard");
    }

    error = fallbackInsert.error;
    const fallbackRaceState = await readProfileAfterRace(error);

    if (fallbackRaceState) {
      return fallbackRaceState;
    }

    if (!isUsernameUnavailableError(error)) {
      return {
        status: "error",
        message: copy.onboarding.failure.create,
        showUsernameFallback: true,
      };
    }
  }

  if (isUsernameUnavailableError(error)) {
    return {
      status: "error",
      message: copy.onboarding.failure.usernameUnavailable,
      showUsernameFallback: true,
    };
  }

  return {
    status: "error",
    message: copy.onboarding.failure.create,
    showUsernameFallback,
  };
}

export async function updateProfileBioAction(
  previousState: ProfileBioActionState,
  formData: FormData,
): Promise<ProfileBioActionState> {
  const validatedBio = validateProfileBio(formData.get("bio"));

  if (!validatedBio.success) {
    return {
      status: "error",
      message: validatedBio.message,
      bio: previousState.bio,
    };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || userId.length === 0) {
    return {
      status: "error",
      message: copy.profileDetails.failure.authentication,
      bio: previousState.bio,
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ bio: validatedBio.bio })
    .eq("id", userId)
    .select("username, bio")
    .maybeSingle();

  if (error || !profile) {
    return {
      status: "error",
      message: copy.profileDetails.failure.update,
      bio: previousState.bio,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);

  return {
    status: "success",
    message: copy.profileDetails.success,
    bio: profile.bio,
  };
}

export async function updateSocialIconsAction(
  previousState: SocialHandleActionState,
  formData: FormData,
): Promise<SocialHandleActionState> {
  const platformValue = formData.get("platform");

  if (!isSocialPlatform(platformValue)) {
    return {
      status: "error",
      message: copy.socialProfiles.failure.invalidPlatform,
      socialLinks: previousState.socialLinks,
      socialLinksPosition: previousState.socialLinksPosition,
    };
  }

  const validatedHandle = validateSocialHandle(
    platformValue,
    formData.get("handle"),
  );

  if (!validatedHandle.success) {
    return {
      status: "error",
      message: copy.socialProfiles.failure.invalidHandle,
      socialLinks: previousState.socialLinks,
      socialLinksPosition: previousState.socialLinksPosition,
    };
  }

  const current = await readCurrentSocialIcons(
    previousState.socialLinks,
    previousState.socialLinksPosition,
  );
  if (current.status === "error") return current;
  const currentSocialLinks = normalizeSocialLinks(current.profile.social_links, {
    instagram: current.profile.instagram_handle,
    tiktok: current.profile.tiktok_handle,
    youtube: current.profile.youtube_handle,
  });

  const nextSocialLinks = upsertSocialLink(
    currentSocialLinks,
    platformValue,
    validatedHandle.handle,
  );
  const legacyColumn =
    platformValue in LEGACY_SOCIAL_PLATFORM_CONFIG
      ? LEGACY_SOCIAL_PLATFORM_CONFIG[
          platformValue as keyof typeof LEGACY_SOCIAL_PLATFORM_CONFIG
        ].column
      : null;
  const updatePayload = legacyColumn
    ? {
        social_links: nextSocialLinks,
        [legacyColumn]: validatedHandle.handle,
      }
    : {
        social_links: nextSocialLinks,
      };

  const { data: profile, error } = await current.supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", current.userId)
    .select(
      "username, social_links, social_links_position, instagram_handle, tiktok_handle, youtube_handle",
    )
    .maybeSingle();

  if (error || !profile) {
    return {
      status: "error",
      message: copy.socialProfiles.failure.update,
      socialLinks: previousState.socialLinks,
      socialLinksPosition: previousState.socialLinksPosition,
    };
  }

  const savedSocialLinks = normalizeSocialLinks(profile.social_links, {
    instagram: profile.instagram_handle,
    tiktok: profile.tiktok_handle,
    youtube: profile.youtube_handle,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);

  return {
    status: "success",
    message: copy.socialProfiles.success,
    socialLinks: savedSocialLinks,
    socialLinksPosition: normalizeSocialLinksPosition(
      profile.social_links_position,
    ),
  };
}

async function readCurrentSocialIcons(
  fallbackLinks: SocialLink[],
  fallbackPosition: SocialLinksPosition,
): Promise<
  | {
      status: "success";
      profile: {
        username: string;
        social_links: unknown;
        social_links_position: unknown;
        instagram_handle: string | null;
        tiktok_handle: string | null;
        youtube_handle: string | null;
      };
      supabase: Awaited<ReturnType<typeof createClient>>;
      userId: string;
    }
  | SocialIconsMutationResult
> {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || userId.length === 0) {
    return {
      status: "error",
      message: copy.socialProfiles.failure.authentication,
      socialLinks: fallbackLinks,
      socialLinksPosition: fallbackPosition,
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "username, social_links, social_links_position, instagram_handle, tiktok_handle, youtube_handle",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) {
    return {
      status: "error",
      message: copy.socialProfiles.failure.update,
      socialLinks: fallbackLinks,
      socialLinksPosition: fallbackPosition,
    };
  }

  return {
    status: "success",
    profile,
    supabase,
    userId,
  };
}

export async function deleteSocialIconAction(
  platform: SocialPlatform,
  currentLinks: SocialLink[],
  currentPosition: SocialLinksPosition,
): Promise<SocialIconsMutationResult> {
  if (!isSocialPlatform(platform)) {
    return {
      status: "error",
      message: copy.socialProfiles.failure.invalidPlatform,
      socialLinks: currentLinks,
      socialLinksPosition: currentPosition,
    };
  }

  const current = await readCurrentSocialIcons(currentLinks, currentPosition);
  if (current.status === "error") return current;

  const socialLinks = normalizeSocialLinks(current.profile.social_links, {
    instagram: current.profile.instagram_handle,
    tiktok: current.profile.tiktok_handle,
    youtube: current.profile.youtube_handle,
  });
  const nextSocialLinks = removeSocialLink(socialLinks, platform);
  const legacyColumn =
    platform in LEGACY_SOCIAL_PLATFORM_CONFIG
      ? LEGACY_SOCIAL_PLATFORM_CONFIG[
          platform as keyof typeof LEGACY_SOCIAL_PLATFORM_CONFIG
        ].column
      : null;
  const updatePayload = legacyColumn
    ? { social_links: nextSocialLinks, [legacyColumn]: null }
    : { social_links: nextSocialLinks };

  const { data: profile, error } = await current.supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", current.userId)
    .select(
      "username, social_links, social_links_position, instagram_handle, tiktok_handle, youtube_handle",
    )
    .maybeSingle();

  if (error || !profile) {
    return {
      status: "error",
      message: copy.socialProfiles.failure.update,
      socialLinks: currentLinks,
      socialLinksPosition: currentPosition,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);

  return {
    status: "success",
    message: copy.socialProfiles.success,
    socialLinks: normalizeSocialLinks(profile.social_links, {
      instagram: profile.instagram_handle,
      tiktok: profile.tiktok_handle,
      youtube: profile.youtube_handle,
    }),
    socialLinksPosition: normalizeSocialLinksPosition(
      profile.social_links_position,
    ),
  };
}

export async function updateSocialIconEnabledAction(
  platform: SocialPlatform,
  enabled: boolean,
  currentLinks: SocialLink[],
  currentPosition: SocialLinksPosition,
): Promise<SocialIconsMutationResult> {
  if (!isSocialPlatform(platform)) {
    return {
      status: "error",
      message: copy.socialProfiles.failure.invalidPlatform,
      socialLinks: currentLinks,
      socialLinksPosition: currentPosition,
    };
  }

  const current = await readCurrentSocialIcons(currentLinks, currentPosition);
  if (current.status === "error") return current;

  const socialLinks = normalizeSocialLinks(current.profile.social_links, {
    instagram: current.profile.instagram_handle,
    tiktok: current.profile.tiktok_handle,
    youtube: current.profile.youtube_handle,
  });
  const nextSocialLinks = setSocialLinkEnabled(socialLinks, platform, enabled);
  const { data: profile, error } = await current.supabase
    .from("profiles")
    .update({ social_links: nextSocialLinks })
    .eq("id", current.userId)
    .select(
      "username, social_links, social_links_position, instagram_handle, tiktok_handle, youtube_handle",
    )
    .maybeSingle();

  if (error || !profile) {
    return {
      status: "error",
      message: copy.socialProfiles.failure.update,
      socialLinks: currentLinks,
      socialLinksPosition: currentPosition,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);

  return {
    status: "success",
    message: copy.socialProfiles.success,
    socialLinks: normalizeSocialLinks(profile.social_links, {
      instagram: profile.instagram_handle,
      tiktok: profile.tiktok_handle,
      youtube: profile.youtube_handle,
    }),
    socialLinksPosition: normalizeSocialLinksPosition(
      profile.social_links_position,
    ),
  };
}

export async function reorderSocialIconsAction(
  orderedPlatforms: SocialPlatform[],
  currentLinks: SocialLink[],
  currentPosition: SocialLinksPosition,
): Promise<SocialIconsMutationResult> {
  if (
    !Array.isArray(orderedPlatforms) ||
    orderedPlatforms.some((platform) => !isSocialPlatform(platform))
  ) {
    return {
      status: "error",
      message: copy.socialProfiles.failure.invalidPlatform,
      socialLinks: currentLinks,
      socialLinksPosition: currentPosition,
    };
  }

  const current = await readCurrentSocialIcons(currentLinks, currentPosition);
  if (current.status === "error") return current;

  const socialLinks = normalizeSocialLinks(current.profile.social_links, {
    instagram: current.profile.instagram_handle,
    tiktok: current.profile.tiktok_handle,
    youtube: current.profile.youtube_handle,
  });
  const nextSocialLinks = reorderSocialLinks(socialLinks, orderedPlatforms);
  const { data: profile, error } = await current.supabase
    .from("profiles")
    .update({ social_links: nextSocialLinks })
    .eq("id", current.userId)
    .select(
      "username, social_links, social_links_position, instagram_handle, tiktok_handle, youtube_handle",
    )
    .maybeSingle();

  if (error || !profile) {
    return {
      status: "error",
      message: copy.socialProfiles.failure.update,
      socialLinks: currentLinks,
      socialLinksPosition: currentPosition,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);

  return {
    status: "success",
    message: copy.socialProfiles.success,
    socialLinks: normalizeSocialLinks(profile.social_links, {
      instagram: profile.instagram_handle,
      tiktok: profile.tiktok_handle,
      youtube: profile.youtube_handle,
    }),
    socialLinksPosition: normalizeSocialLinksPosition(
      profile.social_links_position,
    ),
  };
}

export async function updateSocialIconsPositionAction(
  position: SocialLinksPosition,
) {
  const normalizedPosition = normalizeSocialLinksPosition(position);
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || userId.length === 0) {
    return {
      status: "error" as const,
      message: copy.socialProfiles.failure.authentication,
      socialLinksPosition: normalizedPosition,
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ social_links_position: normalizedPosition })
    .eq("id", userId)
    .select("username, social_links_position")
    .maybeSingle();

  if (error || !profile) {
    return {
      status: "error" as const,
      message: copy.socialProfiles.failure.update,
      socialLinksPosition: normalizedPosition,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);

  return {
    status: "success" as const,
    message: copy.socialProfiles.success,
    socialLinksPosition: normalizeSocialLinksPosition(
      profile.social_links_position,
    ),
  };
}

export async function updateProfileAppearanceAction(
  appearanceInput: unknown,
): Promise<AppearanceActionState> {
  const validatedAppearance = validateAppearanceUpdate(appearanceInput);

  if (!validatedAppearance.success || !validatedAppearance.appearance) {
    return {
      status: "error",
      message: copy.appearance.failure.invalid,
    };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || userId.length === 0) {
    return {
      status: "error",
      message: copy.appearance.failure.authentication,
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ appearance: validatedAppearance.appearance })
    .eq("id", userId)
    .select("username, appearance")
    .maybeSingle();

  if (error || !profile) {
    return {
      status: "error",
      message: copy.appearance.failure.update,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);

  return {
    status: "success",
    message: copy.appearance.saved,
    appearance: validatedAppearance.appearance,
  };
}
