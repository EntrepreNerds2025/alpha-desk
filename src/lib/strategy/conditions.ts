import type { StrategyCondition, StrategySignals } from "./types";

type SignalKey = keyof StrategySignals;

interface BaseSignalConditionOptions {
  id: string;
  label: string;
  description: string;
  signal: SignalKey;
}

interface BooleanSignalConditionOptions extends BaseSignalConditionOptions {
  expected: boolean;
}

interface NumericMinSignalConditionOptions extends BaseSignalConditionOptions {
  min: number;
  unit?: string;
}

export function booleanSignalCondition(options: BooleanSignalConditionOptions): StrategyCondition {
  return {
    id: options.id,
    label: options.label,
    description: options.description,
    evaluator: (context) => {
      const current = Boolean(context.signals[options.signal]);
      const passed = current === options.expected;
      const expectedLabel = options.expected ? "true" : "false";
      const currentLabel = current ? "true" : "false";
      return {
        conditionId: options.id,
        label: options.label,
        passed,
        detail: passed
          ? `${options.label}: met`
          : `${options.label}: expected ${expectedLabel}, got ${currentLabel}`,
      };
    },
  };
}

export function minNumericSignalCondition(
  options: NumericMinSignalConditionOptions,
): StrategyCondition {
  return {
    id: options.id,
    label: options.label,
    description: options.description,
    evaluator: (context) => {
      const current = Number(context.signals[options.signal]);
      const passed = current >= options.min;
      const unit = options.unit ?? "";
      return {
        conditionId: options.id,
        label: options.label,
        passed,
        detail: passed
          ? `${options.label}: ${current.toFixed(2)}${unit} >= ${options.min}${unit}`
          : `${options.label}: ${current.toFixed(2)}${unit} < ${options.min}${unit}`,
      };
    },
  };
}
