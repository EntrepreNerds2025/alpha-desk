import { strategyNames } from "@/lib/strategy";

export interface SymbolData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  tickSize: number;
  sparkline: number[];
}

export const symbols: SymbolData[] = [
  {
    symbol: "NQ",
    name: "E-Mini Nasdaq",
    price: 21485.5,
    change: 142.75,
    changePct: 0.67,
    tickSize: 0.25,
    sparkline: [21320, 21345, 21380, 21350, 21420, 21465, 21440, 21485],
  },
  {
    symbol: "ES",
    name: "E-Mini S&P 500",
    price: 5842.25,
    change: 18.5,
    changePct: 0.32,
    tickSize: 0.25,
    sparkline: [5810, 5818, 5830, 5825, 5838, 5845, 5840, 5842],
  },
  {
    symbol: "CL",
    name: "Crude Oil",
    price: 74.2,
    change: -0.85,
    changePct: -1.13,
    tickSize: 0.01,
    sparkline: [75.1, 75.0, 74.8, 74.6, 74.5, 74.3, 74.25, 74.2],
  },
  {
    symbol: "GC",
    name: "Gold",
    price: 2640.3,
    change: 12.4,
    changePct: 0.47,
    tickSize: 0.1,
    sparkline: [2625, 2628, 2630, 2635, 2632, 2638, 2642, 2640],
  },
  {
    symbol: "YM",
    name: "E-Mini Dow",
    price: 43250.0,
    change: 185.0,
    changePct: 0.43,
    tickSize: 1.0,
    sparkline: [43020, 43080, 43120, 43150, 43180, 43200, 43230, 43250],
  },
  {
    symbol: "RTY",
    name: "E-Mini Russell",
    price: 2285.4,
    change: -8.6,
    changePct: -0.37,
    tickSize: 0.1,
    sparkline: [2298, 2295, 2292, 2290, 2288, 2286, 2284, 2285],
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 97420.0,
    change: 1850.0,
    changePct: 1.94,
    tickSize: 5.0,
    sparkline: [95200, 95800, 96100, 96500, 96800, 97100, 97300, 97420],
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3842.5,
    change: 64.25,
    changePct: 1.7,
    tickSize: 0.25,
    sparkline: [3760, 3775, 3790, 3800, 3815, 3828, 3835, 3842],
  },
];

export const strategies = strategyNames;

export const modes = ["Manual", "Assist", "Auto Paper", "Auto Live"] as const;
export type TradingMode = (typeof modes)[number];

export interface TradeEntry {
  id: string;
  time: string;
  symbol: string;
  side: "Long" | "Short";
  entry: number;
  stop: number;
  target: number;
  size: number;
  pnl: number;
  status: "Filled" | "Open" | "Cancelled" | "Stopped";
  strategy: string;
  confidence: number;
  reason: string;
}

export const trades: TradeEntry[] = [
  {
    id: "t1",
    time: "9:42:18 AM",
    symbol: "NQ",
    side: "Long",
    entry: 21442.25,
    stop: 21428.0,
    target: 21480.0,
    size: 2,
    pnl: 340,
    status: "Filled",
    strategy: "Sweep Long",
    confidence: 72,
    reason: "Overnight low sweep + reclaim",
  },
  {
    id: "t2",
    time: "9:58:04 AM",
    symbol: "ES",
    side: "Short",
    entry: 5848.5,
    stop: 5854.0,
    target: 5838.0,
    size: 3,
    pnl: -165,
    status: "Stopped",
    strategy: "ORB Break",
    confidence: 58,
    reason: "ORB break failed at VWAP",
  },
  {
    id: "t3",
    time: "10:14:32 AM",
    symbol: "NQ",
    side: "Long",
    entry: 21458.0,
    stop: 21445.0,
    target: 21490.0,
    size: 1,
    pnl: 120,
    status: "Filled",
    strategy: "VWAP Reclaim",
    confidence: 65,
    reason: "VWAP reclaim after pullback",
  },
  {
    id: "t4",
    time: "10:31:47 AM",
    symbol: "CL",
    side: "Short",
    entry: 74.85,
    stop: 75.1,
    target: 74.4,
    size: 2,
    pnl: 450,
    status: "Filled",
    strategy: "Hourly Zone Trend",
    confidence: 78,
    reason: "Break below hourly support",
  },
  {
    id: "t5",
    time: "10:48:12 AM",
    symbol: "NQ",
    side: "Long",
    entry: 21472.5,
    stop: 21460.0,
    target: 21500.0,
    size: 2,
    pnl: -80,
    status: "Stopped",
    strategy: "Sweep Long",
    confidence: 52,
    reason: "Second sweep attempt, weak bid",
  },
  {
    id: "t6",
    time: "11:02:55 AM",
    symbol: "GC",
    side: "Long",
    entry: 2632.4,
    stop: 2628.0,
    target: 2645.0,
    size: 1,
    pnl: 790,
    status: "Filled",
    strategy: "VWAP Reclaim",
    confidence: 81,
    reason: "Gold catching safe haven bid",
  },
  {
    id: "t7",
    time: "11:18:33 AM",
    symbol: "NQ",
    side: "Long",
    entry: 21480.25,
    stop: 21468.0,
    target: 21510.0,
    size: 2,
    pnl: 0,
    status: "Open",
    strategy: "Sweep Long",
    confidence: 62,
    reason: "Third push, volume confirming",
  },
];

