import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// ============================================================
// Tipe payload yang dikirim dari halaman Speed Test (page.tsx)
// ============================================================
interface SpeedTestPayload {
  deviceId: string
  mode: "mlab" | "internal-ub"
  location: { latitude: number; longitude: number } | { manual: string }
  metrics: {
    download: number
    upload: number
    ping: number
    jitter: number
    packetLoss: number
  }
  timestamp: string
}

// ============================================================
// POST /api/speed-test — simpan satu hasil pengujian baru
// ============================================================
export async function POST(request: Request) {
  let body: SpeedTestPayload

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Body request bukan JSON yang valid." },
      { status: 400 }
    )
  }

  // Validasi dasar — pastikan field wajib ada sebelum menyentuh database
  if (!body.deviceId?.trim()) {
    return NextResponse.json({ error: "deviceId wajib diisi." }, { status: 400 })
  }
  if (!body.mode || !body.metrics) {
    return NextResponse.json(
      { error: "mode dan metrics wajib disertakan." },
      { status: 400 }
    )
  }

  const isManualLocation = "manual" in body.location

  try {
    const result = await prisma.speedTestResult.create({
      data: {
        deviceId: body.deviceId.trim(),
        mode: body.mode,
        download: body.metrics.download,
        upload: body.metrics.upload,
        ping: body.metrics.ping,
        jitter: body.metrics.jitter,
        packetLoss: body.metrics.packetLoss,
        locationLat: isManualLocation ? null : body.location.latitude,
        locationLng: isManualLocation ? null : body.location.longitude,
        locationManual: isManualLocation ? body.location.manual : null,
        testedAt: body.timestamp ? new Date(body.timestamp) : new Date(),
      },
    })

    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    console.error("Gagal menyimpan speed test result:", error)
    return NextResponse.json(
      { error: "Gagal menyimpan data ke database." },
      { status: 500 }
    )
  }
}

// ============================================================
// GET /api/speed-test — ambil daftar hasil pengujian terbaru
// (opsional, berguna nanti untuk halaman riwayat/histori)
// ============================================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const deviceId = searchParams.get("deviceId")
  const limit = Number(searchParams.get("limit") ?? 20)

  try {
    const results = await prisma.speedTestResult.findMany({
      where: deviceId ? { deviceId } : undefined,
      orderBy: { testedAt: "desc" },
      take: limit,
    })

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error("Gagal mengambil speed test result:", error)
    return NextResponse.json(
      { error: "Gagal mengambil data dari database." },
      { status: 500 }
    )
  }
}
