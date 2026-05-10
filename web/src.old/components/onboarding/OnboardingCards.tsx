'use client'

import Link from 'next/link'
import { Database, FileText, Play, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface OnboardingCardsProps {
  hasConnections: boolean
  hasReadyProfile: boolean
  readyProfiles: number
}

const cards = [
  {
    step: 1,
    title: 'Tambahkan Koneksi',
    description: 'Hubungkan database MariaDB source dan destination Anda',
    icon: Database,
    cta: 'Tambah Koneksi',
    href: '/connections/new',
    unlocked: true,
    lockedHint: null,
  },
  {
    step: 2,
    title: 'Buat Mapping Profile',
    description: 'Pilih tabel dan kolom yang akan disinkronkan',
    icon: FileText,
    cta: 'Buat Mapping Profile',
    href: '/profiles',
    unlockedKey: 'hasConnections',
    lockedHint: 'Lengkapi langkah sebelumnya dulu',
  },
  {
    step: 3,
    title: 'Mulai Sync Pertama',
    description: 'Jalankan sinkronisasi data pertama Anda',
    icon: Play,
    cta: 'Mulai Sync',
    href: '/profiles',
    unlockedKey: 'hasReadyProfile',
    lockedHint: 'Lengkapi langkah sebelumnya dulu',
  },
]

export function OnboardingCards({ hasConnections, hasReadyProfile }: OnboardingCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => {
        const isUnlocked = card.unlocked || (card.unlockedKey === 'hasConnections' && hasConnections) || (card.unlockedKey === 'hasReadyProfile' && hasReadyProfile)
        const Icon = card.icon

        const content = (
          <Card className={`h-full transition-all duration-200 ${isUnlocked ? 'hover:shadow-md' : 'opacity-50'}`}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Icon className={`h-5 w-5 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <span className="text-sm text-muted-foreground">Langkah {card.step}</span>
              </div>
              <CardTitle className="text-lg">{card.title}</CardTitle>
              <CardDescription>{card.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {isUnlocked ? (
                <Button asChild className="w-full gap-2">
                  <Link href={card.href}>
                    {card.cta}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button disabled className="w-full">
                  {card.cta}
                </Button>
              )}
            </CardContent>
          </Card>
        )

        if (!isUnlocked && card.lockedHint) {
          return (
            <TooltipProvider key={card.step} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild className="w-full h-full cursor-not-allowed">
                  <div className="h-full">{content}</div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-center">
                  <p>{card.lockedHint}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        }

        return <div key={card.step}>{content}</div>
      })}
    </div>
  )
}