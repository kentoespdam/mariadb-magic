'use client'

import { useState, useEffect, useCallback } from 'react'
import { Rule, PreviewResult, CastTargetType, FallbackStrategy, StringOpType, DateParseErrorMode } from '@/types/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceConnectionId: string
  tableName: string
  columnName: string
  existingRule?: Rule
  onSave: (rule: Rule) => void
}

export function RuleEditorDialog({ open, onOpenChange, sourceConnectionId, tableName, columnName, existingRule, onSave }: Props) {
  const [ruleType, setRuleType] = useState<string>(existingRule?.type || 'cast')
  const [rule, setRule] = useState<Rule>(existingRule || { type: 'cast', cast: { target_type: 'string' } })
  const [preview, setPreview] = useState<PreviewResult[]>([])
  const [loading, setLoading] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (open && sourceConnectionId && tableName && columnName) {
      fetchPreview()
    }
  }, [open, rule, sourceConnectionId, tableName, columnName])

  const fetchPreview = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/preview/rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rule_dsl: JSON.stringify(rule),
          source_connection_id: sourceConnectionId,
          table: tableName,
          column: columnName,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setPreview(data)
      }
    } catch (e) {
      console.error('Preview error:', e)
    } finally {
      setLoading(false)
    }
  }, [rule, sourceConnectionId, tableName, columnName])

  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
    const timer = setTimeout(() => {
      if (open && sourceConnectionId) fetchPreview()
    }, 300)
    setDebounceTimer(timer)
    return () => clearTimeout(timer)
  }, [rule, open, sourceConnectionId, tableName, columnName])

  const handleTypeChange = (type: string) => {
    setRuleType(type)
    const baseRule: Rule = { type: type as Rule['type'] }
    switch (type) {
      case 'cast': baseRule.cast = { target_type: 'string' }; break
      case 'enum_map': baseRule.enum_map = { mapping: {}, fallback: 'null', case_sensitive: true }; break
      case 'regex_replace': baseRule.regex = { pattern: '', replacement: '' }; break
      case 'string_op': baseRule.string_op = { operation: 'trim' }; break
      case 'date_format': baseRule.date_format = { input_layout: '2006-01-02', output_layout: '2006-01-02', on_parse_error: 'null' }; break
    }
    setRule(baseRule)
  }

  const handleSave = () => {
    onSave(rule)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aturan Kolom: {columnName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipe Aturan</label>
            <select value={ruleType} onChange={e => handleTypeChange(e.target.value)} className="w-full border rounded p-2">
              <option value="cast">Cast (konversi tipe)</option>
              <option value="enum_map">Enum Map (peta nilai)</option>
              <option value="regex_replace">Regex Replace</option>
              <option value="string_op">String Operation</option>
              <option value="date_format">Date Format</option>
            </select>
          </div>

          {ruleType === 'cast' && rule.cast && (
            <div>
              <label className="block text-sm font-medium mb-1">Tipe Target</label>
              <select value={rule.cast.target_type} onChange={e => setRule({ ...rule, cast: { target_type: e.target.value as CastTargetType } })} className="w-full border rounded p-2">
                <option value="string">String</option>
                <option value="int">Integer</option>
                <option value="float">Float</option>
                <option value="bool">Boolean</option>
              </select>
            </div>
          )}

          {ruleType === 'enum_map' && rule.enum_map && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Peta Nilai (source → dest)</label>
              <div className="flex gap-2 mb-2">
                <input placeholder="nilai source" className="border rounded p-1 flex-1" id="enum-src" />
                <input placeholder="nilai destination" className="border rounded p-1 flex-1" id="enum-dest" />
                <button type="button" onClick={() => {
                  const src = (document.getElementById('enum-src') as HTMLInputElement).value
                  const dest = (document.getElementById('enum-dest') as HTMLInputElement).value
                  if (src && dest) {
                    setRule({ ...rule, enum_map: { ...rule.enum_map!, mapping: { ...rule.enum_map!.mapping, [src]: dest } } })
                    ;(document.getElementById('enum-src') as HTMLInputElement).value = ''
                    ;(document.getElementById('enum-dest') as HTMLInputElement).value = ''
                  }
                }} className="bg-gray-200 px-3 rounded">+</button>
              </div>
              <div className="text-sm text-gray-600">
                {Object.entries(rule.enum_map.mapping).map(([k, v]) => (
                  <span key={k} className="inline-block bg-gray-100 mr-2 mb-1 px-2 py-0.5 rounded">
                    {k} → {v} <button type="button" onClick={() => {
                      const m = { ...rule.enum_map!.mapping }
                      delete m[k]
                      setRule({ ...rule, enum_map: { ...rule.enum_map!, mapping: m } })
                    }} className="ml-1 text-red-500">×</button>
                  </span>
                ))}
              </div>
              <label className="block text-sm font-medium mt-2">Fallback</label>
              <select value={rule.enum_map.fallback} onChange={e => setRule({ ...rule, enum_map: { ...rule.enum_map!, fallback: e.target.value as FallbackStrategy } })} className="w-full border rounded p-2">
                <option value="null">Null</option>
                <option value="original">Pertahankan nilai asli</option>
                <option value="fail">Gagal</option>
              </select>
              <label className="block text-sm font-medium mt-2">
                <input type="checkbox" checked={rule.enum_map.case_sensitive} onChange={e => setRule({ ...rule, enum_map: { ...rule.enum_map!, case_sensitive: e.target.checked } })} className="mr-2" />
                Case sensitive
              </label>
            </div>
          )}

          {ruleType === 'regex_replace' && rule.regex && (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Pattern (regex)</label>
                <input value={rule.regex.pattern} onChange={e => setRule({ ...rule, regex: { ...rule.regex!, pattern: e.target.value } })} className="w-full border rounded p-2 font-mono" placeholder="^\s+|\s+$" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Replacement</label>
                <input value={rule.regex.replacement} onChange={e => setRule({ ...rule, regex: { ...rule.regex!, replacement: e.target.value } })} className="w-full border rounded p-2 font-mono" placeholder="" />
              </div>
            </div>
          )}

          {ruleType === 'string_op' && rule.string_op && (
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Operasi</label>
              <select value={rule.string_op.operation} onChange={e => setRule({ ...rule, string_op: { ...rule.string_op!, operation: e.target.value as StringOpType } })} className="w-full border rounded p-2">
                <option value="trim">Trim (hapus spasi)</option>
                <option value="upper">Uppercase</option>
                <option value="lower">Lowercase</option>
                <option value="substring">Substring</option>
              </select>
              {rule.string_op.operation === 'substring' && (
                <div className="flex gap-2">
                  <div>
                    <label className="block text-sm">Start</label>
                    <input type="number" value={rule.string_op.start || 0} onChange={e => setRule({ ...rule, string_op: { ...rule.string_op!, start: parseInt(e.target.value) || 0 } })} className="border rounded p-1 w-20" />
                  </div>
                  <div>
                    <label className="block text-sm">Length</label>
                    <input type="number" value={rule.string_op.length || ''} onChange={e => setRule({ ...rule, string_op: { ...rule.string_op!, length: e.target.value ? parseInt(e.target.value) : undefined } })} className="border rounded p-1 w-20" />
                  </div>
                </div>
              )}
            </div>
          )}

          {ruleType === 'date_format' && rule.date_format && (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium mb-1">Input Layout</label>
                <input value={rule.date_format.input_layout} onChange={e => setRule({ ...rule, date_format: { ...rule.date_format!, input_layout: e.target.value } })} className="w-full border rounded p-2 font-mono" placeholder="2006-01-02" />
                <span className="text-xs text-gray-500">Gunakan format Go: 2006=year, 01=month, 02=day, 15=hour, 04=minute, 05=second</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Output Layout</label>
                <input value={rule.date_format.output_layout} onChange={e => setRule({ ...rule, date_format: { ...rule.date_format!, output_layout: e.target.value } })} className="w-full border rounded p-2 font-mono" placeholder="02-01-2006" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Jika parsing gagal</label>
                <select value={rule.date_format.on_parse_error} onChange={e => setRule({ ...rule, date_format: { ...rule.date_format!, on_parse_error: e.target.value as DateParseErrorMode } })} className="w-full border rounded p-2">
                  <option value="null">Null</option>
                  <option value="keep_original_string">Pertahankan string asli</option>
                  <option value="fail_row">Gagal</option>
                </select>
              </div>
              <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                💡 Waktu dianggap UTC
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Sample Preview</h4>
            {loading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <span className="animate-spin">⏳</span> Memuat preview...
              </div>
            ) : (
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-2 text-left">Nilai Source</th>
                    <th className="border p-2 text-left">Hasil</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className={r.status === 'error' ? 'bg-red-50' : ''}>
                      <td className="border p-2 font-mono">{r.source_value === null ? 'NULL' : String(r.source_value)}</td>
                      <td className="border p-2 font-mono">
                        {r.status === 'ok' ? (
                          r.dest_value === null ? <span className="text-gray-400">NULL</span> : String(r.dest_value)
                        ) : (
                          <span className="text-red-600 text-xs">{r.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <DialogFooter className="mt-4">
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 border rounded mr-2">Batal</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Simpan Aturan</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (o: boolean) => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => onOpenChange(false)}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function DialogContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>
}

function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>
}

function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>
}

function DialogFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex justify-end gap-2 mt-4 ${className}`}>{children}</div>
}