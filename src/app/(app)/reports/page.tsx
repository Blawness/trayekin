import { getVehicles } from "@/lib/actions/vehicles";
import { getLedgerEntries } from "@/lib/actions/ledger";
import { getPartReplacements } from "@/lib/actions/parts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLLING_WINDOW_DAYS } from "@/lib/utils/status";

export default async function ReportsPage() {
  const vehicles = await getVehicles();

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="font-medium">Belum ada data kendaraan.</p>
        <p className="text-sm">Tambah kendaraan untuk melihat laporan.</p>
      </div>
    );
  }

  // Fetch ledger for each vehicle (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const vehicleReports = await Promise.all(
    vehicles.map(async (v) => {
      const entries = await getLedgerEntries(v.id);
      const parts = await getPartReplacements(v.id);
      const recent = entries.filter((e) => new Date(e.date) >= thirtyDaysAgo);
      const revenue = recent.reduce((s, e) => s + e.revenue, 0);
      const expenses = recent.reduce((s, e) => s + e.expenses, 0);
      const totalPartCost = parts.reduce((s, p) => s + p.cost, 0);
      return {
        plate: v.plate,
        name: v.name || "Tanpa nama",
        id: v.id,
        revenue,
        expenses,
        net: revenue - expenses,
        daysRecorded: recent.length,
        totalPartCost,
      };
    })
  );

  const totalFleetRevenue = vehicleReports.reduce((s, r) => s + r.revenue, 0);
  const totalFleetExpenses = vehicleReports.reduce((s, r) => s + r.expenses, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Laporan Armada</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground">Total Pendapatan (30 Hari)</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              Rp {totalFleetRevenue.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-muted-foreground">Total Pengeluaran (30 Hari)</div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              Rp {totalFleetExpenses.toLocaleString("id-ID")}
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="font-semibold text-sm text-muted-foreground">PER KENDARAAN</h2>

      <div className="space-y-3">
        {vehicleReports.map((r) => (
          <Card key={r.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold">{r.plate}</div>
                  <div className="text-xs text-muted-foreground">{r.name}</div>
                </div>
                {r.net >= 0 ? (
                  <Badge className="bg-green-100 text-green-700">Untung</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700">Rugi</Badge>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xs text-muted-foreground">Pendapatan</div>
                  <div className="text-sm font-semibold text-green-600">
                    Rp {r.revenue.toLocaleString("id-ID")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Pengeluaran</div>
                  <div className="text-sm font-semibold text-red-600">
                    Rp {r.expenses.toLocaleString("id-ID")}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Bersih</div>
                  <div className={`text-sm font-semibold ${r.net >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    Rp {r.net.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                {r.daysRecorded} hari tercatat · Suku Cadang: Rp {r.totalPartCost.toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
