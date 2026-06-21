import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterWizard } from "@/components/auth/register-wizard";
import { copy } from "@/lib/copy";
import { createClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/dashboard");
  }

  return (
    <AuthCard
      alternateHref="/login"
      alternateLink={copy.auth.register.alternateLink}
      alternatePrompt={copy.auth.register.alternatePrompt}
      description={copy.auth.register.description}
      title={copy.auth.register.title}
    >
      <RegisterWizard />
    </AuthCard>
  );
}
