import { z } from "zod/v4";

const serverEnvSchema = z.object({
	DATABASE_URL: z.string().url(),
	SUPABASE_SECRET_KEY: z.string().min(1),
	VITE_SUPABASE_URL: z.string().url(),
	VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
	console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
	throw new Error("Missing or invalid environment variables. Check .env file.");
}

export const env = parsed.data;
