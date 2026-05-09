'use client'

import { useState } from 'react'
import { useProfileBuilder } from '@/hooks/useProfileBuilder'
import { ProfileTabs } from '@/components/ProfileTabs'
import { ProfileSidebar } from '@/components/ProfileSidebar'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export default function ProfileBuilderPage({ params }: { params: { id: string } }) {
  const { profile, schema, loading, saving, mappings, getSourceColumns, updatePairing, totalUnresolved, totalCols, markReady, downgradeToDraft, saveDraft } = useProfileBuilder(params.id)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')

  if (loading) return <div className="p-8">Memuat...</div>
  if (!profile || !schema) return <div className="p-8">Profil tidak ditemukan</div>

  const sourceCols = getSourceColumns()
  const canMarkReady = totalUnresolved === 0 && !saving

  const handleMarkReady = async () => {
    if (profile.status === 'ready') { setDialogMessage('Mengubah profil yang sudah siap akan mengubah status ke draft. Lanjutkan?'); setShowDialog(true); return }
    const result = await markReady()
    if (!result.valid) { setDialogMessage(result.errors?.map((e: { Message: string }) => e.Message).join('\n') || 'Validasi gagal'); setShowDialog(true) }
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
        <button onClick={saveDraft} disabled={saving} className="px-4 py-2 border rounded hover:bg-gray-50">Simpan Draft</button>
      </header>
      <div className="flex-1 flex overflow-hidden">
        <ProfileSidebar tables={schema.tables} mappings={mappings} />
        <main className="flex-1 overflow-auto p-4">
          <ProfileTabs tables={schema.tables} mappings={mappings} sourceCols={sourceCols} onUpdate={updatePairing} />
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