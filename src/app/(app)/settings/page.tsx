import { getAppSettings } from "@/lib/actions/settings";
import { SettingsForm } from "@/components/settings-form";

export default async function SettingsPage() {
  const settings = await getAppSettings();
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Pengaturan</h1>
      <SettingsForm
        ratePerKm={settingsMap["rate_per_km"] || "4500"}
        fuelPrice={settingsMap["fuel_price_per_liter"] || "10000"}
        fuelConsumption={settingsMap["fuel_consumption_km_per_l"] || "10"}
      />
    </div>
  );
}
