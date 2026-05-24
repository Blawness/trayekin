import { getAppSettings } from "@/lib/actions/settings";
import { SettingsForm } from "@/components/settings-form";
import { db } from "@/lib/db";
import { cronLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default async function SettingsPage() {
  const settings = await getAppSettings();
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const logs = await db
    .select()
    .from(cronLogs)
    .orderBy(desc(cronLogs.runAt))
    .limit(7);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold tracking-tight">Pengaturan</h1>
      <SettingsForm
        ratePerKm={settingsMap["rate_per_km"] || "4500"}
        fuelPrice={settingsMap["fuel_price_per_liter"] || "10000"}
        fuelConsumption={settingsMap["fuel_consumption_km_per_l"] || "10"}
      />
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">Log Cron (7 Run Terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Belum ada data log cron.</p>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:-mx-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2.5 pl-4 pr-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Waktu</th>
                    <th className="pb-2.5 pr-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="pb-2.5 pr-3 font-medium text-xs text-muted-foreground uppercase tracking-wider">Data</th>
                    <th className="pb-2.5 pr-4 font-medium text-xs text-muted-foreground uppercase tracking-wider">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-0">
                      <td className="py-2.5 pl-4 pr-3 whitespace-nowrap text-muted-foreground text-xs">
                        {log.runAt.toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2.5 pr-3">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] h-5",
                            log.status === "success"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                          )}
                        >
                          {log.status === "success" ? "Berhasil" : "Gagal"}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-3 text-xs tabular-nums">
                        {log.recordsProcessed ?? "-"}
                      </td>
                      <td className="py-2.5 pr-4 text-red-600 dark:text-red-400 max-w-48 truncate text-xs">
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
