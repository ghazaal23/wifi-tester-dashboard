"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Wifi, X } from "lucide-react"
import { navItems } from "@/lib/navigation"
import { cn } from "@/lib/utils"

interface SidebarProps {
  /** Dikontrol dari DashboardLayout — true berarti sidebar terbuka di layar kecil */
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Overlay gelap di belakang sidebar saat dibuka di layar kecil */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 transition-transform duration-200 ease-in-out",
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
              <Wifi className="h-4.5 w-4.5 text-emerald-400" strokeWidth={2.25} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">WiFi Tester</p>
              <p className="text-[11px] text-slate-500">Edge Sensor Node</p>
            </div>
          </div>

          {/* Tombol close, hanya tampil di layar kecil */}
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Navigasi */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                )}
              >
                {/* Indikator garis aktif di sisi kiri */}
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-emerald-500 transition-opacity",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                />
                <Icon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0",
                    isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                  strokeWidth={2}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer sidebar — status ringkas, opsional dikembangkan nanti */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 px-3 py-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <p className="text-xs text-slate-400">Broker MQTT terhubung</p>
          </div>
        </div>
      </aside>
    </>
  )
}
