import { getVehicles } from "@/lib/actions/vehicles";
import { DashboardContent } from "@/components/dashboard-content";

export default async function DashboardPage() {
  const vehicles = await getVehicles();
  return <DashboardContent vehicles={vehicles} />;
}