export interface AgentData {
  id: string;
  name: string;
  icon: string;
  column: "Watching" | "Analyzing" | "Waiting" | "Acting" | "Review";
  task: string;
  status: "watching" | "analyzing" | "waiting" | "acting" | "review";
  lastUpdate: string;
  priority: "low" | "normal" | "high" | "critical";
  confidence?: number;
  provider: "OpenAI" | "Anthropic";
  cost: string;
}

export const agents: AgentData[] = [
  {
    id: "a1",
    name: "Market Watch",
    icon: "Eye",
    column: "Watching",
    task: "Monitoring NQ, ES, CL, GC",
    status: "watching",
    lastUpdate: "2s ago",
    priority: "high",
    provider: "OpenAI",
    cost: "$0.08",
  },
  {
    id: "a2",
    name: "Setup Scout",
    icon: "Search",
    column: "Analyzing",
    task: "Sweep long forming on NQ · 2/4 conditions",
    status: "analyzing",
    lastUpdate: "12s ago",
    priority: "high",
    confidence: 62,
    provider: "Anthropic",
    cost: "$0.24",
  },
  {
    id: "a3",
    name: "News Desk",
    icon: "Newspaper",
    column: "Watching",
    task: "Scanning headlines · 3 new in last hour",
    status: "watching",
    lastUpdate: "45s ago",
    priority: "normal",
    provider: "OpenAI",
    cost: "$0.05",
  },
  {
    id: "a4",
    name: "Risk Manager",
    icon: "Shield",
    column: "Waiting",
    task: "All rules green · $420 of $1,000 used",
    status: "waiting",
    lastUpdate: "5s ago",
    priority: "critical",
    provider: "OpenAI",
    cost: "$0.03",
  },
  {
    id: "a5",
    name: "Execution Desk",
    icon: "Zap",
    column: "Waiting",
    task: "Ready, no active orders · last fill 12m ago",
    status: "waiting",
    lastUpdate: "12m ago",
    priority: "normal",
    provider: "Anthropic",
    cost: "$0.01",
  },
  {
    id: "a6",
    name: "Journal Desk",
    icon: "BookOpen",
    column: "Review",
    task: "Writing notes on NQ scalp #4 · 85%",
    status: "review",
    lastUpdate: "1m ago",
    priority: "low",
    provider: "OpenAI",
    cost: "$0.12",
  },
  {
    id: "a7",
    name: "Coach",
    icon: "GraduationCap",
    column: "Analyzing",
    task: "Reviewing patterns · 3 missed ORB setups",
    status: "analyzing",
    lastUpdate: "3m ago",
    priority: "normal",
    confidence: 74,
    provider: "Anthropic",
    cost: "$0.18",
  },
  {
    id: "a8",
    name: "Strategy Analyst",
    icon: "BarChart3",
    column: "Review",
    task: "Comparing Sweep Long vs ORB this week",
    status: "review",
    lastUpdate: "8m ago",
    priority: "low",
    provider: "OpenAI",
    cost: "$0.15",
  },
];

