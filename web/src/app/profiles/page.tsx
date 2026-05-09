'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Profile { id: string; name: string; status: string; updated_at: string }

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profiles').then(r => r.json()).then(p => { setProfiles(p); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Memuat...</div>

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mapping Profiles</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Buat Profile Baru</button>
      </div>
      <div className="space-y-2">
        {profiles.map(p => (
          <Link key={p.id} href={`/profiles/${p.id}`} className="block border rounded p-4 hover:bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="font-medium">{p.name}</span>
              <span className={`text-sm px-2 py-0.5 rounded ${p.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {p.status === 'ready' ? 'Siap' : 'Draft'}
              </span>
            </div>
          </Link>
        ))}
        {profiles.length === 0 && <p className="text-gray-500">Belum ada profile</p>}
      </div>
    </div>
  )
}