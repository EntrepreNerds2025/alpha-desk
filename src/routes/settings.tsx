import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getTradingViewWebhookUrl, tradingViewAlertTemplates } from "@/data/tradingview";
import { User, Monitor, Wifi, Database, Bot, Bell, Palette, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings - AI Trading Office" },
      { name: "description", content: "Configure your trading environment" },
    ],
  }),
  component: SettingsPage,
});

const sections = [
  { name: "Profile", icon: User },
  { name: "TradingView", icon: Monitor },
  { name: "Broker", icon: Wifi },
  { name: "Data Providers", icon: Database },
  { name: "AI Providers", icon: Bot },
  { name: "Notifications", icon: Bell },
  { name: "Appearance", icon: Palette },
  { name: "Security", icon: ShieldCheck },
] as const;

function SettingsPage() {
  const [active, setActive] = useState<(typeof sections)[number]["name"]>("Profile");
  const [webhookUrl, setWebhookUrl] = useState(
    "https://api.ai-trading-office.app/api/webhooks/tradingview",
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setWebhookUrl(getTradingViewWebhookUrl());
  }, []);

  const copyText = async (value: string, id: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, 1400);
  };

  return (
    <AppLayout>
      <div className="flex h-full">
        <div className="w-52 space-y-0.5 border-r border-border p-3">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Settings
          </h2>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.name}
                onClick={() => setActive(section.name)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  section.name === active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {section.name}
              </button>
            );
          })}
        </div>

        <div className="max-w-4xl flex-1 overflow-y-auto p-6 scrollbar-thin">
          {active === "Profile" && (
            <div className="space-y-6">
              <h1 className="text-lg font-semibold">Profile</h1>
              <div className="space-y-4">
                {[
                  { label: "Display Name", value: "Trader Alpha", type: "text" },
                  { label: "Email", value: "trader@example.com", type: "email" },
                  { label: "Timezone", value: "America/New_York (ET)", type: "text" },
                ].map((field) => (
                  <div key={field.label} className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      defaultValue={field.value}
                      className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "TradingView" && (
            <div className="space-y-6">
              <h1 className="text-lg font-semibold">TradingView Integration</h1>

              <div className="rounded-lg border border-border bg-surface-2 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium">Connection Status</span>
                  <span className="flex items-center gap-1.5 text-xs text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Connected
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground">Webhook URL</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        value={webhookUrl}
                        readOnly
                        className="flex-1 rounded-md border border-border bg-surface-1 px-3 py-2 text-xs font-mono text-muted-foreground"
                      />
                      <button
                        onClick={() => copyText(webhookUrl, "webhook-url")}
                        className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground"
                      >
                        {copiedId === "webhook-url" ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border border-border bg-surface-1 p-3">
                      <div className="text-[11px] text-muted-foreground">Shared Secret</div>
                      <div className="mt-1 font-mono text-xs text-foreground">
                        tvsk_live_xxxxxxxxxxxxxxx
                      </div>
                      <button className="mt-2 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground">
                        Rotate Secret
                      </button>
                    </div>
                    <div className="rounded-md border border-border bg-surface-1 p-3">
                      <div className="text-[11px] text-muted-foreground">Last Webhook Received</div>
                      <div className="mt-1 text-xs text-foreground">14s ago</div>
                      <div className="mt-2 text-[11px] text-muted-foreground">
                        Monitor: 4 alerts in last 3 min (limit warning at 12+)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-semibold">Alert Templates</h2>
                {tradingViewAlertTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="rounded-lg border border-border bg-surface-2 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">{template.label}</span>
                      <button
                        onClick={() => copyText(template.payload, template.id)}
                        className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-surface-3 hover:text-foreground"
                      >
                        {copiedId === template.id ? "Copied" : "Copy JSON"}
                      </button>
                    </div>
                    <pre className="max-h-40 overflow-auto rounded-md bg-surface-1 p-3 text-[11px] text-muted-foreground">
                      {template.payload}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === "Broker" && (
            <div className="space-y-6">
              <h1 className="text-lg font-semibold">Broker Connection</h1>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border-2 border-warning/30 bg-warning/5 p-4">
                  <h3 className="mb-1 text-sm font-semibold">Paper Account</h3>
                  <span className="text-xs text-warning">* Active</span>
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground">Platform</label>
                      <div className="text-xs">Tradovate</div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground">Account ID</label>
                      <div className="font-mono text-xs">SIM-42891</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-surface-2 p-4 opacity-60">
                  <h3 className="mb-1 text-sm font-semibold">Live Account</h3>
                  <span className="text-xs text-muted-foreground">* Not Connected</span>
                  <div className="mt-3">
                    <button className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">
                      Connect Live Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === "AI Providers" && (
            <div className="space-y-6">
              <h1 className="text-lg font-semibold">AI Providers</h1>
              {["OpenAI", "Anthropic"].map((provider) => (
                <div key={provider} className="rounded-lg border border-border bg-surface-2 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold">{provider}</span>
                    <span className="flex items-center gap-1.5 text-xs text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Connected
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-muted-foreground">API Key</label>
                      <input
                        type="password"
                        defaultValue="sk-..."
                        className="mt-1 w-full rounded-md border border-border bg-surface-1 px-3 py-2 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Model</label>
                      <select className="mt-1 w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-xs">
                        <option>
                          {provider === "OpenAI" ? "gpt-5.4-mini" : "claude-sonnet-4-6"}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!["Profile", "TradingView", "Broker", "AI Providers"].includes(active) && (
            <div className="space-y-6">
              <h1 className="text-lg font-semibold">{active}</h1>
              <div className="rounded-lg border border-border bg-surface-2 p-8 text-center">
                <p className="text-sm text-muted-foreground">Settings for {active} - Coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
