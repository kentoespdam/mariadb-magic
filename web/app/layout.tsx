import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Magic MariaDB Sync',
  description: '1-way sync tool for MariaDB',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}