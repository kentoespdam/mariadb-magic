'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SyncSession, SSEMessage } from '@/types/types'
import { SSERunner } from '@/lib/sse'

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [session, setSession] = useState<SyncSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const sseRef = useRef<SSERunner | null>(null)

  useEffect(() => {
    fetch(`/api/sessions/${params.id}`).then(r => r.json()).then(s => {
      setSession(s)
      setLoading(false)
      if (s.status === 'running') setTotalRows(s.rows_processed + 100)
    })
  }, [params.id])

  useEffect(() => {
    if (!session || session.status !== 'running') return
    sseRef.current = new SSERunner(`/api/sse/${params.id}`, {
      onMessage: (msg: SSEMessage) => {
        if (msg.type === 'progress') {
          setSession(s => s ? { ...s, rows_processed: msg.data.processed ?? s.rows_processed, rows_failed: msg.data.failed ?? s.rows_failed, current_table: msg.data.table ?? s.current_table } : null)
          setTotalRows(t => Math.max(t, (msg.data.processed ?? 0) + 100))
        } else if (msg.type === 'row_failed') {
          setSession(s => s ? { ...s, rows_failed: (s.rows_failed || 0) + 1 } : null)
        } else if (msg.type === 'done' || msg.type === 'cancelled') {
          setSession(s => s ? { ...s, status: msg.type === 'done' ? 'done' : 'cancelled', rows_processed: msg.data.processed ?? s.rows_processed, rows_failed: msg.data.failed ?? s.rows_failed } : null)
          sseRef.current?.close()
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
      </main>
    </div>
  )
}