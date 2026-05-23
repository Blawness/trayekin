import { getVehicle } from "@/lib/actions/vehicles";
import { addKirRecord as addKirRecordAction, deleteKirRecord as deleteKirRecordAction } from "@/lib/actions/kir";
import { addServiceRecord as addServiceRecordAction, deleteServiceRecord as deleteServiceRecordAction } from "@/lib/actions/service";
import { addStnkRecord, deleteStnkRecord as deleteStnkRecordAction } from "@/lib/actions/stnk";
import { addLedgerEntry, getLedgerEntries, deleteLedgerEntry as deleteLedgerEntryAction } from "@/lib/actions/ledger";
import { addPartReplacement, getPartReplacements, deletePartReplacement as deletePartReplacementAction } from "@/lib/actions/parts";
import { getDrivers } from "@/lib/actions/drivers";
import { getAppSettings } from "@/lib/actions/settings";
import {
  assignDriver as assignDriverAction,
  removeAssignment as removeAssignmentAction,
  getAssignmentsForVehicle,
} from "@/lib/actions/driverAssignments";
import { getStatus, getStatusLabel, getStatusColor, formatDate, ROLLING_WINDOW_DAYS } from "@/lib/utils/status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshButton } from "@/components/refresh-button";
import { KirFormSection } from "./_sections/kir-form";
import { StnkFormSection } from "./_sections/stnk-form";
import { ServiceFormSection } from "./_sections/service-form";
import { LedgerFormSection } from "./_sections/ledger-form";
import { PartFormSection } from "./_sections/part-form";
import { LedgerHistorySection } from "./_sections/ledger-history";
import { PartHistorySection } from "./_sections/part-history";
import { KirHistorySection } from "./_sections/kir-history";
import { StnkHistorySection } from "./_sections/stnk-history";
import { ServiceHistorySection } from "./_sections/service-history";
import { DriverAssignmentSection } from "./_sections/driver-assignment";
import { notFound } from "next/navigation";

async function addKirRecord(formData: FormData) {
  "use server";
  return addKirRecordAction(formData);
}

async function addServiceRecord(formData: FormData) {
  "use server";
  return addServiceRecordAction(formData);
}

async function addStnk(formData: FormData) {
  "use server";
  return addStnkRecord(formData);
}

async function addLedger(formData: FormData) {
  "use server";
  return addLedgerEntry(formData);
}

async function addPart(formData: FormData) {
  "use server";
  return addPartReplacement(formData);
}

async function assignDriver(formData: FormData) {
  "use server";
  const driverId = formData.get("driverId") as string;
  const vehicleId = formData.get("vehicleId") as string;
  const date = formData.get("date") as string;
  return assignDriverAction(driverId, vehicleId, date);
}

async function removeAssignment(formData: FormData) {
  "use server";
  const assignmentId = formData.get("assignmentId") as string;
  return removeAssignmentAction(assignmentId);
}

async function deleteKir(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  return deleteKirRecordAction(id);
}

async function deleteStnk(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  return deleteStnkRecordAction(id);
}

async function deleteService(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  return deleteServiceRecordAction(id);
}

async function deleteLedger(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  return deleteLedgerEntryAction(id);
}

