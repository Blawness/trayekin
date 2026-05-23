import { getAppSettings } from "@/lib/actions/settings";
import { SettingsForm } from "@/components/settings-form";
import { db } from "@/lib/db";
import { cronLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SettingsPage() {
  const settings = await getAppSettings();
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const logs = await db
    .select()
    .from(cronLogs)
    .orderBy(desc(cronLogs.runAt))
    .limit(7);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Pengaturan</h1>
      <SettingsForm
        ratePerKm={settingsMap["rate_per_km"] || "4500"}
        fuelPrice={settingsMap["fuel_price_per_liter"] || "10000"}
        fuelConsumption={settingsMap["fuel_consumption_km_per_l"] || "10"}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log Cron (7 Run Terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada data log cron.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 pr-3 font-medium text-muted-foreground">Waktu</th>
                    <th className="pb-2 pr-3 font-medium text-muted-foreground">Status</th>
                    <th className="pb-2 pr-3 font-medium text-muted-foreground">Data Diproses</th>
                    <th className="pb-2 font-medium text-muted-foreground">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">
                        {log.runAt.toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2 pr-3">
                        <Badge
                          variant="secondary"
                          className={
                            log.status === "success"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }
                        >
                          {log.status === "success" ? "Berhasil" : "Gagal"}
                        </Badge>
                      </td>
                      <td className="py-2 pr-3">
                        {log.recordsProcessed ?? "-"}
                      </td>
                      <td className="py-2 text-red-600 dark:text-red-400 max-w-48 truncate">
                        {log.errorMessage ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
