function readEnvValue(key: string) {
  const processValue =
    typeof process !== "undefined" && process?.env ? process.env[key] : undefined;
  const viteValue = (import.meta as ImportMeta & { env?: Record<string, string | undefined> })
    .env?.[key];
  return processValue ?? viteValue;
}

export function getServerEnvStatus() {
  const tradingViewSecret = readEnvValue("TRADINGVIEW_WEBHOOK_SECRET");
  const supabaseServiceRole = readEnvValue("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = readEnvValue("SUPABASE_URL") ?? readEnvValue("VITE_SUPABASE_URL");
  const supabaseAnon = readEnvValue("VITE_SUPABASE_ANON_KEY");
  const sentryDsn = readEnvValue("SENTRY_DSN") ?? readEnvValue("VITE_SENTRY_DSN");
  const upstashUrl = readEnvValue("UPSTASH_REDIS_REST_URL");
  const upstashToken = readEnvValue("UPSTASH_REDIS_REST_TOKEN");

  return {
    tradingviewSecretConfigured: Boolean(tradingViewSecret),
    supabaseUrlConfigured: Boolean(supabaseUrl),
    supabaseAnonConfigured: Boolean(supabaseAnon),
    supabaseServiceRoleConfigured: Boolean(supabaseServiceRole),
    sentryConfigured: Boolean(sentryDsn),
    upstashConfigured: Boolean(upstashUrl && upstashToken),
  };
}
