'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Profile {
  id: string
  name: string
  status: string
  source_connection_id: string
  destination_connection_id: string
  created_at: string
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profiles').then(r => r.json()).then(data => {
      setProfiles(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Memuat...</div>

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mapping Profiles</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Profil Baru
        </button>
      </div>

      <div className="border rounded">
        {profiles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Belum ada profil</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3">Nama</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Dibuat</th>
                <th className="text-left p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-sm ${p.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {p.status === 'ready' ? 'Siap' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 text-sm">{p.created_at}</td>
                  <td className="p-3">
                    <Link href={`/profiles/${p.id}`} className="text-blue-600 hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}