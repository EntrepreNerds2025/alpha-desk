import { createFileRoute } from "@tanstack/react-router";
import {
  buildTradingViewDedupKey,
  isDuplicateTradingViewEvent,
  parseTradingViewWebhookPayload,
  routeTradingViewEvent,
} from "@/lib/webhooks/tradingview";

const secretHeaderName = "x-tv-secret";
let lastWebhookReceivedAt: string | null = null;

function getConfiguredTradingViewSecret() {
  const processEnvSecret =
    typeof process !== "undefined" && process?.env
      ? process.env.TRADINGVIEW_WEBHOOK_SECRET
      : undefined;
  const viteEnvSecret = (import.meta as ImportMeta & { env?: Record<string, string | undefined> })
    .env?.TRADINGVIEW_WEBHOOK_SECRET;

  return processEnvSecret ?? viteEnvSecret;
}

function buildJsonResponse(payload: unknown, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "cache-control": "no-store",
    },
  });
}

export const Route = createFileRoute("/api/webhooks/tradingview")({
  server: {
    handlers: {
      GET: async () => {
        return buildJsonResponse({
          ok: true,
          service: "tradingview-webhook",
          status: "ready",
          lastWebhookReceivedAt,
        });
      },
      POST: async ({ request }) => {
        const configuredSecret = getConfiguredTradingViewSecret();
        if (!configuredSecret) {
          return buildJsonResponse(
            {
              ok: false,
              error: "server_secret_not_configured",
              detail: "Set TRADINGVIEW_WEBHOOK_SECRET in the server environment.",
            },
            500,
          );
        }

        let rawBody: unknown;
        try {
          rawBody = await request.json();
        } catch {
          return buildJsonResponse(
            {
              ok: false,
              error: "invalid_json",
              detail: "Request body must be valid JSON.",
            },
            400,
          );
        }

        const parsedPayload = parseTradingViewWebhookPayload(rawBody);
        if (!parsedPayload.success) {
          return buildJsonResponse(
            {
              ok: false,
              error: "invalid_payload",
              issues: parsedPayload.error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
              })),
            },
            400,
          );
        }

        const payload = parsedPayload.data;
        const headerSecret = request.headers.get(secretHeaderName);
        const providedSecret = headerSecret ?? payload.secret;

        if (!providedSecret || providedSecret !== configuredSecret) {
          return buildJsonResponse(
            {
              ok: false,
              error: "unauthorized",
              detail: `Provide valid ${secretHeaderName} header or payload.secret.`,
            },
            401,
          );
        }

        const dedupKey = buildTradingViewDedupKey(payload);
        const duplicate = isDuplicateTradingViewEvent(dedupKey);

        if (duplicate) {
          return buildJsonResponse({
            ok: true,
            deduped: true,
            event: payload.event,
          });
        }

        const routed = routeTradingViewEvent(payload);
        lastWebhookReceivedAt = new Date().toISOString();

        return buildJsonResponse({
          ok: true,
          deduped: false,
          event: payload.event,
          routedTo: routed.routedTo,
          summary: routed.summary,
          receivedAt: new Date().toISOString(),
        });
      },
    },
  },
});
