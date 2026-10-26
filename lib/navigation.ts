import type { LucideIcon } from "lucide-react"
import { LayoutDashboard, Gauge, Router } from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  description: string
}

// Satu sumber kebenaran untuk seluruh menu sidebar.
// Tambahkan entri baru di sini saat halaman baru dibuat —
// Sidebar akan otomatis menampilkannya tanpa perlu diedit lagi.
export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Ringkasan status seluruh node",
  },
  {
    label: "Speed Test",
    href: "/speed-test",
    icon: Gauge,
    description: "Uji latency & throughput jaringan",
  },
  {
    label: "Device Management",
    href: "/device-management",
    icon: Router,
    description: "Kelola edge sensor node terdaftar",
  },
]
