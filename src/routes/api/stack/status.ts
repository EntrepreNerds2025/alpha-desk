import { createFileRoute } from "@tanstack/react-router";
import { getServerEnvStatus } from "@/lib/config/server-env";

export const Route = createFileRoute("/api/stack/status")({
  server: {
    handlers: {
      GET: async () => {
        const env = getServerEnvStatus();
        const readiness = {
          webhookIngestion: env.tradingviewSecretConfigured,
          realtimeUi: env.supabaseUrlConfigured && env.supabaseAnonConfigured,
          workerExecution: env.upstashConfigured,
          observability: env.sentryConfigured,
        };

        return Response.json(
          {
            ok: true,
            generatedAt: new Date().toISOString(),
            env,
            readiness,
          },
          {
            headers: {
              "cache-control": "no-store",
            },
          },
        );
      },
    },
  },
});
