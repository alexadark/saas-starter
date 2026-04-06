import { data, Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
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
import { generateCsrfToken, setCsrfCookie, validateCsrf } from "~/lib/server";
import { createSupabaseServerClient } from "~/lib/supabase/server";
import type { Route } from "./+types/reset-password";

const resetSchema = z.object({
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function loader({ request }: Route.LoaderArgs) {
	const { supabase, headers } = createSupabaseServerClient(request);
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return redirect("/auth/forgot-password", { headers });
	}

	const csrfToken = generateCsrfToken();
	setCsrfCookie(headers, csrfToken);
	return data({ csrfToken }, { headers });
}

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData();
	validateCsrf(request, formData);

	const raw = Object.fromEntries(formData.entries());
	const parsed = resetSchema.safeParse(raw);
	if (!parsed.success) {
		const errors: Record<string, string[]> = {};
		for (const issue of parsed.error.issues) {
			const field = issue.path.join(".") || "_form";
			if (!errors[field]) errors[field] = [];
			errors[field].push(issue.message);
		}
		return data({ error: null, fieldErrors: errors }, { status: 400 });
	}
	const { password } = parsed.data;

	const { supabase, headers } = createSupabaseServerClient(request);

	const { error } = await supabase.auth.updateUser({ password });

	if (error) {
		return data({ error: error.message, fieldErrors: null }, { status: 400 });
	}

	return redirect("/dashboard", { headers });
}

export default function ResetPassword() {
	const loaderData = useLoaderData<typeof loader>();
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Reset password</CardTitle>
				<CardDescription>Enter your new password below.</CardDescription>
			</CardHeader>
			<Form method="post">
				<CardContent className="space-y-4">
					<input type="hidden" name="_csrf" value={loaderData?.csrfToken ?? ""} />
					{actionData?.error && (
						<div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
							{actionData.error}
						</div>
					)}
					<div className="space-y-2">
						<Label htmlFor="password">New password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							required
							minLength={8}
							autoComplete="new-password"
						/>
						{actionData?.fieldErrors?.password && (
							<p className="text-sm text-destructive">{actionData.fieldErrors.password[0]}</p>
						)}
					</div>
				</CardContent>
				<CardFooter>
					<Button type="submit" className="w-full" disabled={isSubmitting}>
						{isSubmitting ? "Updating..." : "Update password"}
					</Button>
				</CardFooter>
			</Form>
		</Card>
	);
}
