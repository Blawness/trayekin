import type { ProfitabilityRow } from "@/lib/actions/profitability";

export type CostDriver = {
  key: "costFuel" | "costService" | "costParts" | "costKir" | "costStnk";
  label: string;
  amount: number;
};

const COST_DRIVER_LABELS: Record<CostDriver["key"], string> = {
  costFuel: "BBM",
  costService: "Servis",
  costParts: "Ganti part",
  costKir: "KIR",
  costStnk: "STNK",
};

export function getBiggestCostDriver(row: ProfitabilityRow): CostDriver | null {
  const keys = Object.keys(COST_DRIVER_LABELS) as CostDriver["key"][];
  let biggest: CostDriver | null = null;
  for (const key of keys) {
    const amount = row[key];
    if (amount > 0 && (!biggest || amount > biggest.amount)) {
      biggest = { key, label: COST_DRIVER_LABELS[key], amount };
    }
  }
  return biggest;
}

export type BoncosRow = ProfitabilityRow & { biggestCostDriver: CostDriver | null };
