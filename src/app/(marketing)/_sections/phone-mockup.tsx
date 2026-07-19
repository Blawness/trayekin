import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const UNIT_CONTOH = [
  { plat: "B 1234 XYZ", info: "KIR jatuh tempo 12 hari lagi", status: "mendekati" as const },
  { plat: "B 5678 ABC", info: "STNK terlambat 3 hari", status: "terlambat" as const },
  { plat: "B 9012 DEF", info: "Semua dokumen aman", status: "aman" as const },
];

// Keluarga warna mengikuti getStatusColor() di src/lib/utils/status.ts supaya
// mockup benar-benar menyerupai tampilan aplikasi. Varian dark ditambahkan di
// sini karena landing page mendukung dua tema, sedangkan badge di dalam
// aplikasi belum.
const GAYA_STATUS = {
  aman: { kelas: "text-green-700 dark:text-green-400", Ikon: CheckCircle2 },
  mendekati: { kelas: "text-yellow-700 dark:text-yellow-400", Ikon: Clock },
  terlambat: { kelas: "text-red-700 dark:text-red-400", Ikon: AlertTriangle },
};

export function PhoneMockup() {
  return (
    <div
      aria-hidden="true"
      className="w-[260px] rounded-[2rem] border-8 border-foreground/85 bg-background shadow-2xl shadow-primary/10 sm:w-[280px]"
    >
      <div className="space-y-3 rounded-[1.4rem] p-4">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm font-bold text-primary">Trayekin</span>
          <span className="text-[10px] text-muted-foreground">3 kendaraan</span>
        </div>

        {UNIT_CONTOH.map((unit) => {
          const { kelas, Ikon } = GAYA_STATUS[unit.status];
          return (
            <div key={unit.plat} className="rounded-lg border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{unit.plat}</span>
                <Ikon className={`h-3.5 w-3.5 ${kelas}`} />
              </div>
              <p className={`mt-1 text-[11px] ${kelas}`}>{unit.info}</p>
            </div>
          );
        })}

        <div className="rounded-lg bg-primary/10 p-3">
          <p className="text-[10px] text-muted-foreground">Untung bersih bulan ini</p>
          <p className="text-lg font-bold text-primary">Rp 4.850.000</p>
        </div>
      </div>
    </div>
  );
}
