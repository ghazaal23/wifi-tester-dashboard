// components/dashboard/DashboardHeader.tsx
"use client"

import { useState } from "react"
import { RefreshCw, LogOut, Bell, AlertTriangle, AlertCircle } from "lucide-react"
import type { TimeRange, Device, AlertItem } from "@/lib/types"

interface DashboardHeaderProps {
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  devices: Device[]
  selectedDeviceId: string | "all"
  onDeviceChange: (deviceId: string | "all") => void
  onRefresh: () => void
  isRefreshing: boolean
  alerts: AlertItem[]
}

export function DashboardHeader({
  timeRange,
  onTimeRangeChange,
  devices,
  selectedDeviceId,
  onDeviceChange,
  onRefresh,
  isRefreshing,
  alerts,
}: DashboardHeaderProps) {
  const [isAlertOpen, setIsAlertOpen] = useState(false)

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              WiFi Tester — Edge Sensor Node Admin
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Monitoring performa jaringan &amp; kondisi edge sensor node secara real-time.
          </p>
        </div>

        {/* Notifikasi & Logout */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsAlertOpen((v) => !v)}
              className="relative rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50"
              aria-label="Notifikasi"
            >
              <Bell className="h-4.5 w-4.5" />
              {alerts.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                  {alerts.length}
                </span>
              )}
            </button>

            {isAlertOpen && (
              <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <p className="px-2 py-1.5 text-xs font-semibold text-slate-500">
                  Notifikasi ({alerts.length})
                </p>
                {alerts.length === 0 ? (
                  <p className="px-2 py-4 text-center text-sm text-slate-400">
                    Tidak ada anomali saat ini.
                  </p>
                ) : (
                  <div className="max-h-72 space-y-1 overflow-y-auto">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start gap-2 rounded-lg px-2 py-2 hover:bg-slate-50"
                      >
                        {alert.severity === "critical" ? (
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                        ) : (
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        )}
                        <p className="text-xs text-slate-600">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <select
          value={timeRange}
          onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="1h">1 Jam Terakhir</option>
          <option value="24h">24 Jam Terakhir</option>
          <option value="7d">7 Hari Terakhir</option>
        </select>

        <select
          value={selectedDeviceId}
          onChange={(e) => onDeviceChange(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="all">Semua Perangkat</option>
          {devices.map((d) => (
            <option key={d.id} value={d.deviceId}>
              {d.deviceId}
            </option>
          ))}
        </select>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>
    </div>
  )
}
