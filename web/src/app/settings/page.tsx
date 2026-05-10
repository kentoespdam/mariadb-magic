'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface MaintStats {
  logs_count: number
  sessions_count: number
  db_size_bytes: number
}

export default function SettingsPage() {
  const [stats, setStats] = useState<MaintStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [evicting, setEvicting] = useState(false)
  const [exported, setExported] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/maint/stats').then(r => r.json()).then(s => {
      setStats(s)
      setLoading(false)
    })
  }, [])

  const handleExport = () => {
    setExported(true)
    setMessage('Silakan unduh CSV dari halaman session terlebih dahulu sebelum membersihkan.')
  }

  const handleEvict = async () => {
    if (!exported) {
      setMessage('Mohon lakukan export terlebih dahulu!')
      return
    }
    setEvicting(true)
    await fetch('/api/maint/evict', { method: 'POST' })
    const s = await fetch('/api/maint/stats').then(r => r.json())
    setStats(s)
    setEvicting(false)
    setMessage('Log lama berhasil dibersihkan.')
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  if (loading) return <div className="p-8">Memuat...</div>

  return (
    <div className="min-h-screen p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Pengaturan & Kesehatan</h1>
      </header>

      <div className="max-w-2xl space-y-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Statistik Database</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Log Sync</p>
              <p className="text-xl font-medium">{stats?.logs_count?.toLocaleString('id-ID') ?? 0} baris</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Session Sync</p>
              <p className="text-xl font-medium">{stats?.sessions_count?.toLocaleString('id-ID') ?? 0} session</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">Ukuran Database</p>
              <p className="text-xl font-medium">{formatBytes(stats?.db_size_bytes ?? 0)}</p>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Pengelolaan Log</h2>
          <p className="text-sm text-gray-600 mb-4">
            Kapasitas: 500.000 baris (high) / 400.000 (low) untuk log, 10.000 / 9.000 untuk session.
            Jika kapasitas terlampaui, sistem akan melakukan cleanup otomatis.
          </p>

          <div className="space-y-3">
            <button onClick={handleExport}
              className="w-full px-4 py-2 border rounded hover:bg-gray-50 text-left">
              📥 Ekspor Semua Session (CSV)
            </button>

            <button onClick={handleEvict} disabled={evicting || !exported}
              className={`w-full px-4 py-2 rounded text-left ${
                exported ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}>
              {evicting ? '🧹 Membersihkan...' : '🗑️ Bersihkan Log Lama'}
            </button>

            {!exported && (
              <p className="text-xs text-amber-600">
                ⚠️ Ekspor terlebih dahulu sebelum membersihkan log
              </p>
            )}
          </div>

          {message && (
            <div className={`mt-4 p-3 rounded ${message.includes('berhasil') ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Tentang</h2>
          <p className="text-sm text-gray-600">
            Magic MariaDB Sync v1.0<br/>
            Sinkronisasi satu arah MariaDB dengan UI modern.
          </p>
          <div className="mt-4 flex gap-2">
            <Link href="/" className="text-sm text-blue-600 hover:underline">← Dashboard</Link>
            <span className="text-gray-300">|</span>
            <Link href="/profiles" className="text-sm text-blue-600 hover:underline">Profil</Link>
          </div>
        </div>
      </div>
    </div>
  )
}