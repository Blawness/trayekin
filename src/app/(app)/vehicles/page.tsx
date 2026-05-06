import { getVehicles } from "@/lib/actions/vehicles";
import { VehicleList } from "@/components/vehicle-list";

export default async function VehiclesPage() {
  const vehicleList = await getVehicles();
  return <VehicleList vehicles={vehicleList} />;
}
