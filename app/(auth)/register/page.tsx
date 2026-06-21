import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterWizard } from "@/components/auth/register-wizard";
import { copy } from "@/lib/copy";
import { createClient } from "@/lib/supabase/server";

interface RegisterPageProps {
  searchParams: Promise<{ notice?: string | string[] }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const notice =
    params.notice === "verification-expired"
      ? copy.auth.register.verificationExpired
      : "";

  return (
    <AuthCard
      alternateHref="/login"
      alternateLink={copy.auth.register.alternateLink}
      alternatePrompt={copy.auth.register.alternatePrompt}
      description={copy.auth.register.description}
      title={copy.auth.register.title}
    >
      <RegisterWizard notice={notice} />
    </AuthCard>
  );
}
