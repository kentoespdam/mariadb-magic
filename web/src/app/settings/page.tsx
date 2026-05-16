/**
 * SettingsPage
 *
 * Halaman pengaturan aplikasi: Health, retention, key_mode wizard (ADR-0011).
 */

import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title="Pengaturan"
        description="Kelola konfigurasi sistem, retensi log, dan keamanan."
      />

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Sistem & Health</h2>
          <p className="text-sm text-text-muted">
            Status sistem akan ditampilkan di sini.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Retensi Log</h2>
          <p className="text-sm text-text-muted">
            Pengaturan durasi penyimpanan log sinkronisasi.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Keamanan</h2>
          <p className="text-sm text-text-muted">
            Kelola passphrase dan mode enkripsi kredensial.
          </p>
        </Card>
      </div>
    </div>
  );
}
