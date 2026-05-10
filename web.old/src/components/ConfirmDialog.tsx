interface Props {
  open: boolean
  message: string
  showCancel?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({ open, message, showCancel = true, onConfirm, onClose }: Props) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white p-6 rounded-lg max-w-md">
        <p className="mb-4 whitespace-pre-wrap">{message}</p>
        <div className="flex gap-2 justify-end">
          {showCancel ? (
            <>
              <button onClick={onClose} className="px-4 py-2 border rounded">Batal</button>
              <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Lanjutkan</button>
            </>
          ) : (
            <button onClick={onClose} className="px-4 py-2 border rounded">Tutup</button>
          )}
        </div>
      </div>
    </div>
  )
}