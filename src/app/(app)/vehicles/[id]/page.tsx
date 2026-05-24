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
import { cn } from "@/lib/utils";
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="sr-only">Detail Kendaraan</h1>
        <RefreshButton />
      </div>

      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">{vehicle.plate}</CardTitle>
          {vehicle.name && (
            <p className="text-muted-foreground text-sm">{vehicle.name}</p>
          )}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {kirStatus && (
            <Badge className={cn("text-xs", getStatusColor(kirStatus))}>
              KIR: {getStatusLabel(kirStatus)}{" "}
              {latestKir && `(${formatDate(new Date(latestKir.endDate))})`}
            </Badge>
          )}
          {serviceStatus && (
            <Badge className={cn("text-xs", getStatusColor(serviceStatus))}>
              Servis: {getStatusLabel(serviceStatus)}{" "}
              {latestService &&
                `(${formatDate(new Date(latestService.nextServiceDate))})`}
            </Badge>
          )}
          {stnkStatus && (
            <Badge className={cn("text-xs", getStatusColor(stnkStatus))}>
              STNK: {getStatusLabel(stnkStatus)}{" "}
              {latestStnk && `(${formatDate(new Date(latestStnk.endDate))})`}
            </Badge>
          )}
        </CardContent>
      </Card>

      {ledgerEntries.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card size="sm" className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />
            <CardContent className="p-3 text-center">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Pendapatan 30 Hari</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 tabular-nums">
                Rp {totalRevenue.toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>
          <Card size="sm" className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500" />
            <CardContent className="p-3 text-center">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Pengeluaran</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400 mt-0.5 tabular-nums">
                Rp {totalExpenses.toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>
          <Card size="sm" className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
            <CardContent className="p-3 text-center">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Bersih</div>
              <div className={cn("text-lg font-bold mt-0.5 tabular-nums", totalRevenue - totalExpenses >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600")}>
                Rp {(totalRevenue - totalExpenses).toLocaleString("id-ID")}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <DriverAssignmentSection
        vehicleId={vehicle.id}
        drivers={driverList}
        assignments={assignments}
        assignAction={assignDriver}
        removeAction={removeAssignment}
      />

      <KirFormSection vehicleId={vehicle.id} action={addKirRecord} />

      <StnkFormSection vehicleId={vehicle.id} action={addStnk} />

      <ServiceFormSection vehicleId={vehicle.id} action={addServiceRecord} />

      <LedgerFormSection vehicleId={vehicle.id} drivers={driverList} action={addLedger} ratePerKm={ratePerKm} />

      <PartFormSection vehicleId={vehicle.id} action={addPart} />

      <KirHistorySection
        records={vehicle.kirRecords}
        deleteAction={deleteKir}
      />

      <StnkHistorySection
        records={vehicle.stnkRecords || []}
        deleteAction={deleteStnk}
      />

      <ServiceHistorySection
        records={vehicle.serviceRecords}
        deleteAction={deleteService}
      />

      <LedgerHistorySection entries={ledgerEntries} driverNameByDate={driverNameByDate} deleteAction={deleteLedger} />

      <PartHistorySection parts={partList} deleteAction={deletePart} />
    </div>
  );
}