export const chatMessages = [
  {
    role: "ai" as const,
    text: "Good morning. NY session opened with NQ gapping up 0.4% above yesterday's close. Watching for a sweep of the overnight low at 21,420.",
  },
  {
    role: "ai" as const,
    text: "NQ sweeping the overnight low. Watching for reclaim above 21,485.",
  },
  { role: "user" as const, text: "What's the confidence on this setup?" },
  {
    role: "ai" as const,
    text: "Currently 62%. We need a 5-min close back inside range and bid absorption on the tape. 2 of 4 conditions met.",
  },
  { role: "ai" as const, text: "No entry yet — setup needs a 5-min close back inside range." },
];

export const quickActions = [
  "Explain last trade",
  "Why no trade?",
  "What's market doing?",
  "Session recap",
];

export const marketNarrative = [
  "Momentum fading on ES after morning push to 5,848",
  "NQ holding VWAP at 21,465 — key level for continuation",
  "CPI in 2h14m — reducing confidence on new entries",
  "Fed's Waller speaking at 11am ET — potential volatility",
];

export const suggestedActions = [
  {
    title: "Reduce position size",
    detail: "CPI risk in 2h — consider half-size until data release",
    urgency: "warning" as const,
  },
  {
    title: "New setup forming on CL",
    detail: "Short setup at 74.85 resistance with declining volume",
    urgency: "info" as const,
  },
  {
    title: "Take partial profit on GC",
    detail: "Gold approaching 2,645 resistance — consider scaling out",
    urgency: "success" as const,
  },
];

export const economicEvents = [
  { name: "CPI Report", impact: "HIGH", countdown: "2h 14m", time: "8:30 AM ET" },
  { name: "Fed's Waller Speech", impact: "MED", countdown: "3h 42m", time: "11:00 AM ET" },
  { name: "Oil Inventories", impact: "MED", countdown: "5h 18m", time: "10:30 AM ET" },
];

export const newsHeadlines = [
  {
    time: "9:15 AM",
    text: "Fed's Waller signals cautious approach at 11am ET",
    impact: "high" as const,
  },
  {
    time: "8:42 AM",
    text: "CPI beats estimates at 3.2% vs 3.1% expected",
    impact: "high" as const,
  },
  {
    time: "8:30 AM",
    text: "Oil inventories drop 2.4M barrels vs 1.8M expected",
    impact: "medium" as const,
  },
  {
    time: "8:15 AM",
    text: "China PMI comes in at 50.2, above expectations",
    impact: "medium" as const,
  },
  { time: "7:45 AM", text: "European markets open higher, DAX +0.6%", impact: "low" as const },
];

export const candleData = Array.from({ length: 60 }, (_, i) => {
  const base = 21400 + Math.sin(i / 8) * 40 + (i / 60) * 80;
  const open = base + (Math.random() - 0.5) * 15;
  const close = base + (Math.random() - 0.5) * 15;
  const high = Math.max(open, close) + Math.random() * 10;
  const low = Math.min(open, close) - Math.random() * 10;
  const volume = 800 + Math.random() * 1200;
  return {
    time: i,
    open: +open.toFixed(2),
    close: +close.toFixed(2),
    high: +high.toFixed(2),
    low: +low.toFixed(2),
    volume: +volume.toFixed(0),
  };
});

export const equityCurve = [
  { date: "Apr 1", pnl: 420, cumulative: 420 },
  { date: "Apr 2", pnl: -180, cumulative: 240 },
  { date: "Apr 3", pnl: 650, cumulative: 890 },
  { date: "Apr 4", pnl: 120, cumulative: 1010 },
  { date: "Apr 7", pnl: -340, cumulative: 670 },
  { date: "Apr 8", pnl: 520, cumulative: 1190 },
  { date: "Apr 9", pnl: 280, cumulative: 1470 },
  { date: "Apr 10", pnl: -90, cumulative: 1380 },
  { date: "Apr 11", pnl: 440, cumulative: 1820 },
  { date: "Apr 14", pnl: 310, cumulative: 2130 },
  { date: "Apr 15", pnl: 455, cumulative: 2585 },
];

export const sessionSessions = ["Tokyo", "London", "New York"] as const;

export const workspaces = [
  { name: "Trading Desk", icon: "LayoutDashboard", path: "/desk" },
  { name: "Replay", icon: "PlayCircle", path: "/replay" },
  { name: "Strategy Lab", icon: "FlaskConical", path: "/strategy-lab" },
  { name: "Journal", icon: "BookOpen", path: "/journal" },
  { name: "Risk", icon: "Shield", path: "/risk" },
  { name: "Settings", icon: "Settings", path: "/settings" },
] as const;
