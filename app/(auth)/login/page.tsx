import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { copy } from "@/lib/copy";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    redirect("/dashboard");
  }

  return (
    <AuthCard
      alternateHref="/register"
      alternateLink={copy.auth.login.alternateLink}
      alternatePrompt={copy.auth.login.alternatePrompt}
      description={copy.auth.login.description}
      title={copy.auth.login.title}
    >
      <LoginForm />
    </AuthCard>
  );
}
