'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SyncSession, SSEMessage } from '@/types/types'
import { SSERunner } from '@/lib/sse'

interface LogGroup {
  mariadb_code: number
  count: number
  friendly_summary: string
}

interface SyncLog {
  id: string
  session_id: string
  destination_table: string
  pk_json: string | null
  problem_column: string | null
  source_value: string | null
  mariadb_code: number
  technical_msg: string | null
  friendly_msg: string | null
  created_at: string
}

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [session, setSession] = useState<SyncSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [logGroups, setLogGroups] = useState<LogGroup[]>([])
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null)
  const [groupLogs, setGroupLogs] = useState<SyncLog[]>([])
  const [showFlatView, setShowFlatView] = useState(false)
  const [flatPage, setFlatPage] = useState(0)
  const [flatLogs, setFlatLogs] = useState<SyncLog[]>([])
  const sseRef = useRef<SSERunner | null>(null)

  useEffect(() => {
    fetch(`/api/sessions/${params.id}`).then(r => r.json()).then(s => {
      setSession(s)
      setLoading(false)
      if (s.status === 'running') setTotalRows(s.rows_processed + 100)
    })
  }, [params.id])

  useEffect(() => {
    if (session?.rows_failed && session.rows_failed > 0) {
      fetch(`/api/sessions/${params.id}/logs/groups`).then(r => r.json()).then(g => setLogGroups(g))
    }
  }, [session?.rows_failed, params.id])

  useEffect(() => {
    if (expandedGroup === null) return
    fetch(`/api/sessions/${params.id}/logs?mariadb_code=${expandedGroup}&limit=50`).then(r => r.json()).then(l => setGroupLogs(l))
  }, [expandedGroup, params.id])

  useEffect(() => {
    if (!showFlatView) return
    fetch(`/api/sessions/${params.id}/logs?limit=50&offset=${flatPage * 50}`).then(r => r.json()).then(l => setFlatLogs(l))
  }, [showFlatView, flatPage, params.id])

  useEffect(() => {
    if (!session || session.status !== 'running') return
    sseRef.current = new SSERunner(`/api/sse/${params.id}`, {
      onMessage: (msg: SSEMessage) => {
        if (msg.type === 'progress') {
          setSession(s => s ? { ...s, rows_processed: msg.data.processed ?? s.rows_processed, rows_failed: msg.data.failed ?? s.rows_failed, current_table: msg.data.table ?? s.current_table } : null)
          setTotalRows(t => Math.max(t, (msg.data.processed ?? 0) + 100))
        } else if (msg.type === 'row_failed') {
          setSession(s => s ? { ...s, rows_failed: (s.rows_failed || 0) + 1 } : null)
          if (session?.rows_failed && session.rows_failed > 0) {
            fetch(`/api/sessions/${params.id}/logs/groups`).then(r => r.json()).then(g => setLogGroups(g))
          }
        } else if (msg.type === 'done' || msg.type === 'cancelled') {
          setSession(s => s ? { ...s, status: msg.type === 'done' ? 'done' : 'cancelled', rows_processed: msg.data.processed ?? s.rows_processed, rows_failed: msg.data.failed ?? s.rows_failed } : null)
          sseRef.current?.close()
          if (session?.rows_failed && session.rows_failed > 0) {
            fetch(`/api/sessions/${params.id}/logs/groups`).then(r => r.json()).then(g => setLogGroups(g))
          }
        }
      },
      onError: (err) => console.error('SSE error:', err)
    })
    sseRef.current.connect()
    return () => sseRef.current?.close()
  }, [session?.status, params.id])

  const handleCancel = async () => {
    setCancelling(true)
    await fetch(`/api/sessions/${params.id}/cancel`, { method: 'POST' })
    setCancelling(false)
  }

  const isRunning = session?.status === 'running'
  const isDone = ['done', 'cancelled', 'failed', 'interrupted'].includes(session?.status ?? '')
  const progress = totalRows > 0 ? Math.round(((session?.rows_processed ?? 0) / totalRows) * 100) : 0

  const formatCode = (code: number) => {
    const codes: Record<number, string> = { 1452: 'Referensi data hilang', 1062: 'Duplikat entri', 1406: 'Data terlalu panjang', 1366: 'Tipe data tidak cocok', 1048: 'Kolom tidak boleh NULL' }
    return codes[code] || `Error ${code}`
  }

  if (loading) return <div className="p-8">Memuat...</div>
  if (!session) return <div className="p-8">Session tidak ditemukan</div>

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-4">
        <h1 className="text-xl font-semibold">Session Sync</h1>
        <span className={`text-sm px-2 py-0.5 rounded mt-2 inline-block ${
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
      </header>
      <main className="p-6">
        <div className="mb-6">
          <div className="text-lg mb-2">
            {session.rows_processed} baris · {session.rows_failed} gagal · sedang: {session.current_table || '-'}
          </div>
          <div className="w-full h-4 bg-gray-200 rounded overflow-hidden">
            <div className="h-full bg-blue-600 transition-all" style={{ width: `${isDone ? 100 : progress}%` }} />
          </div>
          <div className="text-right text-sm text-gray-600 mt-1">{isDone ? 100 : progress}%</div>
        </div>
        <div className="mb-4 flex gap-2">
          {isRunning ? (
            <button onClick={handleCancel} disabled={cancelling}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-400">
              {cancelling ? 'Membatalkan...' : 'Batalkan'}
            </button>
          ) : isDone && (
            <button onClick={() => router.push(`/profiles/${session.profile_id}`)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Mulai Sync Baru
            </button>
          )}
        </div>

        {session.rows_failed > 0 && (
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Error Log ({session.rows_failed} gagal)</h2>
              <button onClick={() => setShowFlatView(!showFlatView)}
                className="text-sm text-blue-600 hover:underline">
                {showFlatView ? 'Tampilkan grup' : 'Lihat semua sebagai tabel'}
              </button>
            </div>

            {showFlatView ? (
              <div>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border p-2 text-left">Tabel</th>
                      <th className="border p-2 text-left">PK</th>
                      <th className="border p-2 text-left">Kolom</th>
                      <th className="border p-2 text-left">Pesan</th>
                      <th className="border p-2 text-left">Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flatLogs.map(log => (
                      <tr key={log.id} className="border-t">
                        <td className="p-2">{log.destination_table}</td>
                        <td className="p-2">{log.pk_json ? JSON.stringify(JSON.parse(log.pk_json)) : '-'}</td>
                        <td className="p-2">{log.problem_column || '-'}</td>
                        <td className="p-2">{log.friendly_msg || '-'}</td>
                        <td className="p-2">{new Date(log.created_at).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between items-center mt-4">
                  <button onClick={() => setFlatPage(p => Math.max(0, p - 1))} disabled={flatPage === 0}
                    className="px-3 py-1 border rounded disabled:opacity-50">Sebelumnya</button>
                  <span className="text-sm text-gray-600">Halaman {flatPage + 1}</span>
                  <button onClick={() => setFlatPage(p => p + 1)} disabled={flatLogs.length < 50}
                    className="px-3 py-1 border rounded disabled:opacity-50">Berikutnya</button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {logGroups.map(group => (
                  <div key={group.mariadb_code} className="border rounded">
                    <button onClick={() => setExpandedGroup(expandedGroup === group.mariadb_code ? null : group.mariadb_code)}
                      className="w-full text-left p-3 flex justify-between items-center hover:bg-gray-50">
                      <span>
                        <span className="font-medium">{group.count.toLocaleString('id-ID')} baris</span>
                        <span className="mx-2">—</span>
                        <span>{group.friendly_summary || formatCode(group.mariadb_code)}</span>
                        <span className="mx-2 text-gray-500">({group.mariadb_code})</span>
                      </span>
                      <span className="text-gray-400">{expandedGroup === group.mariadb_code ? '▼' : '▶'}</span>
                    </button>
                    {expandedGroup === group.mariadb_code && (
                      <div className="p-3 border-t bg-gray-50">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left">
                              <th className="pb-2">Tabel</th>
                              <th className="pb-2">PK</th>
                              <th className="pb-2">Kolom</th>
                              <th className="pb-2">Pesan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupLogs.slice(0, 50).map(log => (
                              <tr key={log.id} className="border-t">
                                <td className="py-1">{log.destination_table}</td>
                                <td className="py-1">{log.pk_json ? JSON.stringify(JSON.parse(log.pk_json)) : '-'}</td>
                                <td className="py-1">{log.problem_column || '-'}</td>
                                <td className="py-1">{log.friendly_msg || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {session.rows_failed === 0 && isDone && (
          <div className="text-center py-8 text-gray-500">
            ✓ Tidak ada error. Semua {session.rows_processed.toLocaleString('id-ID')} baris berhasil disinkronkan.
          </div>
        )}
      </main>
    </div>
  )
}