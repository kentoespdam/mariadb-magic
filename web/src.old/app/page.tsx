'use client'

import { useEffect, useState } from 'react'
import { OnboardingState, SyncSession } from '../types/types'
import { SessionList } from '../components/onboarding/SessionList'
import { OnboardingCards } from '../components/onboarding/OnboardingCards'

export default function Home() {
  const [state, setState] = useState<OnboardingState | null>(null)
  const [sessions, setSessions] = useState<SyncSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/onboarding/state').then(r => r.json()).then(s => {
      setState(s)
      if (s.has_any_session) {
        fetch('/api/sessions').then(r => r.json()).then(sessions => {
          setSessions(sessions.slice(-10).reverse())
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    )
  }

  if (state?.has_any_session) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <SessionList sessions={sessions} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Mari Kita Mulai</h1>
          <p className="text-muted-foreground">
            Selesaikan langkah di bawah untuk memulai sync pertama Anda
          </p>
        </div>
        <OnboardingCards
          hasConnections={state?.has_connections ?? false}
          hasReadyProfile={state?.has_ready_profile ?? false}
          readyProfiles={state?.ready_profiles ?? 0}
        />
        <div className="text-center mt-6 text-sm text-muted-foreground">
          {state?.ready_profiles ?? 0} profile siap
        </div>
      </div>
    </div>
  )
}