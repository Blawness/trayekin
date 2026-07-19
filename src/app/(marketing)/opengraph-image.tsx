import { ImageResponse } from "next/og";

export const alt = "Trayekin — Kelola angkot dari HP";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, color: "#1d4ed8" }}>
          Trayekin
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.15,
            color: "#0f172a",
          }}
        >
          Tau nggak unit mana yang bikin Anda rugi?
        </div>
        <div style={{ marginTop: 28, fontSize: 32, color: "#475569" }}>
          Pengingat KIR &amp; STNK otomatis + buku kas harian per angkot
        </div>
      </div>
    ),
    size,
  );
}
