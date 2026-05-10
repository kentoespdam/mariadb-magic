'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProfileBuilder } from '@/hooks/useProfileBuilder'
import { ProfileTabs } from '@/components/ProfileTabs'
import { ProfileSidebar } from '@/components/ProfileSidebar'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DriftReport } from '@/types/types'

export default function ProfileBuilderPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { profile, schema, loading, saving, mappings, rules, getSourceColumns, updatePairing, updateRule, totalUnresolved, totalCols, markReady, downgradeToDraft, saveDraft } = useProfileBuilder(params.id)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  const [dialogType, setDialogType] = useState<'confirm' | 'error'>('confirm')
  const [syncLoading, setSyncLoading] = useState(false)
  const [driftReport, setDriftReport] = useState<DriftReport | null>(null)

  if (loading) return <div className="p-8">Memuat...</div>
  if (!profile || !schema) return <div className="p-8">Profil tidak ditemukan</div>

  const sourceCols = getSourceColumns()
  const canMarkReady = totalUnresolved === 0 && !saving

  const handleMarkReady = async () => {
    if (profile.status === 'ready') { setDialogMessage('Mengubah profil yang sudah siap akan mengubah status ke draft. Lanjutkan?'); setDialogType('confirm'); setShowDialog(true); return }
    const result = await markReady()
    if (!result.valid) { 
      if (result.error_friendly && result.conflicts) {
        setDialogMessage(result.error_friendly + '\n\n' + result.conflicts.map(c => `• ${c.table} → ${c.profile_name}`).join('\n'))
        setDialogType('error')
      } else {
        setDialogMessage(result.errors?.map((e) => e.Message).join('\n') || 'Validasi gagal')
        setDialogType('confirm')
      }
      setShowDialog(true) 
    }
  }

  const handleStartSync = async () => {
    setSyncLoading(true)
    setDriftReport(null)
    try {
      const preflightRes = await fetch(`/api/profiles/${params.id}/preflight`)
      if (!preflightRes.ok) throw new Error('Preflight gagal')
      const report: DriftReport = await preflightRes.json()
      if (report.blocking_dest?.length || report.blocking_source?.length) {
        setDriftReport(report)
        setSyncLoading(false)
        return
      }
      const startRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: params.id })
      })
      if (startRes.status === 409) {
        const conflict = await startRes.json()
        setDialogMessage(`${conflict.error_friendly}\n\nBuka halaman session?`)
        setDialogType('confirm')
        setShowDialog(true)
        return
      }
      if (!startRes.ok) throw new Error('Gagal memulai sync')
      const session = await startRes.json()
      router.push(`/sessions/${session.id}`)
    } catch (err) {
      setDialogMessage(err instanceof Error ? err.message : 'Terjadi kesalahan')
      setDialogType('error')
      setShowDialog(true)
    } finally {
      setSyncLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{profile.name}</h1>
          <span className={`text-sm px-2 py-0.5 rounded ${profile.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {profile.status === 'ready' ? 'Siap' : 'Draft'}
          </span>
        </div>
        <div className="flex gap-2">
          {profile.status === 'ready' && (
            <button onClick={handleStartSync} disabled={syncLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400">
              {syncLoading ? 'Memuat...' : 'Mulai Sync'}
            </button>
          )}
          <button onClick={saveDraft} disabled={saving} className="px-4 py-2 border rounded hover:bg-gray-50">Simpan Draft</button>
        </div>
      </header>
      {driftReport && (
        <div className="bg-amber-50 border-b border-amber-200 p-4">
          <h3 className="font-semibold text-amber-800 mb-2">Schema Drift Terdeteksi</h3>
          {driftReport.blocking_dest?.length > 0 && (
            <div className="mb-2">
              <p className="text-sm text-amber-700 font-medium">Kolom baru di Destination (blocking):</p>
              <ul className="text-sm text-amber-700 list-disc list-inside">
                {driftReport.blocking_dest.map((d, i) => <li key={i}>{d.table}{d.column ? `.${d.column}` : ''}: {d.message}</li>)}
              </ul>
            </div>
          )}
          {driftReport.blocking_source?.length > 0 && (
            <div>
              <p className="text-sm text-amber-700 font-medium">Kolom baru di Source (blocking):</p>
              <ul className="text-sm text-amber-700 list-disc list-inside">
                {driftReport.blocking_source.map((d, i) => <li key={i}>{d.table}{d.column ? `.${d.column}` : ''}: {d.message}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
      <div className="flex-1 flex overflow-hidden">
        <ProfileSidebar tables={schema.tables} mappings={mappings} />
        <main className="flex-1 overflow-auto p-4">
          <ProfileTabs tables={schema.tables} mappings={mappings} sourceCols={sourceCols} sourceConnectionId={profile.source_connection_id} rules={rules} onUpdate={updatePairing} onUpdateRule={updateRule} />
        </main>
      </div>
      <footer className="border-t p-4 flex items-center justify-between bg-white sticky bottom-0">
        <div className="text-sm text-gray-600">{totalUnresolved} dari {totalCols} belum diisi</div>
        <button onClick={handleMarkReady} disabled={!canMarkReady}
          className={`px-4 py-2 rounded text-white ${!canMarkReady ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
          Tandai siap dipakai
        </button>
      </footer>
      <ConfirmDialog open={showDialog} message={dialogMessage} showCancel={profile.status === 'ready' && dialogMessage.startsWith('Mengubah')}
        onConfirm={downgradeToDraft} onClose={() => setShowDialog(false)} />
    </div>
  )
}