// components/dashboard/HistoryLogTable.tsx
"use client"

import { Download, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HistoryLog } from "@/lib/types"

interface HistoryLogTableProps {
  logs: HistoryLog[]
}

const STATUS_BADGE: Record<HistoryLog["status"], string> = {
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-700",
}

const COLUMNS = [
  "Timestamp",
  "Device ID",
  "Target SSID",
  "Download (Mbps)",
  "Upload (Mbps)",
  "Ping (ms)",
  "Jitter (ms)",
  "Packet Loss (%)",
  "Status",
]

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function logsToRows(logs: HistoryLog[]) {
  return logs.map((log) => [
    formatTimestamp(log.timestamp),
    log.deviceId,
    log.targetSsid,
    log.download.toString(),
    log.upload.toString(),
    log.ping.toString(),
    log.jitter.toString(),
    log.packetLoss.toString(),
    log.status,
  ])
}

function handleExportCsv(logs: HistoryLog[]) {
  const rows = [COLUMNS, ...logsToRows(logs)]
  const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `riwayat-pengujian-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Import jspdf & jspdf-autotable secara dinamis (hanya saat tombol diklik)
 * agar tidak membengkakkan bundle awal halaman.
 * Install dulu: npm install jspdf jspdf-autotable
 */
async function handleExportPdf(logs: HistoryLog[]) {
  const { default: jsPDF } = await import("jspdf")
  const autoTable = (await import("jspdf-autotable")).default

  const doc = new jsPDF({ orientation: "landscape" })
  doc.setFontSize(14)
  doc.text("Riwayat Pengujian — WiFi Tester Edge Sensor Node", 14, 15)

  autoTable(doc, {
    startY: 22,
    head: [COLUMNS],
    body: logsToRows(logs),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [16, 185, 129] }, // emerald-500
  })

  doc.save(`riwayat-pengujian-${Date.now()}.pdf`)
}

export function HistoryLogTable({ logs }: HistoryLogTableProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <h2 className="text-sm font-semibold text-slate-900">Riwayat Pengujian</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleExportCsv(logs)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            Export to CSV
          </button>
          <button
            onClick={() => handleExportPdf(logs)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <FileText className="h-3.5 w-3.5" />
            Export to PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs text-slate-500">
              {COLUMNS.map((col) => (
                <th key={col} className="whitespace-nowrap px-4 py-2.5 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr
                key={log.id}
                className={cn(
                  "border-b border-slate-50 last:border-0 hover:bg-slate-100/70",
                  i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                )}
              >
                <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">{formatTimestamp(log.timestamp)}</td>
                <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-800">{log.deviceId}</td>
                <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">{log.targetSsid}</td>
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">{log.download}</td>
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">{log.upload}</td>
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">{log.ping}</td>
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">{log.jitter}</td>
                <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">{log.packetLoss}</td>
                <td className="whitespace-nowrap px-4 py-2.5">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium capitalize", STATUS_BADGE[log.status])}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