async function deletePart(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  return deletePartReplacementAction(id);
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) notFound();

  const [ledgerEntries, partList, driverList, settingsList, assignments] = await Promise.all([
    getLedgerEntries(id),
    getPartReplacements(id),
    getDrivers(),
    getAppSettings(),
    getAssignmentsForVehicle(id),
  ]);

  const driverNameByDate: Record<string, string> = {};
  for (const a of assignments) {
    driverNameByDate[a.date] = a.driverName;
  }

  const settingsMap = Object.fromEntries(settingsList.map((s) => [s.key, s.value]));
  const ratePerKm = parseInt(settingsMap["rate_per_km"] || "4500", 10);

  const latestKir = vehicle.kirRecords[0];
  const latestService = vehicle.serviceRecords[0];
  const latestStnk = vehicle.stnkRecords?.[0];
  const kirStatus = latestKir ? getStatus(new Date(latestKir.endDate)) : null;
  const serviceStatus = latestService
    ? getStatus(new Date(latestService.nextServiceDate))
    : null;
  const stnkStatus = latestStnk ? getStatus(new Date(latestStnk.endDate)) : null;

  // Ledger summary (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - ROLLING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const recentLedger = ledgerEntries.filter(
    (e) => new Date(e.date) >= thirtyDaysAgo
  );
  const totalRevenue = recentLedger.reduce((s, e) => s + e.revenue, 0);
  const totalExpenses = recentLedger.reduce((s, e) => s + e.expenses, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="sr-only">Detail Kendaraan</h1>
        <RefreshButton />
      </div>

      {/* Vehicle Info */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-2xl">{vehicle.plate}</CardTitle>
          {vehicle.name && (
            <p className="text-muted-foreground">{vehicle.name}</p>
          )}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {kirStatus && (
            <Badge className={getStatusColor(kirStatus)}>
              KIR: {getStatusLabel(kirStatus)}{" "}
              {latestKir && `(${formatDate(new Date(latestKir.endDate))})`}
            </Badge>
          )}
          {serviceStatus && (
            <Badge className={getStatusColor(serviceStatus)}>
              Servis: {getStatusLabel(serviceStatus)}{" "}
              {latestService &&
                `(${formatDate(new Date(latestService.nextServiceDate))})`}
            </Badge>
          )}
          {stnkStatus && (
            <Badge className={getStatusColor(stnkStatus)}>
              STNK: {getStatusLabel(stnkStatus)}{" "}
              {latestStnk && `(${formatDate(new Date(latestStnk.endDate))})`}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Setoran Ringkasan */}
      {ledgerEntries.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Pendapatan 30 Hari</div>
              <div className="text-lg font-bold text-green-600">
                Rp {totalRevenue.toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Pengeluaran</div>
              <div className="text-lg font-bold text-red-600">
                Rp {totalExpenses.toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-3 text-center">
              <div className="text-xs text-muted-foreground">Bersih</div>
              <div className={`text-lg font-bold ${totalRevenue - totalExpenses >= 0 ? "text-blue-600" : "text-red-600"}`}>
                Rp {(totalRevenue - totalExpenses).toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Penugasan Sopir */}
      <DriverAssignmentSection
        vehicleId={vehicle.id}
        drivers={driverList}
        assignments={assignments}
        assignAction={assignDriver}
        removeAction={removeAssignment}
      />

      {/* KIR Form */}
      <KirFormSection vehicleId={vehicle.id} action={addKirRecord} />

      {/* STNK Form */}
      <StnkFormSection vehicleId={vehicle.id} action={addStnk} />

      {/* Service Form */}
      <ServiceFormSection vehicleId={vehicle.id} action={addServiceRecord} />

      {/* Setoran Harian */}
      <LedgerFormSection vehicleId={vehicle.id} drivers={driverList} action={addLedger} ratePerKm={ratePerKm} />

      {/* Ganti Suku Cadang */}
      <PartFormSection vehicleId={vehicle.id} action={addPart} />

      {/* KIR History */}
      <KirHistorySection
        records={vehicle.kirRecords}
        deleteAction={deleteKir}
      />

      {/* STNK History */}
      <StnkHistorySection
        records={vehicle.stnkRecords || []}
        deleteAction={deleteStnk}
      />

      {/* Service History */}
      <ServiceHistorySection
        records={vehicle.serviceRecords}
        deleteAction={deleteService}
      />

      {/* Setoran History */}
      <LedgerHistorySection entries={ledgerEntries} driverNameByDate={driverNameByDate} deleteAction={deleteLedger} />

      {/* Parts History */}
      <PartHistorySection parts={partList} deleteAction={deletePart} />
    </div>
  );
}
