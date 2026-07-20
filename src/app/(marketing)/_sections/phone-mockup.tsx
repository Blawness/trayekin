import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const UNIT_CONTOH = [
  { plat: "B 1234 XYZ", info: "KIR jatuh tempo 12 hari lagi", status: "mendekati" as const },
  { plat: "B 5678 ABC", info: "STNK terlambat 3 hari", status: "terlambat" as const },
  { plat: "B 9012 DEF", info: "Semua dokumen aman", status: "aman" as const },
];

const GAYA_STATUS = {
  aman: { kelas: "text-[oklch(0.75_0.16_155)]", Ikon: CheckCircle2 },
  mendekati: { kelas: "text-[oklch(0.8_0.15_85)]", Ikon: Clock },
  terlambat: { kelas: "text-[oklch(0.7_0.18_25)]", Ikon: AlertTriangle },
};

export function PhoneMockup() {
  return (
    <div
      aria-hidden="true"
      className="relative w-[264px] rounded-[2.4rem] border border-white/10 bg-[oklch(0.18_0.02_255/0.9)] p-2.5 shadow-[0_30px_60px_-15px_oklch(0.7_0.16_250/0.45)] backdrop-blur-xl sm:w-[286px]"
    >
      {/* screen sheen */}
      <div className="pointer-events-none absolute inset-0 rounded-[2.4rem] bg-gradient-to-b from-white/10 to-transparent" />
      <div className="relative space-y-3 rounded-[1.9rem] bg-[oklch(0.14_0.02_255)] p-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <span className="text-sm font-bold text-[oklch(0.78_0.15_200)]">
            Trayekin
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70">
            3 kendaraan
          </span>
        </div>

        {UNIT_CONTOH.map((unit) => {
          const { kelas, Ikon } = GAYA_STATUS[unit.status];
          return (
            <div
              key={unit.plat}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/90">
                  {unit.plat}
                </span>
                <Ikon className={`h-3.5 w-3.5 ${kelas}`} />
              </div>
              <p className={`mt-1 text-[11px] ${kelas}`}>{unit.info}</p>
            </div>
          );
        })}

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[oklch(0.7_0.16_250/0.35)] to-[oklch(0.78_0.15_200/0.3)] p-3">
          <div className="mkt-beam" />
          <p className="text-[10px] text-white/70">Untung bersih bulan ini</p>
          <p className="text-lg font-bold text-white">Rp 4.850.000</p>
        </div>
      </div>
    </div>
  );
}
