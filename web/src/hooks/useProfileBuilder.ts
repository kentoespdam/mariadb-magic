import { useState, useEffect, useCallback } from 'react'
import { Profile, SchemaData, ProfileMappings, ColumnPair, SourceType, MarkReadyResponse } from '@/types/types'

export function useProfileBuilder(profileId: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [schema, setSchema] = useState<SchemaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mappings, setMappings] = useState<ProfileMappings>({ tables: [] })

  useEffect(() => {
    Promise.all([
      fetch(`/api/profiles/${profileId}`).then(r => r.json()),
      fetch(`/api/profiles/${profileId}/schema`).then(r => r.json())
    ]).then(([p, s]) => { setProfile(p); setSchema(s); setLoading(false) }).catch(() => setLoading(false))
  }, [profileId])

  const getSourceColumns = useCallback(() => schema?.source_schema ? Object.keys(schema.source_schema).sort() : [], [schema])

  const autoMatch = useCallback((destCol: string): ColumnPair => {
    const sourceCols = getSourceColumns()
    const match = sourceCols.find(sc => sc.toLowerCase() === destCol.toLowerCase())
    const destInfo = schema?.dest_schema[destCol]
    return { dest_column: destCol, is_pk: destInfo?.is_pk || false, source_type: (match ? 'column' : 'unresolved') as SourceType, source_column: match, status: match ? 'auto' : 'unresolved' }
  }, [getSourceColumns, schema])

  const buildInitialMappings = useCallback((): ProfileMappings => {
    if (!schema?.tables) return { tables: [] }
    return { tables: schema.tables.map(t => {
      const cols = Object.keys(schema.dest_schema).map(col => autoMatch(col))
      return { table_name: t.name, column_pairs: cols, unresolved_cnt: cols.filter(c => c.status === 'unresolved').length, total_cols: cols.length }
    })}
  }, [schema, autoMatch])

  useEffect(() => {
    if (schema && mappings.tables.length === 0) {
      const initial = buildInitialMappings()
      if (profile?.column_pairings_json) {
        try { setMappings(JSON.parse(profile.column_pairings_json)) } catch { setMappings(initial) }
      } else { setMappings(initial) }
    }
  }, [schema, profile, buildInitialMappings])

  const updatePairing = useCallback((tableIdx: number, colIdx: number, updates: Partial<ColumnPair>) => {
    const newMaps = { ...mappings }
    const col = { ...newMaps.tables[tableIdx].column_pairs[colIdx], ...updates }
    col.status = (!col.source_column && col.source_type !== 'unresolved') ? 'resolved' : (col.source_type === 'unresolved' || !col.source_column) ? 'unresolved' : col.status
    newMaps.tables[tableIdx].column_pairs[colIdx] = col
    newMaps.tables[tableIdx].unresolved_cnt = newMaps.tables[tableIdx].column_pairs.filter(c => c.status === 'unresolved').length
    setMappings(newMaps)
  }, [mappings])

  const totalUnresolved = mappings.tables.reduce((sum, t) => sum + t.unresolved_cnt, 0)
  const totalCols = mappings.tables.reduce((sum, t) => sum + t.total_cols, 0)

  const markReady = async (): Promise<MarkReadyResponse> => {
    setSaving(true)
    try {
      const res = await fetch(`/api/profiles/${profileId}/mark-ready`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column_pairings_json: JSON.stringify(mappings), rules_json: '{}' })
      })
      const data = await res.json()
      if (!res.ok) { setSaving(false); return { valid: false, errors: data.errors } }
      setProfile(p => p ? { ...p, status: 'ready' } : null)
      setSaving(false)
      return { valid: true }
    } catch { setSaving(false); return { valid: false } }
  }

  const downgradeToDraft = async () => {
    setSaving(true)
    await fetch(`/api/profiles/${profileId}/downgrade`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column_pairings_json: JSON.stringify(mappings), rules_json: '{}' })
    })
    setProfile(p => p ? { ...p, status: 'draft' } : null)
    setSaving(false)
  }

  const saveDraft = async () => {
    setSaving(true)
    await fetch(`/api/profiles/${profileId}/pairings`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column_pairings_json: JSON.stringify(mappings), rules_json: '{}' })
    })
    setSaving(false)
  }

  return { profile, schema, loading, saving, mappings, getSourceColumns, updatePairing, totalUnresolved, totalCols, markReady, downgradeToDraft, saveDraft }
}