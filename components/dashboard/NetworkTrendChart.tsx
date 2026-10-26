// components/dashboard/NetworkTrendChart.tsx
"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { TrendPoint } from "@/lib/types"

interface NetworkTrendChartProps {
  data: TrendPoint[]
}

export function NetworkTrendChart({ data }: NetworkTrendChartProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-slate-900">Tren Performa Jaringan</h2>
        <p className="text-xs text-slate-500">Download, upload, dan ping dari waktu ke waktu</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} />
          <YAxis
            yAxisId="mbps"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            label={{ value: "Mbps", angle: -90, position: "insideLeft", fontSize: 11, fill: "#94a3b8" }}
          />
          <YAxis
            yAxisId="ms"
            orientation="right"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            label={{ value: "ms", angle: 90, position: "insideRight", fontSize: 11, fill: "#94a3b8" }}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line yAxisId="mbps" type="monotone" dataKey="download" name="Download (Mbps)" stroke="#10b981" strokeWidth={2} dot={false} />
          <Line yAxisId="mbps" type="monotone" dataKey="upload" name="Upload (Mbps)" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          <Line yAxisId="ms" type="monotone" dataKey="ping" name="Ping (ms)" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
