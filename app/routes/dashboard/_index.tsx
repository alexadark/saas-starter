import { data, Form, redirect, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { APP_NAME } from "~/lib/constants";
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

  return data({ email: user.email }, { headers });
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase, headers } = createSupabaseServerClient(request);

  await supabase.auth.signOut();

  return redirect("/auth/login", { headers });
}

export const ErrorBoundary = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">
        An error occurred while loading the dashboard.
      </p>
      <a href="/" className="mt-4 text-primary hover:underline">
        Back to home
      </a>
    </div>
  );
};

export default function Dashboard() {
  const { email } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold">{APP_NAME}</h1>
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
