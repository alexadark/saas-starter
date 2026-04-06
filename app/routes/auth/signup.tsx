import {
  data,
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { z } from "zod/v4";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  createRateLimiter,
  generateCsrfToken,
  getRateLimitHeaders,
  setCsrfCookie,
  validateCsrf,
} from "~/lib/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import type { Route } from "./+types/signup";

const signupSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signupLimiter = createRateLimiter({ windowMs: 60_000, max: 5 });

export const loader = (_args: Route.LoaderArgs) => {
  const csrfToken = generateCsrfToken();
  const headers = new Headers();
  setCsrfCookie(headers, csrfToken);
  return data({ csrfToken }, { headers });
};

export async function action({ request }: Route.ActionArgs) {
  const limit = signupLimiter(request);
  if (!limit.allowed) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: getRateLimitHeaders(limit),
    });
  }

  const formData = await request.formData();
  validateCsrf(request, formData);

  const raw = Object.fromEntries(formData.entries());
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".") || "_form";
      if (!errors[field]) errors[field] = [];
      errors[field].push(issue.message);
    }
    return data({ error: null, fieldErrors: errors }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const { supabase, headers } = createSupabaseServerClient(request);

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
    },
  });

  if (error) {
    return data({ error: error.message, fieldErrors: null }, { status: 400 });
  }

  return redirect("/auth/verify-email", { headers });
}

export const ErrorBoundary = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>An error occurred. Please try again.</CardDescription>
      </CardHeader>
      <CardFooter>
        <a href="/auth/signup" className="text-primary hover:underline">
          Try again
        </a>
      </CardFooter>
    </Card>
  );
};

export default function Signup() {
  const { csrfToken } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Enter your details to create a new account.
        </CardDescription>
      </CardHeader>
      <Form method="post">
        <CardContent className="space-y-4">
          <input type="hidden" name="_csrf" value={csrfToken} />
          {actionData?.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {actionData.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
            {actionData?.fieldErrors?.email && (
              <p className="text-sm text-destructive">
                {actionData.fieldErrors.email[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            {actionData?.fieldErrors?.password && (
              <p className="text-sm text-destructive">
                {actionData.fieldErrors.password[0]}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Form>
    </Card>
  );
}
