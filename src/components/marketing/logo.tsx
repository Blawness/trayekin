import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="trayekin-g" x1="0" y1="0" x2="32" y2="32">
            <stop offset="0" stopColor="oklch(0.8 0.16 195)" />
            <stop offset="1" stopColor="oklch(0.7 0.16 250)" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="9" fill="url(#trayekin-g)" />
        <path
          d="M9 21c2.2 0 2.2-4 4.4-4s2.2 4 4.4 4 2.2-4 4.4-4"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="16" cy="9.5" r="2.6" fill="white" />
        <path
          d="M16 12v3"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-lg font-extrabold tracking-tight">Trayekin</span>
    </span>
  );
}
