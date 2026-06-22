import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterWizard } from "@/components/auth/register-wizard";
import {
  isValidRegistrationUsername,
  normalizeUsernameInput,
} from "@/lib/auth/register-validation";
import { copy } from "@/lib/copy";
import { createClient } from "@/lib/supabase/server";

interface RegisterPageProps {
  searchParams: Promise<{ username?: string | string[] }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/dashboard");
  }

  const usernameParam = (await searchParams).username;
  const normalizedUsername = normalizeUsernameInput(
    typeof usernameParam === "string" ? usernameParam : "",
  );
  const initialUsername = isValidRegistrationUsername(normalizedUsername)
    ? normalizedUsername
    : "";
  const title = initialUsername
    ? copy.auth.register.titleWithUsername(initialUsername)
    : copy.auth.register.title;

  return (
    <AuthCard
      alternateHref="/login"
      alternateLink={copy.auth.register.alternateLink}
      alternatePrompt={copy.auth.register.alternatePrompt}
      description={copy.auth.register.description}
      title={title}
    >
      <RegisterWizard initialUsername={initialUsername} />
    </AuthCard>
  );
}
