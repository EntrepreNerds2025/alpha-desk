import { z } from "zod";

const clientEnvSchema = z.object({
  VITE_PUBLIC_API_BASE_URL: z.string().url().optional(),
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  VITE_SENTRY_DSN: z.string().url().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

let cachedEnv: ClientEnv | null = null;

export function getClientEnv() {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = clientEnvSchema.safeParse(import.meta.env);
  if (!parsed.success) {
    cachedEnv = {};
    return cachedEnv;
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function getClientEnvStatus() {
  const env = getClientEnv();

  return {
    apiBaseConfigured: Boolean(env.VITE_PUBLIC_API_BASE_URL),
    supabaseConfigured: Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY),
    sentryConfigured: Boolean(env.VITE_SENTRY_DSN),
  };
}
