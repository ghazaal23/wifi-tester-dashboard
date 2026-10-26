// components/dashboard/StatCard.tsx
import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string
  unit?: string
  icon: LucideIcon
  /** Persentase perubahan. Positif/negatif ditentukan oleh trendDirection, bukan sekadar tanda angka. */
  trendValue?: number
  /** "up-good" = naik itu bagus (misal download speed). "up-bad" = naik itu buruk (misal ping/packet loss). */
  trendDirection?: "up-good" | "up-bad"
  accentColor?: "emerald" | "amber" | "red" | "slate"
}

const ACCENT_BORDER: Record<string, string> = {
  emerald: "border-l-emerald-500",
  amber: "border-l-amber-500",
  red: "border-l-red-500",
  slate: "border-l-slate-300",
}

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trendValue,
  trendDirection = "up-good",
  accentColor = "slate",
}: StatCardProps) {
  const isPositiveTrend =
    trendValue !== undefined &&
    (trendDirection === "up-good" ? trendValue >= 0 : trendValue < 0)

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 border-l-4 bg-white p-4 shadow-sm",
        ACCENT_BORDER[accentColor]
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <Icon className="h-4 w-4 text-slate-400" />
      </div>

      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-slate-400">{unit}</span>}
      </p>

      {trendValue !== undefined && (
        <div
          className={cn(
            "mt-1.5 flex items-center gap-1 text-xs font-medium",
            isPositiveTrend ? "text-emerald-600" : "text-red-600"
          )}
        >
          {trendValue >= 0 ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {Math.abs(trendValue)}% vs periode sebelumnya
        </div>
      )}
    </div>
  )
}
