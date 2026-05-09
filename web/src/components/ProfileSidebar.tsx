import { TableWithRole, ProfileMappings } from '@/app/profiles/[id]/types'

interface Props {
  tables: TableWithRole[]
  mappings: ProfileMappings
}

export function ProfileSidebar({ tables, mappings }: Props) {
  return (
    <aside className="w-48 border-r bg-gray-50 overflow-y-auto">
      <div className="p-2">
        <div className="text-xs font-medium text-gray-500 mb-2 px-2">Tabel (topological)</div>
        {tables.map((t, i) => {
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
  )
}