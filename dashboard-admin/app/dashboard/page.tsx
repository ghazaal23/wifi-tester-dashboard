// app/dashboard/page.tsx
"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import {
  Server,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Activity,
  Radio,
} from "lucide-react"

import { StatCard } from "@/components/dashboard/StatCard"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { NetworkTrendChart } from "@/components/dashboard/NetworkTrendChart"
import { DeviceOverviewCard } from "@/components/dashboard/DeviceOverviewCard"
import { HistoryLogTable } from "@/components/dashboard/HistoryLogTable"
import {
  generateDevices,
  generateSummary,
  generateTrend,
  generateHistoryLogs,
  generateAlerts,
} from "@/lib/mock-data"
import type { TimeRange } from "@/lib/types"

// React-Leaflet mengakses `window`, jadi wajib di-load hanya di client (ssr: false).
const DeviceMap = dynamic(
  () => import("@/components/dashboard/DeviceMap").then((mod) => mod.DeviceMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-400 shadow-sm">
        Memuat peta...
      </div>
    ),
  }
)

export default function DashboardAdminPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h")
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | "all">("all")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // ============================================================
  // Sumber data — MOCK DATA
  //
  // Cara mengganti ke data asli:
  // 1. Ganti `generateDevices()` dengan fetch ke API route Anda,
  //    misal: const { data } = await fetch("/api/devices").then(r => r.json())
  // 2. Ganti `generateTrend(timeRange)` dengan query InfluxDB (Flux) yang
  //    difilter sesuai `timeRange` — lihat Panduan Setup Dashboard bagian 8.
  // 3. Ganti `generateHistoryLogs(devices)` dengan
    //    `prisma.speedTestResult.findMany()` via API route baru.
  // 4. Idealnya pindahkan ke React Query / SWR agar ada caching &
  //    auto-refetch, bukan useState biasa seperti contoh ini.
  // ============================================================
  const [refreshKey, setRefreshKey] = useState(0)

  const devices = useMemo(() => generateDevices(), [refreshKey])
  const filteredDevices = useMemo(
    () => (selectedDeviceId === "all" ? devices : devices.filter((d) => d.deviceId === selectedDeviceId)),
    [devices, selectedDeviceId]
  )
  const summary = useMemo(() => generateSummary(filteredDevices), [filteredDevices, refreshKey])
  const trend = useMemo(() => generateTrend(timeRange), [timeRange, refreshKey])
  const historyLogs = useMemo(() => generateHistoryLogs(devices), [devices, refreshKey])
  const alerts = useMemo(() => generateAlerts(devices), [devices])

  function handleRefresh() {
    setIsRefreshing(true)
    // Simulasi delay network — ganti dengan await fetch(...) yang sesungguhnya
    setTimeout(() => {
      setRefreshKey((k) => k + 1)
      setIsRefreshing(false)
    }, 700)
  }

  return (
    <div>
      <DashboardHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        onDeviceChange={setSelectedDeviceId}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        alerts={alerts}
      />

      {/* ===== Kartu Statistik Ringkasan ===== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Perangkat Aktif"
          value={`${summary.onlineDevices}/${summary.totalDevices}`}
          icon={Server}
          accentColor={summary.onlineDevices === summary.totalDevices ? "emerald" : "amber"}
        />
        <StatCard
          label="Download Rata-rata"
          value={summary.avgDownload.toString()}
          unit="Mbps"
          icon={DownloadIcon}
          trendValue={summary.trends.download}
          trendDirection="up-good"
          accentColor="emerald"
        />
        <StatCard
          label="Upload Rata-rata"
          value={summary.avgUpload.toString()}
          unit="Mbps"
          icon={UploadIcon}
          trendValue={summary.trends.upload}
          trendDirection="up-good"
          accentColor="emerald"
        />
        <StatCard
          label="Ping Rata-rata"
          value={summary.avgPing.toString()}
          unit="ms"
          icon={Activity}
          trendValue={summary.trends.ping}
          trendDirection="up-bad"
          accentColor={summary.trends.ping > 10 ? "red" : "slate"}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Jitter Rata-rata" value={summary.avgJitter.toString()} unit="ms" icon={Activity} accentColor="slate" />
        <StatCard
          label="Packet Loss Rata-rata"
          value={summary.avgPacketLoss.toString()}
          unit="%"
          icon={Activity}
          trendValue={summary.trends.packetLoss}
          trendDirection="up-bad"
          accentColor={summary.avgPacketLoss > 2 ? "red" : "emerald"}
        />
        <StatCard label="RSSI Rata-rata" value={summary.avgRssi.toString()} unit="dBm" icon={Radio} accentColor="slate" />
        <StatCard label="SSID Dominan" value={summary.dominantSsid} icon={Radio} accentColor="slate" />
      </div>

      {/* ===== Grafik Tren & Peta ===== */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <NetworkTrendChart data={trend} />
        </div>
        <div className="lg:col-span-1">
          <DeviceMap devices={filteredDevices} />
        </div>
      </div>

      {/* ===== Device Overview ===== */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Device Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDevices.map((device) => (
            <DeviceOverviewCard key={device.id} device={device} />
          ))}
        </div>
      </div>

      {/* ===== Tabel Riwayat ===== */}
      <div className="mt-6">
        <HistoryLogTable logs={historyLogs} />
      </div>
    </div>
  )
}
