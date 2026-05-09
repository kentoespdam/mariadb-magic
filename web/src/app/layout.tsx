import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Magic MariaDB Sync', description: '1-way MariaDB sync tool' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  )
}