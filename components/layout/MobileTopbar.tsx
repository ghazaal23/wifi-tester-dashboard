"use client"

import { Menu, Wifi } from "lucide-react"

interface MobileTopbarProps {
  onOpenSidebar: () => void
}

/**
 * Topbar yang hanya tampil di layar kecil (< lg breakpoint).
 * Di layar besar, sidebar sudah selalu terlihat sehingga topbar ini disembunyikan.
 */
export function MobileTopbar({ onOpenSidebar }: MobileTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:hidden">
      <button
        onClick={onOpenSidebar}
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        aria-label="Buka menu navigasi"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50">
          <Wifi className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.25} />
        </div>
        <p className="text-sm font-semibold text-slate-900">WiFi Tester</p>
      </div>
    </header>
  )
}
