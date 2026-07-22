"use server";

import { db } from "@/lib/db";
import {
  vehicles,
  dailyLedger,
  serviceRecords,
  partReplacements,
  kirRecords,
  stnkRecords,
  appSettings,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, inArray, and, gte, lte } from "drizzle-orm";
import { getBiggestCostDriver, type BoncosRow } from "@/lib/utils/profitability";

export type ProfitabilityRow = {
  vehicleId: string;
  plate: string;
  name: string;
  totalKm: number;
  revenue: number;
  costService: number;
  costParts: number;
  costKir: number;
  costStnk: number;
  costFuel: number;
  totalCost: number;
  netProfit: number;
  marginPercent: number;
};

export async function getProfitabilityReport(
  periodStart: string,
  periodEnd: string
): Promise<ProfitabilityRow[]> {
  const session = await auth();
  if (!session?.user) return [];

  try {
    // Fetch settings
    const settingsRows = await db.select().from(appSettings).where(eq(appSettings.userId, session.user.id!));
    const settingsMap = Object.fromEntries(settingsRows.map((s) => [s.key, parseInt(s.value, 10)]));
    const ratePerKm = settingsMap["rate_per_km"] || 4500;
    const fuelPrice = settingsMap["fuel_price_per_liter"] || 10000;
    const fuelConsumption = settingsMap["fuel_consumption_km_per_l"] || 10;

    const periodDays =
      (new Date(periodEnd).getTime() - new Date(periodStart).getTime()) / (1000 * 60 * 60 * 24);

    // Fetch vehicles
    const vehicleList = await db
      .select()
      .from(vehicles)
      .where(eq(vehicles.userId, session.user.id!));

    if (vehicleList.length === 0) return [];

    const vehicleIds = vehicleList.map((v) => v.id);

    // Fetch ledger entries in period
    const ledgerEntries = await db
      .select()
      .from(dailyLedger)
      .where(and(inArray(dailyLedger.vehicleId, vehicleIds), gte(dailyLedger.date, periodStart), lte(dailyLedger.date, periodEnd)))
      .limit(500);

    // Fetch service records in period
    const services = await db
      .select()
      .from(serviceRecords)
      .where(and(inArray(serviceRecords.vehicleId, vehicleIds), gte(serviceRecords.serviceDate, periodStart), lte(serviceRecords.serviceDate, periodEnd)))
      .limit(500);

    // Fetch part replacements in period
    const parts = await db
      .select()
      .from(partReplacements)
      .where(and(inArray(partReplacements.vehicleId, vehicleIds), gte(partReplacements.date, periodStart), lte(partReplacements.date, periodEnd)))
      .limit(500);

    // Fetch KIR records that overlap with period
    const kirList = await db
      .select()
      .from(kirRecords)
      .where(and(inArray(kirRecords.vehicleId, vehicleIds), lte(kirRecords.startDate, periodEnd), gte(kirRecords.endDate, periodStart)))
      .limit(500);

    // Fetch STNK records that overlap with period
    const stnkList = await db
      .select()
      .from(stnkRecords)
      .where(and(inArray(stnkRecords.vehicleId, vehicleIds), lte(stnkRecords.startDate, periodEnd), gte(stnkRecords.endDate, periodStart)))
      .limit(500);

    // Calculate per vehicle
    return vehicleList.map((v) => {
      const vLedger = ledgerEntries.filter((e) => e.vehicleId === v.id);
      const vServices = services.filter((s) => s.vehicleId === v.id);
      const vParts = parts.filter((p) => p.vehicleId === v.id);
      const vKir = kirList.filter((k) => k.vehicleId === v.id);
      const vStnk = stnkList.filter((s) => s.vehicleId === v.id);

      const totalKm = vLedger.reduce((sum, e) => sum + (e.km || 0), 0);
      const revenue = vLedger.reduce((sum, e) => {
        if (e.km && e.km > 0) {
          const entryRate = e.snapshotRatePerKm ?? ratePerKm;
          return sum + e.km * entryRate;
        }
        return sum + e.revenue;
      }, 0);

      const costService = vServices.reduce((sum, s) => sum + (s.cost || 0), 0);
      const costParts = vParts.reduce((sum, p) => sum + p.cost, 0);

      // KIR prorata: cost / actual_days × days_in_period
      const costKir = vKir.reduce((sum, k) => {
        const actualDays =
          (new Date(k.endDate).getTime() - new Date(k.startDate).getTime()) / (1000 * 60 * 60 * 24);
        if (actualDays <= 0) return sum;
        return sum + ((k.cost || 0) / actualDays) * periodDays;
      }, 0);

      // STNK prorata: cost / actual_days × days_in_period
      const costStnk = vStnk.reduce((sum, s) => {
        const actualDays =
          (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) / (1000 * 60 * 60 * 24);
        if (actualDays <= 0) return sum;
        return sum + ((s.cost || 0) / actualDays) * periodDays;
      }, 0);

      const costFuel = vLedger.reduce((sum, e) => {
        if (e.km && e.km > 0) {
          const entryConsumption = e.snapshotFuelConsumption ?? fuelConsumption;
          const entryPrice = e.snapshotFuelPrice ?? fuelPrice;
          return sum + (e.km / entryConsumption) * entryPrice;
        }
        return sum;
      }, 0);

      const roundedKir = Math.round(costKir);
      const roundedStnk = Math.round(costStnk);
      const roundedFuel = Math.round(costFuel);
      const totalCost = costService + costParts + roundedKir + roundedStnk + roundedFuel;
      const netProfit = revenue - totalCost;
      const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      return {
        vehicleId: v.id,
        plate: v.plate,
        name: v.name || "Tanpa nama",
        totalKm,
        revenue,
        costService,
        costParts,
        costKir: roundedKir,
        costStnk: roundedStnk,
        costFuel: roundedFuel,
        totalCost,
        netProfit,
        marginPercent: Math.round(marginPercent * 100) / 100,
      };
    });
  } catch (error) {
    console.error("getProfitabilityReport:", error);
    return [];
  }
}

export async function getBoncosVehicles(
  periodStart: string,
  periodEnd: string
): Promise<BoncosRow[]> {
  const rows = await getProfitabilityReport(periodStart, periodEnd);
  return rows
    .filter(
      (r) =>
        (r.totalKm > 0 || r.revenue > 0 || r.totalCost > 0) && r.netProfit < 0
    )
    .sort((a, b) => a.netProfit - b.netProfit)
    .map((r) => ({ ...r, biggestCostDriver: getBiggestCostDriver(r) }));
}
