import { Link } from "react-router";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";

export default function VerifyEmail() {
	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Check your email</CardTitle>
				<CardDescription>
					We've sent you a verification link. Please check your email to confirm your account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-muted-foreground">
					Didn't receive the email? Check your spam folder or try signing up again.
				</p>
			</CardContent>
			<CardFooter>
				<Link to="/auth/login" className="text-sm text-primary hover:underline">
					Back to sign in
				</Link>
			</CardFooter>
		</Card>
	);
}
