import {
  data,
  Form,
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
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
import type { Route } from "./+types/forgot-password";

const forgotPasswordLimiter = createRateLimiter({ windowMs: 60_000, max: 5 });

export const loader = (_args: Route.LoaderArgs) => {
  const csrfToken = generateCsrfToken();
  const headers = new Headers();
  setCsrfCookie(headers, csrfToken);
  return data({ csrfToken }, { headers });
};

export async function action({ request }: Route.ActionArgs) {
  const limit = forgotPasswordLimiter(request);
  if (!limit.allowed) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: getRateLimitHeaders(limit),
    });
  }

  const formData = await request.formData();
  validateCsrf(request, formData);

  const { supabase } = createSupabaseServerClient(request);

  const email = formData.get("email") as string;
  const url = new URL(request.url);

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${url.origin}/auth/reset-password`,
  });

  if (error) {
    return data({ error: error.message, success: false }, { status: 400 });
  }

  return data({ error: null, success: true });
}

export const ErrorBoundary = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
        <CardDescription>An error occurred. Please try again.</CardDescription>
      </CardHeader>
      <CardFooter>
        <a
          href="/auth/forgot-password"
          className="text-primary hover:underline"
        >
          Try again
        </a>
      </CardFooter>
    </Card>
  );
};

export default function ForgotPassword() {
  const { csrfToken } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a link to reset your password.
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
          {actionData?.success && (
            <div className="rounded-md bg-accent/10 p-3 text-sm text-accent-foreground">
              Check your email for a password reset link.
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
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
          <Link
            to="/auth/login"
            className="text-sm text-muted-foreground hover:underline"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </Form>
    </Card>
  );
}
