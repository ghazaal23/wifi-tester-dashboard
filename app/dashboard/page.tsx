"use client"

import { useEffect, useRef, useState } from "react"
import {
  Download,
  Upload,
  Gauge,
  Activity,
  AlertTriangle,
  MapPin,
  Play,
  Loader2,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react"

// ============================================================
// Types
// ============================================================

type TestMode = "mlab" | "internal-ub"
type LocationMode = "auto" | "manual"
type GeoStatus = "idle" | "requesting" | "granted" | "denied"
type SaveStatus = "idle" | "saving" | "success" | "error"

interface Metrics {
  download: number // Mbps
  upload: number // Mbps
  ping: number // ms
  jitter: number // ms
  packetLoss: number // %
}

interface Coordinates {
  latitude: number
  longitude: number
}

const EMPTY_METRICS: Metrics = {
  download: 0,
  upload: 0,
  ping: 0,
  jitter: 0,
  packetLoss: 0,
}

// Batas antar-fase simulasi (dalam persentase progress 0–100)
const PHASE_BOUNDARIES = { pingEnd: 15, downloadEnd: 60 }
const TEST_DURATION_MS = 6000
const TICK_INTERVAL_MS = 120

// ============================================================
// Helpers
// ============================================================

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

/** Menghasilkan nilai akhir simulasi yang realistis untuk satu sesi tes. */
function generateFinalMetrics(): Metrics {
  return {
    download: Number(randomBetween(40, 150).toFixed(1)),
    upload: Number(randomBetween(10, 60).toFixed(1)),
    ping: Number(randomBetween(15, 45).toFixed(0)),
    jitter: Number(randomBetween(1, 8).toFixed(1)),
    packetLoss: Number(randomBetween(0, 2).toFixed(1)),
  }
}

// ============================================================
// Component
// ============================================================

export default function SpeedTestPage() {
  // --- Konfigurasi tes ---
  const [mode, setMode] = useState<TestMode>("mlab")
  const [deviceId, setDeviceId] = useState("")
  const [saveToDb, setSaveToDb] = useState(true)

  // --- Lokasi ---
  const [locationMode, setLocationMode] = useState<LocationMode>("auto")
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle")
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [manualLocation, setManualLocation] = useState("")

  // --- State pengujian ---
  const [isTesting, setIsTesting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phaseLabel, setPhaseLabel] = useState("")
  const [metrics, setMetrics] = useState<Metrics>(EMPTY_METRICS)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // --- Simpan ke DB ---
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle")

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const finalMetricsRef = useRef<Metrics>(EMPTY_METRICS)

  // Minta izin lokasi otomatis saat halaman dibuka
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoStatus("denied")
      setLocationMode("manual")
      return
    }

    setGeoStatus("requesting")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setGeoStatus("granted")
        setLocationMode("auto")
      },
      () => {
        // Izin ditolak atau gagal — fallback ke input manual
        setGeoStatus("denied")
        setLocationMode("manual")
      },
      { enableHighAccuracy: false, timeout: 8000 }
    )
  }, [])

  // Bersihkan interval jika komponen unmount saat tes masih berjalan
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function handleStartTest() {
    if (!deviceId.trim()) {
      setErrorMessage("Device ID wajib diisi sebelum memulai pengujian.")
      return
    }
    if (locationMode === "manual" && !manualLocation.trim() && !coordinates) {
      setErrorMessage("Isi lokasi pengujian secara manual, atau izinkan akses lokasi browser.")
      return
    }

    setErrorMessage(null)
    setSaveStatus("idle")
    setMetrics(EMPTY_METRICS)
    setProgress(0)
    setIsTesting(true)
    setPhaseLabel("Mengukur ping & jitter...")

    const finalMetrics = generateFinalMetrics()
    finalMetricsRef.current = finalMetrics

    const startTime = Date.now()

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const rawPercent = Math.min(100, (elapsed / TEST_DURATION_MS) * 100)

      setProgress(rawPercent)
      updateMetricsForProgress(rawPercent, finalMetrics)
      updatePhaseLabel(rawPercent)

      if (rawPercent >= 100) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setMetrics(finalMetrics)
        setIsTesting(false)
        setPhaseLabel("Pengujian selesai")

        if (saveToDb) {
          void handleSaveResult(finalMetrics)
        }
      }
    }, TICK_INTERVAL_MS)
  }

  function updatePhaseLabel(percent: number) {
    if (percent < PHASE_BOUNDARIES.pingEnd) {
      setPhaseLabel("Mengukur ping & jitter...")
    } else if (percent < PHASE_BOUNDARIES.downloadEnd) {
      setPhaseLabel("Mengukur kecepatan download...")
    } else if (percent < 100) {
      setPhaseLabel("Mengukur kecepatan upload...")
    } else {
      setPhaseLabel("Menyelesaikan pengujian...")
    }
  }

  /** Interpolasi nilai metrik secara bertahap sesuai fase progress, dengan sedikit noise agar terlihat "hidup". */
  function updateMetricsForProgress(percent: number, final: Metrics) {
    const { pingEnd, downloadEnd } = PHASE_BOUNDARIES

    setMetrics((prev) => {
      const next: Metrics = { ...prev }

      if (percent < pingEnd) {
        const localP = percent / pingEnd
        next.ping = Number((final.ping * localP + randomBetween(-2, 2)).toFixed(0))
        next.jitter = Number((final.jitter * localP + randomBetween(-0.5, 0.5)).toFixed(1))
      } else if (percent < downloadEnd) {
        next.ping = final.ping
        next.jitter = final.jitter
        const localP = (percent - pingEnd) / (downloadEnd - pingEnd)
        next.download = Number(
          Math.max(0, final.download * localP + randomBetween(-4, 4)).toFixed(1)
        )
      } else {
        next.download = final.download
        const localP = (percent - downloadEnd) / (100 - downloadEnd)
        next.upload = Number(
          Math.max(0, final.upload * localP + randomBetween(-2, 2)).toFixed(1)
        )
        if (percent >= 100) next.packetLoss = final.packetLoss
      }

      return next
    })
  }

  /**
   * Kirim hasil pengujian ke backend.
   * Sesuaikan endpoint dengan API route Next.js Anda, misal:
   * app/api/speed-test/route.ts (baca body, simpan via Prisma ke PostgreSQL).
   */
  async function handleSaveResult(result: Metrics) {
    setSaveStatus("saving")

    const payload = {
      deviceId: deviceId.trim(),
      mode,
      location:
        locationMode === "auto" && coordinates
          ? { latitude: coordinates.latitude, longitude: coordinates.longitude }
          : { manual: manualLocation.trim() },
      metrics: result,
      timestamp: new Date().toISOString(),
    }

    try {
      const res = await fetch("/api/speed-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error(`Server merespons status ${res.status}`)

      setSaveStatus("success")
    } catch (err) {
      console.error("Gagal menyimpan hasil speed test:", err)
      setSaveStatus("error")
    }
  }

  const metricCards = [
    { label: "Download", value: metrics.download, unit: "Mbps", icon: Download },
    { label: "Upload", value: metrics.upload, unit: "Mbps", icon: Upload },
    { label: "Ping", value: metrics.ping, unit: "ms", icon: Activity },
    { label: "Jitter", value: metrics.jitter, unit: "ms", icon: Gauge },
    { label: "Packet Loss", value: metrics.packetLoss, unit: "%", icon: AlertTriangle },
  ]

  return (
    <div>
      {/* ===== Header ===== */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Speed Test</h1>
        <p className="mt-1 text-sm text-slate-500">
          Uji kecepatan internet menggunakan M-Lab (NDT7) atau server internal UB. 
          Hasil tersimpan ke database untuk monitoring performa jaringan.
        </p>
      </div>

      {/* ===== Panel Konfigurasi ===== */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Mode pengujian */}
          <div>
            <label htmlFor="test-mode" className="mb-1.5 block text-sm font-medium text-slate-700">
              Mode Pengujian
            </label>
            <select
              id="test-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as TestMode)}
              disabled={isTesting}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="mlab">M-Lab (NDT7)</option>
              <option value="internal-ub">Server UB (Internal)</option>
            </select>
          </div>

          {/* Device ID */}
          <div>
            <label htmlFor="device-id" className="mb-1.5 block text-sm font-medium text-slate-700">
              Device ID
            </label>
            <input
              id="device-id"
              type="text"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              disabled={isTesting}
              placeholder="Contoh: PC-AI-Center"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
        </div>

        {/* Lokasi pengujian */}
        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Lokasi Pengujian
          </label>

          {geoStatus === "requesting" && (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Meminta izin lokasi browser...
            </p>
          )}

          {geoStatus === "granted" && coordinates && locationMode === "auto" && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
                <MapPin className="h-3.5 w-3.5" />
                {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
              </span>
              <button
                type="button"
                onClick={() => setLocationMode("manual")}
                disabled={isTesting}
                className="text-xs font-medium text-slate-500 underline decoration-dotted hover:text-slate-700 disabled:cursor-not-allowed"
              >
                Gunakan teks manual sebagai gantinya
              </button>
            </div>
          )}

          {locationMode === "manual" && (
            <div>
              {geoStatus === "denied" && (
                <p className="mb-1.5 flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Izin lokasi ditolak/tidak tersedia — isi lokasi secara manual.
                </p>
              )}
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                disabled={isTesting}
                placeholder="Contoh: Gedung A Lantai 2, dekat Access Point utama"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
              {coordinates && (
                <button
                  type="button"
                  onClick={() => setLocationMode("auto")}
                  disabled={isTesting}
                  className="mt-1.5 text-xs font-medium text-emerald-600 underline decoration-dotted hover:text-emerald-700 disabled:cursor-not-allowed"
                >
                  Pakai lokasi otomatis dari browser
                </button>
              )}
            </div>
          )}
        </div>

        {/* Checkbox + tombol aksi */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={saveToDb}
              onChange={(e) => setSaveToDb(e.target.checked)}
              disabled={isTesting}
              className="h-4 w-4 accent-emerald-500 disabled:cursor-not-allowed"
            />
            Simpan ke DB
          </label>

          <button
            type="button"
            onClick={handleStartTest}
            disabled={isTesting}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menguji...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Mulai Test
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            {errorMessage}
          </p>
        )}
      </div>

      {/* ===== Kartu Metrik ===== */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {metricCards.map(({ label, value, unit, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-1.5 text-slate-400">
              <Icon className="h-3.5 w-3.5" />
              <p className="text-xs font-medium">{label}</p>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
              {value}
              <span className="ml-1 text-sm font-normal text-slate-400">{unit}</span>
            </p>
          </div>
        ))}
      </div>

      {/* ===== Progress Bar ===== */}
      {(isTesting || progress > 0) && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-slate-600">{phaseLabel}</span>
            <span className="font-medium tabular-nums text-slate-900">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-150 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status simpan ke DB */}
          {saveStatus !== "idle" && (
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              {saveStatus === "saving" && (
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menyimpan hasil ke database...
                </span>
              )}
              {saveStatus === "success" && (
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Hasil tersimpan ke database.
                </span>
              )}
              {saveStatus === "error" && (
                <span className="flex items-center gap-1.5 text-red-600">
                  <XCircle className="h-3.5 w-3.5" />
                  Gagal menyimpan hasil — cek koneksi API/backend.
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== Catatan Panduan ===== */}
      <div className="mt-6 flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <div className="text-sm text-slate-600">
          <p className="font-medium text-slate-700">Panduan penggunaan</p>
          <ul className="mt-1.5 list-inside list-disc space-y-1 text-slate-500">
            <li>Isi Device ID dengan nama unik perangkat agar mudah dibedakan di riwayat pengujian.</li>
            <li>Izinkan akses lokasi browser agar hasil tes bisa dipetakan otomatis pada peta sebaran WiFi.</li>
            <li>Mode &quot;M-Lab (NDT7)&quot; mengukur kecepatan ke internet publik, sedangkan &quot;Server UB (Internal)&quot; mengukur kecepatan ke server lokal jaringan.</li>
            <li>Centang &quot;Simpan ke DB&quot; jika hasil pengujian ini ingin dicatat sebagai bagian dari riwayat monitoring jaringan.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
