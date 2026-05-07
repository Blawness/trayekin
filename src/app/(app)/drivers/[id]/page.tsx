import { getDriver } from "@/lib/actions/drivers";
import { getLedgerEntriesByDriver } from "@/lib/actions/ledger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshButton } from "@/components/refresh-button";
import { formatDate } from "@/lib/utils/status";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ id: string }> };

export default async function DriverDetailPage({ params }: PageProps) {
  const { id } = await params;

  const driver = await getDriver(id);
  if (!driver) notFound();

  const ledgerEntries = await getLedgerEntriesByDriver(driver.id);
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentEntries = ledgerEntries.filter(
    (e) => new Date(e.date) >= thirtyDaysAgo
  );
  const totalRevenue = recentEntries.reduce((s, e) => s + e.revenue, 0);

  const simExpired =
    driver.simExpiry && new Date(driver.simExpiry) < new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="sr-only">Detail Sopir</h1>
        <RefreshButton />
      </div>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-2xl">{driver.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {driver.phone && (
            <div className="text-sm text-muted-foreground">
              {driver.phone}
            </div>
          )}
          {driver.simNumber && (
            <div className="flex items-center gap-2">
              <span className="text-sm">SIM: {driver.simNumber}</span>
              {driver.simExpiry && (
                <Badge
                  className={
                    simExpired
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }
                >
                  {simExpired
                    ? `Kadaluarsa ${formatDate(new Date(driver.simExpiry))}`
                    : `Berlaku s/d ${formatDate(new Date(driver.simExpiry))}`}
                </Badge>
              )}
            </div>
          )}
          {driver.notes && (
            <p className="text-sm text-muted-foreground">{driver.notes}</p>
          )}
        </CardContent>
      </Card>

      {ledgerEntries.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-muted-foreground">
                  Pendapatan 30 Hari
                </div>
                <div className="text-lg font-bold text-green-600">
                  Rp {totalRevenue.toLocaleString("id-ID")}
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-muted-foreground">
                  Hari Bekerja
                </div>
                <div className="text-lg font-bold">
                  {recentEntries.length}
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-3 text-center">
                <div className="text-xs text-muted-foreground">
                  Rata-rata/Hari
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {recentEntries.length > 0
                    ? `Rp ${Math.round(totalRevenue / recentEntries.length).toLocaleString("id-ID")}`
                    : "-"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-base">Riwayat Setoran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ledgerEntries.slice(0, 30).map((e) => (
                  <div
                    key={e.id}
                    className="flex justify-between text-sm border-b pb-2"
                  >
                    <div>
                      <div>{formatDate(new Date(e.date))}</div>
                      {e.notes && (
                        <div className="text-xs text-muted-foreground">
                          {e.notes}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-green-600">
                        +Rp {e.revenue.toLocaleString("id-ID")}
                      </div>
                      {e.expenses > 0 && (
                        <div className="text-red-600 text-xs">
                          -Rp {e.expenses.toLocaleString("id-ID")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
