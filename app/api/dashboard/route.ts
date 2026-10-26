import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RANGES: Record<string, number> = {
  "1h": 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};
const ONLINE_WINDOW_MS = 3 * 60 * 1000; // Aktif jika ada laporan < 3 menit lalu
const MAX_ROWS = 1000;
const MAX_POINTS = 120;

type WifiMeta = { wifi?: { ssid?: string; security?: string; link_mode?: string } };

const avg = (xs: (number | null)[]): number | null => {
  const v = xs.filter((x): x is number => x !== null && !isNaN(x));
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

const rd = (v: number | null, d = 1): number | null =>
  v === null || isNaN(v) ? null : Math.round(v * 10 ** d) / 10 ** d;

function bucketize(asc: any[]) {
  if (!asc || asc.length === 0) return [];
  const size = Math.max(1, Math.ceil(asc.length / MAX_POINTS));
  const out = [];
  for (let i = 0; i < asc.length; i += size) {
    const g = asc.slice(i, i + size);
    const bw = avg(g.map((r) => r.bwKbps ?? (r.uploadMbps ? r.uploadMbps * 1000 : null)));
    out.push({
      t: g[g.length - 1].createdAt.toISOString(),
      rssi: rd(avg(g.map((r) => r.rssiDbm)), 0),
      gwRtt: rd(avg(g.map((r) => r.gwRttAvgMs ?? r.pingMs)), 2),
      gwJitter: rd(avg(g.map((r) => r.gwJitterMs ?? r.jitterMs)), 2),
      gwLoss: rd(avg(g.map((r) => r.gwLossPct ?? r.packetLoss)), 1),
      remRtt: rd(avg(g.map((r) => r.remRttAvgMs)), 2),
      remJitter: rd(avg(g.map((r) => r.remJitterMs)), 2),
      remLoss: rd(avg(g.map((r) => r.remLossPct)), 1),
      bwMbps: bw === null ? null : rd(bw / 1000, 3),
    });
  }
  return out;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "24h";
    const device = searchParams.get("device") ?? "all";
    const since = new Date(Date.now() - (RANGES[range] ?? RANGES["24h"]));

    // Flexible filter condition (menyesuaikan deviceId / device)
    const whereCondition: any = {
      createdAt: { gte: since },
    };
    if (device !== "all") {
      whereCondition.OR = [{ deviceId: device }, { device: device }];
    }

    // 1. Ambil Log Telemetri
    const rowsDesc = await prisma.telemetryReport.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS,
    });

    const now = Date.now();

    // Fallback aman jika database belum memiliki catatan
    if (!rowsDesc || rowsDesc.length === 0) {
      return NextResponse.json({
        success: true,
        range,
        generatedAt: new Date(now).toISOString(),
        summary: {
          reports: 0,
          avgRssi: null,
          avgGwRtt: null,
          avgGwJitter: null,
          avgGwLoss: null,
          avgRemRtt: null,
          avgRemJitter: null,
          avgRemLoss: null,
          avgUploadMbps: null,
          maxUploadMbps: null,
          bwSamples: 0,
        },
        latest: null,
        series: [],
        logs: [],
        devices: [],
        accessPoints: [],
      });
    }

    // 2. Kalkulasi Ringkasan Data
    const col = (f: (r: any) => number | null) => avg(rowsDesc.map(f));
    const bw = rowsDesc
      .map((r: any) => r.bwKbps ?? (r.uploadMbps ? r.uploadMbps * 1000 : null))
      .filter((v: any): v is number => v !== null && !isNaN(v));

    const summary = {
      reports: rowsDesc.length,
      avgRssi: rd(col((r: any) => r.rssiDbm), 0),
      avgGwRtt: rd(col((r: any) => r.gwRttAvgMs ?? r.pingMs), 1),
      avgGwJitter: rd(col((r: any) => r.gwJitterMs ?? r.jitterMs), 1),
      avgGwLoss: rd(col((r: any) => r.gwLossPct ?? r.packetLoss), 1),
      avgRemRtt: rd(col((r: any) => r.remRttAvgMs), 1),
      avgRemJitter: rd(col((r: any) => r.remJitterMs), 1),
      avgRemLoss: rd(col((r: any) => r.remLossPct), 1),
      avgUploadMbps: bw.length ? rd(avg(bw)! / 1000, 2) : null,
      maxUploadMbps: bw.length ? rd(Math.max(...bw) / 1000, 2) : null,
      bwSamples: bw.length,
    };

    const first = rowsDesc[0] as any;
    const meta = ((first?.raw ?? {}) as WifiMeta).wifi;
    const latest = first
      ? {
          device: first.deviceId || first.device || "xiao-c3-01",
          createdAt: first.createdAt.toISOString(),
          online: now - new Date(first.createdAt).getTime() < ONLINE_WINDOW_MS,
          rssi: first.rssiDbm,
          channel: first.channel,
          bssid: first.bssid,
          ssid: meta?.ssid ?? first.locationName ?? null,
          security: meta?.security ?? null,
          linkMode: meta?.link_mode ?? null,
          uptimeMs: first.uptimeMs,
        }
      : null;

    // Mapping Logs
    const logs = rowsDesc.slice(0, 15).map((r: any) => ({
      id: r.id,
      createdAt: new Date(r.createdAt).toISOString(),
      device: r.deviceId || r.device || "xiao-c3-01",
      rssi: r.rssiDbm,
      channel: r.channel,
      gwRtt: r.gwRttAvgMs ?? r.pingMs,
      gwLoss: r.gwLossPct ?? r.packetLoss,
      remRtt: r.remRttAvgMs,
      remLoss: r.remLossPct,
      bwMbps: r.bwKbps ? r.bwKbps / 1000 : r.uploadMbps ?? null,
    }));

    return NextResponse.json({
      success: true,
      range,
      generatedAt: new Date(now).toISOString(),
      summary,
      latest,
      series: bucketize([...rowsDesc].reverse()),
      logs,
      devices: [{ id: latest?.device || "xiao-c3-01", lastSeen: latest?.createdAt, online: latest?.online ?? false }],
      accessPoints: [],
    });
  } catch (error: any) {
    console.error("[GET /api/dashboard Error]:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "Gagal membaca data telemetri dari database", details: error?.message },
      { status: 500 }
    );
  }
}
