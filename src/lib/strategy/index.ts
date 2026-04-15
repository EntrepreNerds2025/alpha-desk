import type { Strategy } from "./types";
import { strategyCatalog } from "./strategies";

export * from "./conditions";
export * from "./evaluator";
export * from "./strategies";
export * from "./types";

export const strategyNames = strategyCatalog.map((strategy) => strategy.name);

export const strategyByName: Record<string, Strategy> = strategyCatalog.reduce<
  Record<string, Strategy>
>((acc, strategy) => {
  acc[strategy.name] = strategy;
  return acc;
}, {});
