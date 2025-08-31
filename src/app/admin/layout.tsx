import type { Metadata } from "next"
import Link from "next/link"
import { AdminGuard } from "@/components/admin/AdminGuard"

export const metadata: Metadata = {
  title: "Admin — Marimex",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="underline-offset-4 hover:underline">Overview</Link>
            <Link href="/admin/products" className="underline-offset-4 hover:underline">Products</Link>
            <Link href="/admin/orders" className="underline-offset-4 hover:underline">Orders</Link>
            <Link href="/products" className="underline-offset-4 hover:underline">Store</Link>
          </nav>
        </div>
        {children}
      </div>
    </AdminGuard>
  )
}
