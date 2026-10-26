import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "WiFi Tester — Edge Sensor Node Dashboard",
  description: "Dashboard monitoring untuk sistem WiFi Tester Edge Sensor Node",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans antialiased">
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  )
}
