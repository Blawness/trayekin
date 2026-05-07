import { getDrivers } from "@/lib/actions/drivers";
import { DriversList } from "@/components/drivers-list";

export default async function DriversPage() {
  const driverList = await getDrivers();
  return <DriversList drivers={driverList} />;
}
