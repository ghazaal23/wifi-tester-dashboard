// app/api/telemetry/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;

const int = (v: unknown): number | null => {
  const n = num(v);
  return n === null ? null : Math.round(n);
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Ekstrak identifier perangkat
    const devId = body?.deviceId || body?.device;

    if (!devId || typeof devId !== "string") {
      return NextResponse.json(
        { ok: false, error: "field 'deviceId' atau 'device' (string) wajib ada" },
        { status: 400 }
      );
    }

    // 2. 🟢 AUTO-CREATE DEVICE (Upsert) agar tidak memicu Foreign Key Error P2003
    await prisma.device.upsert({
      where: { deviceId: devId },
      update: { isActive: true },
      create: {
        deviceId: devId,
        name: body.deviceName || `Node ${devId}`,
        isActive: true,
      },
    });

    const gw = body.ping?.gateway;
    const rem = body.ping?.remote;

    // 3. Simpan telemetri ke PostgreSQL via Prisma ORM
    const saved = await prisma.telemetryReport.create({
      data: {
        deviceId: devId,
        testType: body.testType || "EAP-PEAP-MSCHAPV2",
        downloadMbps: num(body.downloadMbps) ?? 0,
        uploadMbps: num(body.uploadMbps) ?? (body.bandwidth?.kbps ? body.bandwidth.kbps / 1000 : 0),
        pingMs: num(body.pingMs) ?? num(gw?.rtt_avg_ms) ?? 0,
        jitterMs: num(body.jitterMs) ?? num(gw?.jitter_ms) ?? 0,
        packetLoss: num(body.packetLoss) ?? num(gw?.loss_pct) ?? 0,
        locationName: body.locationName || body.wifi?.ssid || "WiFi-UB.x",
        raw: body as Prisma.InputJsonValue,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: saved.id }, { status: 200 });
  } catch (error: any) {
    console.error("[POST /api/telemetry Error]:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal menyimpan data telemetri", details: error.message },
      { status: 500 }
    );
  }
}
