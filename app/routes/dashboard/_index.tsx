import { Form, redirect, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import type { Route } from "./+types/_index";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = createSupabaseServerClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login", { headers });
  }

  return { email: user.email };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = createSupabaseServerClient(request);

  await supabase.auth.signOut();

  return redirect("/auth/login", { headers });
}

export default function Dashboard() {
  const { email } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold">SaaS Starter</h1>
          <Form method="post">
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </Form>
        </div>
      </header>
      <main className="container mx-auto flex-1 px-4 py-8">
        <h2 className="text-2xl font-bold">Welcome, {email}</h2>
        <p className="mt-2 text-muted-foreground">
          This is your dashboard. Start building your application here.
        </p>
      </main>
    </div>
  );
}
