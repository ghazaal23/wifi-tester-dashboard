"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { MobileTopbar } from "@/components/layout/MobileTopbar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

/**
 * Shell utama untuk seluruh halaman dashboard.
 * Bungkus tiap page.tsx di dalam route group (dashboard)/ dengan komponen ini,
 * atau pasang langsung di app/layout.tsx jika seluruh app adalah dashboard.
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopbar onOpenSidebar={() => setIsSidebarOpen(true)} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
