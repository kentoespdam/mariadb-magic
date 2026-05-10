'use client'

import Link from 'next/link'
import { Play, RefreshCcw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SyncSession } from '@/types/types'

interface SessionListProps {
  sessions: SyncSession[]
}

const statusConfig: Record<string, { label: string; className: string }> = {
  done: { label: 'Selesai', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Dibatalkan', className: 'bg-gray-100 text-gray-800' },
  running: { label: 'Sedang Berjalan', className: 'bg-blue-100 text-blue-800' },
  failed: { label: 'Gagal', className: 'bg-red-100 text-red-800' },
  pending: { label: 'Menunggu', className: 'bg-yellow-100 text-yellow-800' },
  interrupted: { label: 'Terputus', className: 'bg-orange-100 text-orange-800' },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function SessionList({ sessions }: SessionListProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Riwayat Sync</h2>
        <Button asChild className="gap-2">
          <Link href="/profiles">
            <Play className="h-4 w-4" />
            Mulai Sync Baru
          </Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <RefreshCcw className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Belum ada session sync</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const status = statusConfig[session.status] || { label: session.status, className: 'bg-gray-100 text-gray-800' }
            return (
              <Link key={session.id} href={`/sessions/${session.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <span className={`text-sm px-2.5 py-1 rounded-full font-medium ${status.className}`}>
                          {status.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {session.rows_processed} baris diproses
                          {session.rows_failed > 0 && (
                            <span className="text-red-600 ml-1">· {session.rows_failed} gagal</span>
                          )}
                        </span>
                        {session.current_table && session.status === 'running' && (
                          <span className="text-xs text-muted-foreground">
                            · {session.current_table}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(session.created_at)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}