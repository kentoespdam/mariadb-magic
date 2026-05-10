'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { OnboardingState, SyncSession } from '@/types/types'

export default function Home() {
  const [state, setState] = useState<OnboardingState | null>(null)
  const [sessions, setSessions] = useState<SyncSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/onboarding/state').then(r => r.json()).then(s => {
      setState(s)
      if (s.has_any_session) {
        fetch('/api/sessions').then(r => r.json()).then(sessions => {
          setSessions(sessions.slice(-10).reverse())
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Memuat...</p></div>

  if (state?.has_any_session) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Riwayat Sync</h1>
            <Link href="/profiles" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Mulai Sync Baru
            </Link>
          </div>
          <div className="space-y-4">
            {sessions.map(session => (
              <Link key={session.id} href={`/sessions/${session.id}`} className="block border rounded p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <span className={`text-sm px-2 py-0.5 rounded ${
                      session.status === 'done' ? 'bg-green-100 text-green-800' :
                      session.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                      session.status === 'running' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {session.status === 'done' ? 'Selesai' :
                       session.status === 'cancelled' ? 'Dibatalkan' :
                       session.status === 'running' ? 'Sedang Berjalan' :
                       session.status === 'failed' ? 'Gagal' : session.status}
                    </span>
                    <span className="ml-3 text-gray-600">
                      {session.rows_processed} baris · {session.rows_failed} gagal
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(session.created_at).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </Link>
            ))}
            {sessions.length === 0 && (
              <p className="text-gray-500 text-center py-8">Belum ada session sync</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Mari Kita Mulai</h1>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`border rounded-lg p-6 ${state?.has_connections ? '' : 'opacity-50'}`}>
          <h3 className="font-semibold text-lg mb-2">1. Tambahkan Koneksi</h3>
          <p className="text-sm text-gray-600 mb-4">Hubungkan database source dan destination MariaDB Anda</p>
          <Link href="/connections/new" className="block text-center py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Tambah Koneksi
          </Link>
        </div>
        <div className={`border rounded-lg p-6 ${state?.has_connections && !state?.has_ready_profile ? '' : 'opacity-50'}`} title={!state?.has_connections ? 'Lengkapi langkah sebelumnya dulu' : ''}>
          <h3 className="font-semibold text-lg mb-2">2. Buat Mapping Profile</h3>
          <p className="text-sm text-gray-600 mb-4">Pilih tabel dan kolom yang akan disinkronkan</p>
          <span className={`block text-center py-2 rounded ${state?.has_connections ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            onClick={() => state?.has_connections && (window.location.href = '/profiles')}>
            Buat Profile
          </span>
        </div>
        <div className={`border rounded-lg p-6 ${state?.has_ready_profile ? '' : 'opacity-50'}`} title={!state?.has_ready_profile ? 'Lengkapi langkah sebelumnya dulu' : ''}>
          <h3 className="font-semibold text-lg mb-2">3. Mulai Sync Pertama</h3>
          <p className="text-sm text-gray-600 mb-4">Jalankan sinkronisasi data pertama Anda</p>
          <span className={`block text-center py-2 rounded ${state?.has_ready_profile ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            onClick={() => state?.has_ready_profile && (window.location.href = '/profiles')}>
            Mulai Sync
          </span>
        </div>
      </div>
      <div className="text-center mt-6 text-sm text-gray-500">
        {state?.ready_profiles ?? 0} profile siap · {state?.sessions_count ?? 0} session
      </div>
    </div>
  )
}