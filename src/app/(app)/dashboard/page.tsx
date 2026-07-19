import { getVehicles } from "@/lib/actions/vehicles";
import { DashboardContent } from "@/components/dashboard-content";
import { db } from "@/lib/db";
import { cronLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export default async function DashboardPage() {
  const vehicles = await getVehicles();

  const [latestLog] = await db
    .select()
    .from(cronLogs)
    .orderBy(desc(cronLogs.runAt))
    .limit(1);

  let showCronWarning = false;
  if (!latestLog) {
    showCronWarning = true;
  } else {
    const hoursSince = (new Date().getTime() - latestLog.runAt.getTime()) / (1000 * 60 * 60);
    if (latestLog.status === "failed" || hoursSince > 25) {
      showCronWarning = true;
    }
  }

  return (
    <DashboardContent vehicles={vehicles} showCronWarning={showCronWarning} />
  );
}
