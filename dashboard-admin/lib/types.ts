// lib/types.ts

export type DeviceStatus = "active" | "warning" | "offline"
export type TimeRange = "1h" | "24h" | "7d"

export interface SummaryMetrics {
  totalDevices: number
  onlineDevices: number
  avgDownload: number // Mbps
  avgUpload: number // Mbps
  avgPing: number // ms
  avgJitter: number // ms
  avgPacketLoss: number // %
  avgRssi: number // dBm
  dominantSsid: string
  trends: {
    download: number // % perubahan vs periode sebelumnya
    upload: number
    ping: number // negatif = membaik (turun), positif = memburuk (naik)
    packetLoss: number
  }
}

export interface TrendPoint {
  time: string
  download: number
  upload: number
  ping: number
}

export interface Device {
  id: string
  deviceId: string
  status: DeviceStatus
  ssid: string
  rssi: number // dBm
  lastSeen: string // ISO string
  lastTest: {
    download: number
    upload: number
    ping: number
  }
  latitude: number
  longitude: number
}

export interface HistoryLog {
  id: string
  timestamp: string
  deviceId: string
  targetSsid: string
  download: number
  upload: number
  ping: number
  jitter: number
  packetLoss: number
  status: "success" | "warning" | "failed"
}

export interface AlertItem {
  id: string
  deviceId: string
  message: string
  severity: "warning" | "critical"
  timestamp: string
}
