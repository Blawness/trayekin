import { getVehicle } from "@/lib/actions/vehicles";
import { addKirRecord as addKirRecordAction } from "@/lib/actions/kir";
import { addServiceRecord as addServiceRecordAction } from "@/lib/actions/service";
import { addStnkRecord } from "@/lib/actions/stnk";
import { addLedgerEntry, getLedgerEntries } from "@/lib/actions/ledger";
import { addPartReplacement, getPartReplacements } from "@/lib/actions/parts";
import { getStatus, getStatusLabel, getStatusColor, formatDate } from "@/lib/utils/status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshButton } from "@/components/refresh-button";
import { notFound } from "next/navigation";

async function addKirRecord(formData: FormData) {
  "use server";
  await addKirRecordAction(formData);
}

async function addServiceRecord(formData: FormData) {
  "use server";
  await addServiceRecordAction(formData);
}

async function addStnk(formData: FormData) {
  "use server";
  await addStnkRecord(formData);
}

async function addLedger(formData: FormData) {
  "use server";
  await addLedgerEntry(formData);
}

async function addPart(formData: FormData) {
  "use server";
  await addPartReplacement(formData);
}

const STNK_LABELS: Record<string, string> = {
  tahunan: "Tahunan",
  lima_tahunan: "5 Tahunan",
  asuransi: "Asuransi",
};

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicle(id);
  if (!vehicle) notFound();

  const [ledgerEntries, partList] = await Promise.all([
    getLedgerEntries(id),
    getPartReplacements(id),
  ]);

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
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
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

      {/* KIR Form */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-base">Catat KIR Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addKirRecord} className="flex gap-2 items-end">
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <div className="flex-1 space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai KIR</Label>
              <Input id="startDate" name="startDate" type="date" required />
            </div>
            <Button type="submit" size="sm">Simpan</Button>
          </form>
        </CardContent>
      </Card>

      {/* STNK Form */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-base">Catat STNK / Asuransi</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addStnk} className="space-y-3">
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <div className="space-y-2">
              <Label htmlFor="stnkType">Jenis</Label>
              <select
                id="stnkType"
                name="stnkType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="tahunan">Pajak Tahunan</option>
                <option value="lima_tahunan">Pajak 5 Tahunan</option>
                <option value="asuransi">Asuransi</option>
              </select>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="stnkStartDate">Tanggal Mulai</Label>
                <Input id="stnkStartDate" name="startDate" type="date" required />
              </div>
              <Button type="submit" size="sm">Simpan</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Service Form */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-base">Catat Servis Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addServiceRecord} className="space-y-3">
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <div className="space-y-2">
              <Label htmlFor="serviceDate">Tanggal Servis</Label>
              <Input id="serviceDate" name="serviceDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Jenis Servis</Label>
              <select
                id="type"
                name="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="rutin">Rutin</option>
                <option value="besar">Besar</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Input id="notes" name="notes" placeholder="Ganti oli, rem, dll." />
            </div>
            <Button type="submit" size="sm">Simpan</Button>
          </form>
        </CardContent>
      </Card>

      {/* Setoran Harian */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-base">Catat Setoran Harian</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addLedger} className="space-y-3">
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <div className="space-y-2">
              <Label htmlFor="ledgerDate">Tanggal</Label>
              <Input id="ledgerDate" name="date" type="date" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="revenue">Pendapatan (Rp)</Label>
                <Input id="revenue" name="revenue" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenses">Pengeluaran (Rp)</Label>
                <Input id="expenses" name="expenses" type="number" placeholder="0" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ledgerNotes">Catatan</Label>
              <Input id="ledgerNotes" name="notes" placeholder="Supir, BBM, parkir..." />
            </div>
            <Button type="submit" size="sm">Simpan</Button>
          </form>
        </CardContent>
      </Card>

      {/* Ganti Suku Cadang */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-base">Catat Ganti Suku Cadang</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addPart} className="space-y-3">
            <input type="hidden" name="vehicleId" value={vehicle.id} />
            <div className="space-y-2">
              <Label htmlFor="partName">Nama Suku Cadang *</Label>
              <Input id="partName" name="partName" placeholder="Kampas rem, ban, aki..." required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="partDate">Tanggal Ganti</Label>
                <Input id="partDate" name="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Biaya (Rp)</Label>
                <Input id="cost" name="cost" type="number" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="odometer">Kilometer</Label>
                <Input id="odometer" name="odometer" type="number" placeholder="KM" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lifespanMonths">Umur Pakai (bulan)</Label>
                <Input id="lifespanMonths" name="lifespanMonths" type="number" placeholder="Contoh: 6" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="partNotes">Catatan</Label>
              <Input id="partNotes" name="notes" placeholder="Merk, toko..." />
            </div>
            <Button type="submit" size="sm">Simpan</Button>
          </form>
        </CardContent>
      </Card>

      {/* KIR History */}
      {vehicle.kirRecords.length > 0 && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Riwayat KIR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vehicle.kirRecords.map((r) => (
                <div key={r.id} className="flex justify-between text-sm border-b pb-2">
                  <span>
                    {formatDate(new Date(r.startDate))} — {formatDate(new Date(r.endDate))}
                  </span>
                  <Badge className={getStatusColor(getStatus(new Date(r.endDate)))}>
                    {getStatusLabel(getStatus(new Date(r.endDate)))}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* STNK History */}
      {vehicle.stnkRecords && vehicle.stnkRecords.length > 0 && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Riwayat STNK</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vehicle.stnkRecords.map((r) => (
                <div key={r.id} className="flex justify-between text-sm border-b pb-2">
                  <div>
                    <div>{STNK_LABELS[r.type] || r.type}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(new Date(r.startDate))} — {formatDate(new Date(r.endDate))}
                    </div>
                  </div>
                  <Badge className={getStatusColor(getStatus(new Date(r.endDate)))}>
                    {getStatusLabel(getStatus(new Date(r.endDate)))}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service History */}
      {vehicle.serviceRecords.length > 0 && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Riwayat Servis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vehicle.serviceRecords.map((r) => (
                <div key={r.id} className="flex justify-between text-sm border-b pb-2">
                  <div>
                    <div>{formatDate(new Date(r.serviceDate))}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.type} {r.notes && `— ${r.notes}`}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Berikutnya: {formatDate(new Date(r.nextServiceDate))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setoran History */}
      {ledgerEntries.length > 0 && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Riwayat Setoran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ledgerEntries.slice(0, 30).map((e) => (
                <div key={e.id} className="flex justify-between text-sm border-b pb-2">
                  <div>
                    <div>{formatDate(new Date(e.date))}</div>
                    {e.notes && <div className="text-xs text-muted-foreground">{e.notes}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-green-600">+Rp {e.revenue.toLocaleString("id-ID")}</div>
                    {e.expenses > 0 && (
                      <div className="text-red-600 text-xs">-Rp {e.expenses.toLocaleString("id-ID")}</div>
                    )}
                    {e.expenses === 0 && e.revenue === 0 && (
                      <div className="text-xs text-muted-foreground">Rp 0</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parts History */}
      {partList.length > 0 && (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-base">Riwayat Suku Cadang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {partList.map((p) => {
                const dueStatus = p.nextReplaceDate
                  ? getStatus(new Date(p.nextReplaceDate))
                  : null;
                return (
                  <div key={p.id} className="flex justify-between text-sm border-b pb-2">
                    <div>
                      <div className="font-medium">{p.partName}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(new Date(p.date))}
                        {p.odometer && ` · ${p.odometer.toLocaleString("id-ID")} KM`}
                        {p.cost > 0 && ` · Rp ${p.cost.toLocaleString("id-ID")}`}
                      </div>
                      {p.notes && (
                        <div className="text-xs text-muted-foreground">{p.notes}</div>
                      )}
                    </div>
                    <div className="text-right text-xs">
                      {p.lifespanMonths && (
                        <div className="text-muted-foreground">
                          Umur: {p.lifespanMonths} bln
                        </div>
                      )}
                      {p.nextReplaceDate && dueStatus && (
                        <Badge className={`mt-0.5 ${getStatusColor(dueStatus)}`}>
                          {getStatusLabel(dueStatus)}: {formatDate(new Date(p.nextReplaceDate))}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
