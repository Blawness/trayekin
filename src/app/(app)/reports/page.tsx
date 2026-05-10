import { getProfitabilityReport } from "@/lib/actions/profitability";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      <div className="text-center py-20 text-muted-foreground">
        <p className="font-medium">Belum ada data kendaraan.</p>
        <p className="text-sm">Tambah kendaraan untuk melihat laporan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Laporan Profitabilitas</h1>

      {/* Period Selector */}
      <div className="flex gap-2">
        {periods.map((p) => (
          <Link
            key={p.value}
            href={`/reports?period=${p.value}&sort=${sortKey}&dir=${sortDir}`}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              period === p.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:bg-muted"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground">Total Pendapatan</div>
            <div className="text-xl font-bold text-green-600 mt-1">
              Rp {totalRevenue.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground">Total Biaya</div>
            <div className="text-xl font-bold text-red-600 mt-1">
              Rp {totalCost.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground">Fleet Margin</div>
            <div className={`text-xl font-bold mt-1 ${fleetMargin >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {fleetMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Vehicle Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="pb-2 pr-2">
                <Link href={sortUrl("plate")} className="hover:text-foreground">
                  Plat {sortIndicator("plate")}
                </Link>
              </th>
              <th className="pb-2 pr-2 text-right">KM</th>
              <th className="pb-2 pr-2 text-right">
                <Link href={sortUrl("revenue")} className="hover:text-foreground">
                  Pendapatan {sortIndicator("revenue")}
                </Link>
              </th>
              <th className="pb-2 pr-2 text-right">Service</th>
              <th className="pb-2 pr-2 text-right">Parts</th>
              <th className="pb-2 pr-2 text-right">KIR</th>
              <th className="pb-2 pr-2 text-right">STNK</th>
              <th className="pb-2 pr-2 text-right">BBM</th>
              <th className="pb-2 pr-2 text-right">
                <Link href={sortUrl("totalCost")} className="hover:text-foreground">
                  Total Biaya {sortIndicator("totalCost")}
                </Link>
              </th>
              <th className="pb-2 pr-2 text-right">
                <Link href={sortUrl("netProfit")} className="hover:text-foreground">
                  Bersih {sortIndicator("netProfit")}
                </Link>
              </th>
              <th className="pb-2 text-right">
                <Link href={sortUrl("marginPercent")} className="hover:text-foreground">
                  Margin {sortIndicator("marginPercent")}
                </Link>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.vehicleId} className="border-b last:border-0">
                <td className="py-2 pr-2 font-medium">
                  <Link href={`/vehicles/${r.vehicleId}`} className="hover:underline">
                    {r.plate}
                  </Link>
                </td>
                <td className="py-2 pr-2 text-right">{r.totalKm || "-"}</td>
                <td className="py-2 pr-2 text-right text-green-600">
                  {r.revenue > 0 ? `Rp ${r.revenue.toLocaleString("id-ID")}` : "-"}
                </td>
                <td className="py-2 pr-2 text-right">
                  {r.costService > 0 ? `Rp ${r.costService.toLocaleString("id-ID")}` : "-"}
                </td>
                <td className="py-2 pr-2 text-right">
                  {r.costParts > 0 ? `Rp ${r.costParts.toLocaleString("id-ID")}` : "-"}
                </td>
                <td className="py-2 pr-2 text-right">
                  {r.costKir > 0 ? `Rp ${r.costKir.toLocaleString("id-ID")}` : "-"}
                </td>
                <td className="py-2 pr-2 text-right">
                  {r.costStnk > 0 ? `Rp ${r.costStnk.toLocaleString("id-ID")}` : "-"}
                </td>
                <td className="py-2 pr-2 text-right">
                  {r.costFuel > 0 ? `Rp ${r.costFuel.toLocaleString("id-ID")}` : "-"}
                </td>
                <td className="py-2 pr-2 text-right text-red-600">
                  Rp {r.totalCost.toLocaleString("id-ID")}
                </td>
                <td className="py-2 pr-2 text-right">
                  <span className={r.netProfit >= 0 ? "text-blue-600" : "text-red-600"}>
                    Rp {r.netProfit.toLocaleString("id-ID")}
                  </span>
                </td>
                <td className="py-2 text-right">
                  <Badge className={r.marginPercent >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {r.marginPercent.toFixed(1)}%
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Tidak ada aktivitas dalam periode ini.</p>
        </div>
      )}
    </div>
  );
}
