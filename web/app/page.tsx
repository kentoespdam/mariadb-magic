import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Magic MariaDB Sync</h1>
      <div className="space-y-2">
        <Link href="/profiles" className="block p-4 border rounded hover:bg-gray-50">
          Mapping Profiles
        </Link>
      </div>
    </div>
  )
}