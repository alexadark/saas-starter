import { redirect } from "react-router";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import type { Route } from "./+types/callback";

export async function loader({ request }: Route.LoaderArgs) {
	const { supabase, headers } = createSupabaseServerClient(request);
	const url = new URL(request.url);
	const code = url.searchParams.get("code");

	if (code) {
		await supabase.auth.exchangeCodeForSession(code);
	}

	return redirect("/dashboard", { headers });
}
