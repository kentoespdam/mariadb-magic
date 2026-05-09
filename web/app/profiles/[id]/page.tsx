'use client'

import { useState, useEffect } from 'react'

type SourceType = 'column' | 'constant' | 'null' | 'default_db' | 'skip' | 'unresolved'

interface ColumnPair {
  dest_column: string
  is_pk: boolean
  source_type: SourceType
  source_column?: string
  constant_val?: string
  status: 'auto' | 'unresolved' | 'resolved'
}

interface TableMapping {
  table_name: string
  column_pairs: ColumnPair[]
  unresolved_cnt: number
  total_cols: number
}

interface ProfileMappings {
  tables: TableMapping[]
}

interface ColumnInfo {
  name: string
  nullable: boolean
  default: string | null
  is_pk: boolean
}

interface TableSchema {
  [key: string]: ColumnInfo
}

interface TableWithRole {
  name: string
  role: string
}

interface SchemaData {
  source_schema: TableSchema
  dest_schema: TableSchema
  tables: TableWithRole[]
}

interface Profile {
  id: string
  name: string
  status: string
  selection_json: string
  column_pairings_json: string
  rules_json: string
}

export default function ProfileBuilderPage({ params }: { params: { id: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [schema, setSchema] = useState<SchemaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`/api/profiles/${params.id}`).then(r => r.json()),
      fetch(`/api/profiles/${params.id}/schema`).then(r => r.json())
    ]).then(([p, s]) => {
      setProfile(p)
      setSchema(s)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [params.id])

  const getSourceColumns = () => {
    if (!schema?.source_schema) return []
    return Object.keys(schema.source_schema).sort()
  }

  const autoMatch = (destCol: string): ColumnPair => {
    const sourceCols = getSourceColumns()
    const lowerDest = destCol.toLowerCase()
    const match = sourceCols.find(sc => sc.toLowerCase() === lowerDest)
    const destInfo = schema?.dest_schema[destCol]

    return {
      dest_column: destCol,
      is_pk: destInfo?.is_pk || false,
      source_type: match ? 'column' : 'unresolved' as SourceType,
      source_column: match,
      status: match ? 'auto' : 'unresolved'
    }
  }

  const buildInitialMappings = (): ProfileMappings => {
    if (!schema?.tables) return { tables: [] }
    return {
      tables: schema.tables.map(t => {
        const destSchema = schema.dest_schema
        const cols = Object.keys(destSchema).map(col => autoMatch(col))
        const unresolved = cols.filter(c => c.status === 'unresolved').length
        return {
          table_name: t.name,
          column_pairs: cols,
          unresolved_cnt: unresolved,
          total_cols: cols.length
        }
      })
    }
  }

  const [mappings, setMappings] = useState<ProfileMappings>({ tables: [] })

  useEffect(() => {
    if (schema && mappings.tables.length === 0) {
      const initial = buildInitialMappings()
      if (profile?.column_pairings_json) {
        try {
          const saved = JSON.parse(profile.column_pairings_json)
          setMappings(saved)
        } catch {
          setMappings(initial)
        }
      } else {
        setMappings(initial)
      }
    }
  }, [schema])

  const updatePairing = (tableIdx: number, colIdx: number, updates: Partial<ColumnPair>) => {
    const newMaps = { ...mappings }
    const col = { ...newMaps.tables[tableIdx].column_pairs[colIdx], ...updates }
    if (!col.source_column && col.source_type !== 'unresolved') {
      col.status = 'resolved'
    } else if (col.source_type === 'unresolved' || !col.source_column) {
      col.status = 'unresolved'
    }
    newMaps.tables[tableIdx].column_pairs[colIdx] = col

    const tm = newMaps.tables[tableIdx]
    tm.unresolved_cnt = tm.column_pairs.filter(c => c.status === 'unresolved').length
    setMappings(newMaps)
  }

  const totalUnresolved = mappings.tables.reduce((sum, t) => sum + t.unresolved_cnt, 0)
  const totalCols = mappings.tables.reduce((sum, t) => sum + t.total_cols, 0)

  const handleMarkReady = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/profiles/${params.id}/mark-ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          column_pairings_json: JSON.stringify(mappings),
          rules_json: '{}'
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setDialogMessage(data.errors?.map((e: any) => e.Message).join('\n') || 'Validasi gagal')
        setShowDialog(true)
      } else {
        setProfile({ ...profile!, status: 'ready' })
      }
    } catch (e) {
      setDialogMessage('Gagal menyimpan')
      setShowDialog(true)
    }
    setSaving(false)
  }

  const handleDowngrade = async () => {
    setSaving(true)
    await fetch(`/api/profiles/${params.id}/downgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        column_pairings_json: JSON.stringify(mappings),
        rules_json: '{}'
      })
    })
    setProfile({ ...profile!, status: 'draft' })
    setShowDialog(false)
    setSaving(false)
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    await fetch(`/api/profiles/${params.id}/pairings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        column_pairings_json: JSON.stringify(mappings),
        rules_json: '{}'
      })
    })
    setSaving(false)
  }

  if (loading) return <div className="p-8">Memuat...</div>
  if (!profile || !schema) return <div className="p-8">Profil tidak ditemukan</div>

  const sourceCols = getSourceColumns()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b p-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{profile.name}</h1>
          <span className={`text-sm px-2 py-0.5 rounded ${profile.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {profile.status === 'ready' ? 'Siap' : 'Draft'}
          </span>
        </div>
        <button onClick={handleSaveDraft} disabled={saving} className="px-4 py-2 border rounded hover:bg-gray-50">
          Simpan Draft
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-48 border-r bg-gray-50 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">Tabel (topological)</div>
            {schema.tables.map((t, i) => {
              const tm = mappings.tables[i]
              const unresolved = tm?.unresolved_cnt || 0
              return (
                <div key={t.name} className={`px-2 py-1.5 text-sm rounded ${unresolved > 0 ? 'bg-yellow-50' : ''}`}>
                  {t.name}
                  {unresolved > 0 && <span className="text-orange-600 ml-1">({unresolved})</span>}
                </div>
              )
            })}
          </div>
        </aside>

        <main className="flex-1 overflow-auto p-4">
          <Tabs tables={schema.tables} mappings={mappings} onUpdate={updatePairing} sourceCols={sourceCols} />
        </main>
      </div>

      <footer className="border-t p-4 flex items-center justify-between bg-white sticky bottom-0">
        <div className="text-sm text-gray-600">
          {totalUnresolved} dari {totalCols} belum diisi
        </div>
        <button
          onClick={() => {
            if (profile.status === 'ready') {
              setDialogMessage('Mengubah profil yang sudah siap akan mengubah status ke draft. Lanjutkan?')
              setShowDialog(true)
            } else {
              handleMarkReady()
            }
          }}
          disabled={totalUnresolved > 0 || saving}
          className={`px-4 py-2 rounded text-white ${totalUnresolved > 0 || saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
        >
          Tandai siap dipakai
        </button>
      </footer>

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <p className="mb-4 whitespace-pre-wrap">{dialogMessage}</p>
            <div className="flex gap-2 justify-end">
              {profile.status === 'ready' && dialogMessage.startsWith('Mengubah') ? (
                <>
                  <button onClick={() => setShowDialog(false)} className="px-4 py-2 border rounded">Batal</button>
                  <button onClick={handleDowngrade} className="px-4 py-2 bg-red-600 text-white rounded">Lanjutkan</button>
                </>
              ) : (
                <button onClick={() => setShowDialog(false)} className="px-4 py-2 border rounded">Tutup</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Tabs({ tables, mappings, onUpdate, sourceCols }: {
  tables: TableWithRole[]
  mappings: ProfileMappings
  onUpdate: (ti: number, ci: number, u: Partial<ColumnPair>) => void
  sourceCols: string[]
}) {
  const [activeTab, setActiveTab] = useState(0)
  const tm = mappings.tables[activeTab]
  const tableName = tables[activeTab]?.name

  return (
    <div>
      <div className="flex gap-1 border-b mb-4 overflow-x-auto">
        {tables.map((t, i) => {
          const m = mappings.tables[i]
          const unresolved = m?.unresolved_cnt || 0
          return (
            <button
              key={t.name}
              onClick={() => setActiveTab(i)}
              className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 ${activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent'} ${unresolved > 0 ? 'bg-yellow-50' : ''}`}
            >
              {t.name}
              {unresolved > 0 && <span className="text-orange-600 ml-1">({unresolved})</span>}
            </button>
          )
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="border p-2 w-40">Kolom Destination</th>
              <th className="border p-2 w-64">Sumber nilai</th>
              <th className="border p-2 w-48">Detail</th>
              <th className="border p-2 w-24">Status</th>
            </tr>
          </thead>
          <tbody>
            {tm?.column_pairs.map((col, ci) => (
              <tr key={col.dest_column} className={col.status === 'unresolved' ? 'bg-yellow-50' : col.status === 'auto' ? 'bg-white' : 'bg-white'}>
                <td className="border p-2">
                  {col.is_pk && <span className="mr-1">🔑</span>}
                  {col.dest_column}
                </td>
                <td className="border p-2">
                  <select
                    value={col.source_type === 'unresolved' ? '' : col.source_type}
                    onChange={e => {
                      const val = e.target.value as SourceType
                      if (val === 'column') {
                        const match = sourceCols.find(s => s.toLowerCase() === col.dest_column.toLowerCase()) || sourceCols[0]
                        onUpdate(activeTab, ci, { source_type: val, source_column: match, status: 'resolved' })
                      } else if (val === 'constant') {
                        onUpdate(activeTab, ci, { source_type: val, source_column: '', status: 'resolved' })
                      } else {
                        onUpdate(activeTab, ci, { source_type: val, source_column: '', status: 'resolved' })
                      }
                    }}
                    className="w-full border rounded p-1"
                  >
                    <optgroup label="Kolom Source">
                      {sourceCols.map(sc => (
                        <option key={sc} value="column" data-col={sc}>{sc}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Opsi khusus">
                      <option value="constant">Konstanta</option>
                      <option value="null">Kosongkan/NULL</option>
                      <option value="default_db">Default DB</option>
                      <option value="skip">Lewati</option>
                    </optgroup>
                  </select>
                  {col.source_type === 'column' && (
                    <select
                      value={col.source_column || ''}
                      onChange={e => onUpdate(activeTab, ci, { source_column: e.target.value })}
                      className="w-full border rounded p-1 mt-1"
                    >
                      <option value="">-- pilih kolom --</option>
                      {sourceCols.map(sc => (
                        <option key={sc} value={sc}>{sc}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="border p-2">
                  {col.source_type === 'constant' && (
                    <input
                      type="text"
                      value={col.constant_val || ''}
                      onChange={e => onUpdate(activeTab, ci, { constant_val: e.target.value })}
                      className="border rounded p-1 w-full"
                      placeholder="nilai konstanta"
                    />
                  )}
                  {col.source_type === 'skip' && <span className="text-gray-500">Kolom di-skip dari INSERT</span>}
                  {col.source_type === 'null' && <span className="text-gray-500">NULL pada INSERT/UPDATE</span>}
                  {col.source_type === 'default_db' && <span className="text-gray-500">DEFAULT(col) pada INSERT/UPDATE</span>}
                </td>
                <td className="border p-2">
                  {col.status === 'auto' && <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs">Auto</span>}
                  {col.status === 'unresolved' && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">Isi</span>}
                  {col.status === 'resolved' && <span className="text-green-600 text-xs">✓</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}