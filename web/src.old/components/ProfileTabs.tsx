import { useState } from 'react'
import { ProfileTable } from './ProfileTable'
import { TableWithRole, ProfileMappings, ColumnPair, Rule } from '@/types/types'

interface Props {
  tables: TableWithRole[]
  mappings: ProfileMappings
  sourceCols: string[]
  sourceConnectionId: string
  rules: Record<string, Record<string, Rule>>
  onUpdate: (tableIdx: number, colIdx: number, updates: Partial<ColumnPair>) => void
  onUpdateRule: (tableName: string, colName: string, rule: Rule | undefined) => void
}

export function ProfileTabs({ tables, mappings, sourceCols, sourceConnectionId, rules, onUpdate, onUpdateRule }: Props) {
  const [activeTab, setActiveTab] = useState(0)
  const tm = mappings.tables[activeTab]
  const tableName = tables[activeTab]?.name || ''
  const tableRules = rules[tableName] || {}

  return (
    <div>
      <div className="flex gap-1 border-b mb-4 overflow-x-auto">
        {tables.map((t, i) => {
          const m = mappings.tables[i]
          const unresolved = m?.unresolved_cnt || 0
          return (
            <button key={t.name} onClick={() => setActiveTab(i)}
              className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 ${activeTab === i ? 'border-blue-600 text-blue-600' : 'border-transparent'} ${unresolved > 0 ? 'bg-yellow-50' : ''}`}>
              {t.name}
              {unresolved > 0 && <span className="text-orange-600 ml-1">({unresolved})</span>}
            </button>
          )
        })}
      </div>
      <div className="mb-2 text-sm text-gray-600">{tm?.unresolved_cnt || 0} dari {tm?.total_cols || 0} belum diisi</div>
      {tm && <ProfileTable table={tm} tableName={tableName} sourceCols={sourceCols} sourceConnectionId={sourceConnectionId} rules={tableRules} onUpdate={(ci, u) => onUpdate(activeTab, ci, u)} onUpdateRule={(col, rule) => onUpdateRule(tableName, col, rule)} />}
    </div>
  )
}