import { useState } from 'react'
import { ColumnPair, SourceType, Rule } from '@/types/types'
import { RuleEditorDialog } from './RuleEditorDialog'

interface Props {
  table: { column_pairs: ColumnPair[] }
  tableName: string
  sourceCols: string[]
  sourceConnectionId: string
  rules: Record<string, Rule>
  onUpdate: (colIdx: number, updates: Partial<ColumnPair>) => void
  onUpdateRule: (colName: string, rule: Rule | undefined) => void
}

export function ProfileTable({ table, tableName, sourceCols, sourceConnectionId, rules, onUpdate, onUpdateRule }: Props) {
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false)
  const [ruleDialogCol, setRuleDialogCol] = useState('')

  const openRuleEditor = (colName: string) => {
    setRuleDialogCol(colName)
    setRuleDialogOpen(true)
  }

  const handleSaveRule = (rule: Rule) => {
    onUpdateRule(ruleDialogCol, rule)
  }

  const handleDeleteRule = (colName: string) => {
    onUpdateRule(colName, undefined)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="border p-2 w-40">Kolom Destination</th>
            <th className="border p-2 w-64">Sumber nilai</th>
            <th className="border p-2 w-48">Detail</th>
            <th className="border p-2 w-24">Status</th>
            <th className="border p-2 w-20">Aturan</th>
          </tr>
        </thead>
        <tbody>
          {table.column_pairs.map((col, ci) => (
            <tr key={col.dest_column} className={col.status === 'unresolved' ? 'bg-yellow-50' : 'bg-white'}>
              <td className="border p-2">
                {col.is_pk && <span className="mr-1">🔑</span>}
                {col.dest_column}
              </td>
              <td className="border p-2">
                <select
                  value={col.source_type === 'unresolved' ? '' : col.source_type}
                  onChange={e => handleChange(e.target.value as SourceType, ci)}
                  className="w-full border rounded p-1"
                >
                  <optgroup label="Kolom Source">
                    {sourceCols.map(sc => <option key={sc} value="column">{sc}</option>)}
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
                    onChange={e => onUpdate(ci, { source_column: e.target.value })}
                    className="w-full border rounded p-1 mt-1"
                  >
                    <option value="">-- pilih kolom --</option>
                    {sourceCols.map(sc => <option key={sc} value={sc}>{sc}</option>)}
                  </select>
                )}
              </td>
              <td className="border p-2">
                {col.source_type === 'constant' && (
                  <input type="text" value={col.constant_val || ''}
                    onChange={e => onUpdate(ci, { constant_val: e.target.value })}
                    className="border rounded p-1 w-full" placeholder="nilai konstanta" />
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
              <td className="border p-2">
                {col.is_pk ? (
                  <span className="text-gray-400 text-xs">PK</span>
                ) : rules[col.dest_column] ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">{rules[col.dest_column].type}</span>
                    <button onClick={() => openRuleEditor(col.dest_column)} className="text-blue-600 hover:underline text-xs">Edit</button>
                    <button onClick={() => handleDeleteRule(col.dest_column)} className="text-red-600 hover:underline text-xs">×</button>
                  </div>
                ) : (
                  <button onClick={() => openRuleEditor(col.dest_column)} className="text-blue-600 hover:underline text-xs">+ Tambah</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <RuleEditorDialog
        open={ruleDialogOpen}
        onOpenChange={setRuleDialogOpen}
        sourceConnectionId={sourceConnectionId}
        tableName={tableName}
        columnName={ruleDialogCol}
        existingRule={rules[ruleDialogCol]}
        onSave={handleSaveRule}
      />
    </div>
  )

  function handleChange(val: SourceType, ci: number) {
    if (val === 'column') {
      const match = sourceCols.find(s => s.toLowerCase() === table.column_pairs[ci].dest_column.toLowerCase()) || sourceCols[0]
      onUpdate(ci, { source_type: val, source_column: match, status: 'resolved' })
    } else if (val === 'constant') {
      onUpdate(ci, { source_type: val, source_column: '', status: 'resolved' })
    } else {
      onUpdate(ci, { source_type: val, source_column: '', status: 'resolved' })
    }
  }
}