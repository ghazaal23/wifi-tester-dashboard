// components/dashboard/DeviceOverviewCard.tsx
import { Wifi, Clock, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Device } from "@/lib/types"

interface DeviceOverviewCardProps {
  device: Device
}

const STATUS_CONFIG: Record<Device["status"], { label: string; badgeClass: string; dotClass: string }> = {
  active: { label: "Active", badgeClass: "bg-emerald-50 text-emerald-700", dotClass: "bg-emerald-500" },
  warning: { label: "Warning", badgeClass: "bg-amber-50 text-amber-700", dotClass: "bg-amber-500" },
  offline: { label: "Offline", badgeClass: "bg-red-50 text-red-700", dotClass: "bg-red-500" },
}

function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60_000)
  if (minutes < 1) return "Baru saja"
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.round(minutes / 60)
  return `${hours} jam lalu`
}

export function DeviceOverviewCard({ device }: DeviceOverviewCardProps) {
  const status = STATUS_CONFIG[device.status]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">{device.deviceId}</p>
        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", status.badgeClass)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", status.dotClass)} />
          {status.label}
        </span>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-slate-500">
        <p className="flex items-center gap-1.5">
          <Wifi className="h-3.5 w-3.5" />
          {device.ssid} &middot; {device.rssi} dBm
        </p>
        <p className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Last seen: {formatRelativeTime(device.lastSeen)}
        </p>
        <p className="flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5" />
          {device.lastTest.download} / {device.lastTest.upload} Mbps &middot; {device.lastTest.ping} ms
        </p>
      </div>
    </div>
  )
}
