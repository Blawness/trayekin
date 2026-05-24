import { getProfitabilityReport } from "@/lib/actions/profitability";
import { getDriverSummaries } from "@/lib/actions/driverAssignments";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import Link from "next/link";

type SortKey = "plate" | "revenue" | "totalCost" | "netProfit" | "marginPercent";
type SortDir = "asc" | "desc";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; sort?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const period = params.period || "30";
  const sortKey = (params.sort as SortKey) || "revenue";
  const sortDir = (params.dir as SortDir) || "desc";

  const now = new Date();
  const days = parseInt(period, 10);
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const periodStart = start.toISOString().split("T")[0];
  const periodEnd = now.toISOString().split("T")[0];

  const rows = await getProfitabilityReport(periodStart, periodEnd);

  const driverSummaries = await getDriverSummaries(periodStart, periodEnd);

  // Filter: only vehicles with activity in period
  const activeRows = rows.filter(
    (r) => r.totalKm > 0 || r.revenue > 0 || r.totalCost > 0
  );

  // Sort
  const sorted = [...activeRows].sort((a, b) => {
    const aVal = a[sortKey as keyof typeof a];
    const bVal = b[sortKey as keyof typeof b];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const totalRevenue = sorted.reduce((s, r) => s + r.revenue, 0);
  const totalCost = sorted.reduce((s, r) => s + r.totalCost, 0);
  const fleetMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

  const periods = [
    { label: "30 Hari", value: "30" },
    { label: "60 Hari", value: "60" },
    { label: "90 Hari", value: "90" },
  ];

  function sortUrl(key: SortKey) {
    const newDir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    return `/reports?period=${period}&sort=${key}&dir=${newDir}`;
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  }

  if (rows.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center py-16 text-muted-foreground">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <BarChart3 className="size-8 text-muted-foreground/50" />
          </div>
          <p className="font-semibold">Belum ada data kendaraan.</p>
          <p className="text-sm">Tambah kendaraan untuk melihat laporan.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold tracking-tight">Laporan Profitabilitas</h1>

      <div className="flex gap-1.5">
        {periods.map((p) => (
          <Link
            key={p.value}
            href={`/reports?period=${p.value}&sort=${sortKey}&dir=${sortDir}`}
            className={cn(
              "px-3.5 py-1.5 text-sm rounded-lg border transition-colors font-medium",
              period === p.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-muted border-border"
            )}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card size="sm" className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />
          <CardContent className="p-4 text-center">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Pendapatan</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card size="sm" className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500" />
          <CardContent className="p-4 text-center">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Biaya</div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-1 tabular-nums">
              Rp {totalCost.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card size="sm" className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
          <CardContent className="p-4 text-center">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Margin</div>
            <div className={cn("text-lg font-bold mt-1 tabular-nums", fleetMargin >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600")}>
              {fleetMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card size="sm" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground bg-muted/50">
                <th className="py-2.5 pl-4 pr-2 font-medium text-xs uppercase tracking-wider">
                  <Link href={sortUrl("plate")} className="hover:text-foreground transition-colors">
                    Plat {sortIndicator("plate")}
                  </Link>
                </th>
                <th className="py-2.5 pr-2 font-medium text-xs uppercase tracking-wider text-right">KM</th>
                <th className="py-2.5 pr-2 font-medium text-xs uppercase tracking-wider text-right">
                  <Link href={sortUrl("revenue")} className="hover:text-foreground transition-colors">
                    Pendapatan {sortIndicator("revenue")}
                  </Link>
                </th>
                <th className="py-2.5 pr-2 font-medium text-xs uppercase tracking-wider text-right">Service</th>
                <th className="py-2.5 pr-2 font-medium text-xs uppercase tracking-wider text-right">Parts</th>
                <th className="py-2.5 pr-2 font-medium text-xs uppercase tracking-wider text-right">KIR</th>
                <th className="py-2.5 pr-2 font-medium text-xs uppercase tracking-wider text-right">STNK</th>
                <th className="py-2.5 pr-2 font-medium text-xs uppercase tracking-wider text-right">BBM</th>
                <th className="py-2.5 pr-2 font-medium text-xs uppercase tracking-wider text-right">
                  <Link href={sortUrl("totalCost")} className="hover:text-foreground transition-colors">
                    Biaya {sortIndicator("totalCost")}
                  </Link>
                </th>
                <th className="py-2.5 pr-2 font-medium text-xs uppercase tracking-wider text-right">
                  <Link href={sortUrl("netProfit")} className="hover:text-foreground transition-colors">
                    Bersih {sortIndicator("netProfit")}
                  </Link>
                </th>
                <th className="py-2.5 pr-4 font-medium text-xs uppercase tracking-wider text-right">
                  <Link href={sortUrl("marginPercent")} className="hover:text-foreground transition-colors">
                    Margin {sortIndicator("marginPercent")}
                  </Link>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.vehicleId} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 pl-4 pr-2 font-medium">
                    <Link href={`/vehicles/${r.vehicleId}`} className="hover:underline text-primary">
                      {r.plate}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-2 text-right tabular-nums">{r.totalKm || "-"}</td>
                  <td className="py-2.5 pr-2 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {r.revenue > 0 ? `Rp ${r.revenue.toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="py-2.5 pr-2 text-right tabular-nums">
                    {r.costService > 0 ? `Rp ${r.costService.toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="py-2.5 pr-2 text-right tabular-nums">
                    {r.costParts > 0 ? `Rp ${r.costParts.toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="py-2.5 pr-2 text-right tabular-nums">
                    {r.costKir > 0 ? `Rp ${r.costKir.toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="py-2.5 pr-2 text-right tabular-nums">
                    {r.costStnk > 0 ? `Rp ${r.costStnk.toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="py-2.5 pr-2 text-right tabular-nums">
                    {r.costFuel > 0 ? `Rp ${r.costFuel.toLocaleString("id-ID")}` : "-"}
                  </td>
                  <td className="py-2.5 pr-2 text-right text-red-600 dark:text-red-400 tabular-nums">
                    Rp {r.totalCost.toLocaleString("id-ID")}
                  </td>
                  <td className="py-2.5 pr-2 text-right tabular-nums">
                    <span className={r.netProfit >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600"}>
                      Rp {r.netProfit.toLocaleString("id-ID")}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <Badge className={cn("text-[10px]", r.marginPercent >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300")}>
                      {r.marginPercent.toFixed(1)}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {sorted.length === 0 && (
        <Card size="sm">
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-sm">Tidak ada aktivitas dalam periode ini.</p>
          </CardContent>
        </Card>
      )}

      {driverSummaries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold tracking-tight">Ringkasan Per Sopir</h2>
          <Card size="sm" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground bg-muted/50">
                    <th className="py-2.5 pl-4 pr-2 font-medium text-xs uppercase tracking-wider">Sopir</th>
                    <th className="py-2.5 pr-2 font-medium text-xs uppercase tracking-wider text-right">Total KM</th>
                    <th className="py-2.5 pr-2 font-medium text-xs uppercase tracking-wider text-right">Hari</th>
                    <th className="py-2.5 pr-4 font-medium text-xs uppercase tracking-wider text-right">Rata2/Hari</th>
                  </tr>
                </thead>
                <tbody>
                  {driverSummaries.map((d) => (
                    <tr key={d.driverId} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pl-4 pr-2 font-medium">{d.driverName}</td>
                      <td className="py-2.5 pr-2 text-right tabular-nums">{d.totalKm || "-"}</td>
                      <td className="py-2.5 pr-2 text-right tabular-nums">{d.totalDays}</td>
                      <td className="py-2.5 pr-4 text-right text-emerald-600 dark:text-emerald-400 tabular-nums">
                        Rp {d.avgDailyRevenue.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
