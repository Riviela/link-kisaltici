"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { copy } from "@/lib/copy";
import {
  getCurrentProfile,
  ProfileAuthenticationError,
  ProfileLookupError,
  type CurrentProfileResult,
} from "@/lib/profile/get-current-profile";
import {
  type ProfileActionState,
  type ProfileVisibilityActionState,
  validateProfileInput,
} from "@/lib/profile/validation";
import { createClient } from "@/lib/supabase/server";

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
      };
    }

    if (error instanceof ProfileLookupError) {
      return {
        status: "error",
        message: copy.onboarding.failure.load,
      };
    }

    return {
      status: "error",
      message: copy.onboarding.failure.create,
    };
  }
}

function isActionState(
  value: CurrentProfileResult | ProfileActionState,
): value is ProfileActionState {
  return "status" in value;
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

  const profileInput = validateProfileInput(formData);

  if (!profileInput.success) {
    return { status: "error", message: profileInput.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").insert({
    id: current.userId,
    username: profileInput.username,
    display_name: profileInput.displayName,
    bio: profileInput.bio,
  });

  if (!error) {
    redirect("/dashboard");
  }

  if (error.code === "23505") {
    const profileAfterRace = await readProfileForAction();

    if (isActionState(profileAfterRace)) {
      return profileAfterRace;
    }

    if (profileAfterRace.profile) {
      redirect("/dashboard");
    }
  }

  if (isUsernameUnavailableError(error)) {
    return {
      status: "error",
      message: copy.onboarding.failure.usernameUnavailable,
    };
  }

  return {
    status: "error",
    message: copy.onboarding.failure.create,
  };
}

export async function updateProfileVisibilityAction(
  previousState: ProfileVisibilityActionState,
  formData: FormData,
): Promise<ProfileVisibilityActionState> {
  const requestedValue = formData.get("isPublished");

  if (requestedValue !== "true" && requestedValue !== "false") {
    return {
      status: "error",
      message: copy.profileVisibility.failure.update,
      isPublished: previousState.isPublished,
    };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string" || userId.length === 0) {
    return {
      status: "error",
      message: copy.profileVisibility.failure.authentication,
      isPublished: previousState.isPublished,
    };
  }

  const isPublished = requestedValue === "true";
  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ is_published: isPublished })
    .eq("id", userId)
    .select("username, is_published")
    .maybeSingle();

  if (error || !profile) {
    return {
      status: "error",
      message: copy.profileVisibility.failure.update,
      isPublished: previousState.isPublished,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/${profile.username}`);

  return {
    status: "success",
    message: profile.is_published
      ? copy.profileVisibility.success.published
      : copy.profileVisibility.success.private,
    isPublished: profile.is_published,
  };
}
