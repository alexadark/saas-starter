import { redirect } from "react-router";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import type { Route } from "./+types/callback";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createSupabaseServerClient(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/auth/login", { headers });
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirect("/auth/login?error=invalid_callback", { headers });
  }

  return redirect("/dashboard", { headers });
}
