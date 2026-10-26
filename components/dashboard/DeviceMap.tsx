// components/dashboard/DeviceMap.tsx
"use client"

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { Device } from "@/lib/types"

interface DeviceMapProps {
  devices: Device[]
}

const STATUS_COLOR: Record<Device["status"], string> = {
  active: "#10b981", // emerald — normal
  warning: "#f59e0b", // amber — sedang
  offline: "#ef4444", // red — drop/kritis
}

export function DeviceMap({ devices }: DeviceMapProps) {
  const center: [number, number] =
    devices.length > 0
      ? [devices[0].latitude, devices[0].longitude]
      : [-7.9538, 112.6135]

  return (
    <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <h2 className="text-sm font-semibold text-slate-900">Sebaran Access Point &amp; Edge Node</h2>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Normal
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Sedang
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-500" /> Kritis
          </span>
        </div>
      </div>

      <MapContainer center={center} zoom={16} style={{ height: "340px", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {devices.map((device) => (
          <CircleMarker
            key={device.id}
            center={[device.latitude, device.longitude]}
            radius={10}
            pathOptions={{
              color: STATUS_COLOR[device.status],
              fillColor: STATUS_COLOR[device.status],
              fillOpacity: 0.7,
            }}
          >
            <Popup>
              <p className="font-semibold">{device.deviceId}</p>
              <p>SSID: {device.ssid}</p>
              <p>RSSI: {device.rssi} dBm</p>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
