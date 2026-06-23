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
  SOCIAL_PLATFORM_CONFIG,
  type SocialHandleActionState,
  validateSocialHandle,
} from "@/lib/profile/social";
import { createClient } from "@/lib/supabase/server";

export interface AppearanceActionState {
  status: "success" | "error";
  message: string;
  appearance?: ProfileAppearance;
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

export async function updateSocialHandleAction(
  previousState: SocialHandleActionState,
  formData: FormData,
): Promise<SocialHandleActionState> {
  const platformValue = formData.get("platform");

  if (!isSocialPlatform(platformValue)) {
    return {
      status: "error",
      message: copy.socialProfiles.failure.invalidPlatform,
      socialHandles: previousState.socialHandles,
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
      socialHandles: previousState.socialHandles,
    };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || userId.length === 0) {
    return {
      status: "error",
      message: copy.socialProfiles.failure.authentication,
      socialHandles: previousState.socialHandles,
    };
  }

  const column = SOCIAL_PLATFORM_CONFIG[platformValue].column;
  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ [column]: validatedHandle.handle })
    .eq("id", userId)
    .select(
      "username, instagram_handle, tiktok_handle, youtube_handle",
    )
    .maybeSingle();

  if (error || !profile) {
    return {
      status: "error",
      message: copy.socialProfiles.failure.update,
      socialHandles: previousState.socialHandles,
    };
  }

  const socialHandles = {
    instagram: profile.instagram_handle,
    tiktok: profile.tiktok_handle,
    youtube: profile.youtube_handle,
  };

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);

  return {
    status: "success",
    message: copy.socialProfiles.success,
    socialHandles,
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
