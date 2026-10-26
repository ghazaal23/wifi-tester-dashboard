// lib/mock-data.ts
import type { SummaryMetrics, TrendPoint, Device, HistoryLog, AlertItem, TimeRange } from "@/lib/types"

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

// Titik pusat peta — area sekitar Universitas Brawijaya, Malang.
// Ganti sesuai lokasi pilot project Anda yang sebenarnya.
const MAP_CENTER = { lat: -7.9538, lng: 112.6135 }

const DEVICE_NAMES = [
  "Node-Gedung-A-Lt1",
  "Node-Gedung-A-Lt3",
  "Node-Perpustakaan",
  "Node-Lab-IoT",
  "Node-Kantin-Pusat",
  "Node-Asrama-B",
]

const SSID_POOL = ["Kantor_WiFi", "Kantor_WiFi_5G", "Lab_IoT", "UB-Access"]

/** Menghasilkan daftar device beserta status & lokasi acak namun konsisten per sesi. */
export function generateDevices(): Device[] {
  return DEVICE_NAMES.map((name, i) => {
    const statusRoll = Math.random()
    const status = statusRoll < 0.7 ? "active" : statusRoll < 0.9 ? "warning" : "offline"

    return {
      id: `dev-${i}`,
      deviceId: name,
      status,
      ssid: SSID_POOL[i % SSID_POOL.length],
      rssi: status === "offline" ? -90 : Math.round(randomBetween(-75, -40)),
      lastSeen:
        status === "offline"
          ? new Date(Date.now() - randomBetween(2, 12) * 3600_000).toISOString()
          : new Date(Date.now() - randomBetween(0, 5) * 60_000).toISOString(),
      lastTest: {
        download: Number(randomBetween(30, 140).toFixed(1)),
        upload: Number(randomBetween(8, 50).toFixed(1)),
        ping: Math.round(randomBetween(12, 60)),
      },
      latitude: MAP_CENTER.lat + randomBetween(-0.004, 0.004),
      longitude: MAP_CENTER.lng + randomBetween(-0.004, 0.004),
    }
  })
}

const POINTS_PER_RANGE: Record<TimeRange, number> = { "1h": 12, "24h": 24, "7d": 7 }
const LABEL_FORMAT: Record<TimeRange, (i: number, total: number) => string> = {
  "1h": (i, total) => `${(total - i) * 5}m lalu`,
  "24h": (i, total) => `${String((24 - (total - i)) % 24).padStart(2, "0")}:00`,
  "7d": (i, total) => `H-${total - i}`,
}

/** Menghasilkan deret waktu tren jaringan sesuai rentang waktu yang dipilih. */
export function generateTrend(range: TimeRange): TrendPoint[] {
  const total = POINTS_PER_RANGE[range]
  return Array.from({ length: total }, (_, i) => ({
    time: LABEL_FORMAT[range](i, total),
    download: Number(randomBetween(50, 130).toFixed(1)),
    upload: Number(randomBetween(15, 45).toFixed(1)),
    ping: Math.round(randomBetween(15, 55)),
  }))
}

export function generateSummary(devices: Device[]): SummaryMetrics {
  const online = devices.filter((d) => d.status !== "offline")
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1)

  return {
    totalDevices: devices.length,
    onlineDevices: online.length,
    avgDownload: Number(avg(online.map((d) => d.lastTest.download)).toFixed(1)),
    avgUpload: Number(avg(online.map((d) => d.lastTest.upload)).toFixed(1)),
    avgPing: Math.round(avg(online.map((d) => d.lastTest.ping))),
    avgJitter: Number(randomBetween(1, 6).toFixed(1)),
    avgPacketLoss: Number(randomBetween(0, 2.5).toFixed(1)),
    avgRssi: Math.round(avg(online.map((d) => d.rssi))),
    dominantSsid: "Kantor_WiFi_5G",
    trends: {
      download: Number(randomBetween(-8, 12).toFixed(1)),
      upload: Number(randomBetween(-5, 10).toFixed(1)),
      ping: Number(randomBetween(-15, 15).toFixed(1)),
      packetLoss: Number(randomBetween(-20, 20).toFixed(1)),
    },
  }
}

export function generateHistoryLogs(devices: Device[]): HistoryLog[] {
  const logs: HistoryLog[] = []
  for (let i = 0; i < 25; i++) {
    const device = devices[i % devices.length]
    const packetLoss = Number(randomBetween(0, 4).toFixed(1))
    const status: HistoryLog["status"] = packetLoss > 3 ? "failed" : packetLoss > 1.2 ? "warning" : "success"

    logs.push({
      id: `log-${i}`,
      timestamp: new Date(Date.now() - i * randomBetween(15, 60) * 60_000).toISOString(),
      deviceId: device.deviceId,
      targetSsid: device.ssid,
      download: Number(randomBetween(30, 140).toFixed(1)),
      upload: Number(randomBetween(8, 50).toFixed(1)),
      ping: Math.round(randomBetween(12, 70)),
      jitter: Number(randomBetween(1, 9).toFixed(1)),
      packetLoss,
      status,
    })
  }
  return logs
}

export function generateAlerts(devices: Device[]): AlertItem[] {
  const alerts: AlertItem[] = []
  devices.forEach((d) => {
    if (d.status === "offline") {
      alerts.push({
        id: `alert-${d.id}-offline`,
        deviceId: d.deviceId,
        message: `${d.deviceId} tidak merespons — kemungkinan offline.`,
        severity: "critical",
        timestamp: d.lastSeen,
      })
    } else if (d.status === "warning") {
      alerts.push({
        id: `alert-${d.id}-warning`,
        deviceId: d.deviceId,
        message: `${d.deviceId} menunjukkan sinyal lemah (${d.rssi} dBm).`,
        severity: "warning",
        timestamp: new Date().toISOString(),
      })
    }
  })
  return alerts
}
