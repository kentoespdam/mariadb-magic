"use client"

import { AppShell } from "@/components/AppShell"
import { PageHeader } from "@/components/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings2, Database, Download, Trash2 } from "lucide-react"

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="page-container py-6">
        <PageHeader
          title="Pengaturan"
          description="Konfigurasi dan pengaturan aplikasi"
          actions={
            <Button variant="ghost" size="sm">
              <Settings2 className="mr-2 h-4 w-4" />
              Edit Pengaturan
            </Button>
          }
        />

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded bg-primary/10 p-2">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Database Health</CardTitle>
                <CardDescription>Kelola dan monitor kesehatan database</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-text-secondary">Ukuran database</p>
                  <p className="text-h3 font-mono">2.4 MB</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-text-secondary">Total koneksi</p>
                  <p className="text-h3 font-mono">2</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Semua
                </Button>
                <Button variant="outline" size="sm">
                  <Database className="mr-2 h-4 w-4" />
                  Vacuum
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded bg-primary/10 p-2">
                <Settings2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Keamanan</CardTitle>
                <CardDescription>Pengaturan keamanan credential</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-text-secondary">Mode penyimpanan</p>
                  <p className="text-h3 font-mono">OS Keystore</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Ganti Mode
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="rounded bg-destructive/10 p-2">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle>Kebersihan Log</CardTitle>
                <CardDescription>Hapus log lama yang sudah tidak diperlukan</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-text-secondary">Total session</p>
                  <p className="text-h3 font-mono">15</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-small text-text-secondary">Total log error</p>
                  <p className="text-h3 font-mono">42</p>
                </div>
              </div>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Bersihkan Log Lama
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}