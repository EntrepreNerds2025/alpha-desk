import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { User, Monitor, Wifi, Database, Bot, Bell, Palette, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — AI Trading Office" },
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
];

function SettingsPage() {
  const [active, setActive] = useState("Profile");

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Settings Nav */}
        <div className="w-52 border-r border-border p-3 space-y-0.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Settings</h2>
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.name}
                onClick={() => setActive(s.name)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  s.name === active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-surface-3 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {s.name}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 overflow-y-auto scrollbar-thin max-w-3xl">
          {active === "Profile" && (
            <div className="space-y-6">
              <h1 className="text-lg font-semibold">Profile</h1>
              <div className="space-y-4">
                {[
                  { label: "Display Name", value: "Trader Alpha", type: "text" },
                  { label: "Email", value: "trader@example.com", type: "email" },
                  { label: "Timezone", value: "America/New_York (ET)", type: "text" },
                ].map((f) => (
                  <div key={f.label} className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                    <input
                      type={f.type}
                      defaultValue={f.value}
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
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Connection Status</span>
                  <span className="flex items-center gap-1.5 text-xs text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Connected</span>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Webhook URL</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input defaultValue="https://api.aitradingoffice.com/webhook/tv/abc123" readOnly className="flex-1 rounded-md border border-border bg-surface-1 px-3 py-2 text-xs font-mono text-muted-foreground" />
                      <button className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground">Copy</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {active === "Broker" && (
            <div className="space-y-6">
              <h1 className="text-lg font-semibold">Broker Connection</h1>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border-2 border-warning/30 bg-warning/5 p-4">
                  <h3 className="text-sm font-semibold mb-1">Paper Account</h3>
                  <span className="text-xs text-warning">● Active</span>
                  <div className="mt-3 space-y-2">
                    <div><label className="text-[10px] text-muted-foreground">Platform</label><div className="text-xs">Tradovate</div></div>
                    <div><label className="text-[10px] text-muted-foreground">Account ID</label><div className="text-xs font-mono">SIM-42891</div></div>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-surface-2 p-4 opacity-60">
                  <h3 className="text-sm font-semibold mb-1">Live Account</h3>
                  <span className="text-xs text-muted-foreground">● Not Connected</span>
                  <div className="mt-3">
                    <button className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">Connect Live Account</button>
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
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold">{provider}</span>
                    <span className="flex items-center gap-1.5 text-xs text-success"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Connected</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-muted-foreground">API Key</label>
                      <input type="password" defaultValue="sk-..." className="mt-1 w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-xs font-mono" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Model</label>
                      <select className="mt-1 w-full rounded-md border border-border bg-surface-1 px-3 py-2 text-xs">
                        <option>{provider === "OpenAI" ? "gpt-4o" : "claude-sonnet-4-20250514"}</option>
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
                <p className="text-sm text-muted-foreground">Settings for {active} — Coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
