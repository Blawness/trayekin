import { createDriver } from "@/lib/actions/drivers";
import { DriverForm } from "@/components/driver-form";

export default function NewDriverPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Tambah Sopir</h1>
      <DriverForm action={createDriver} />
    </div>
  );
}
