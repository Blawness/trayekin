import { createVehicle } from "@/lib/actions/vehicles";
import { VehicleForm } from "@/components/vehicle-form";

export default function NewVehiclePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Tambah Kendaraan</h1>
      <VehicleForm action={createVehicle} />
    </div>
  );
}
