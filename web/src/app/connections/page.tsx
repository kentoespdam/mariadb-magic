"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function ConnectionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Tambah Koneksi</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-medium">Database Sumber</h2>
          <div className="space-y-2">
            <Label htmlFor="source-host">Host</Label>
            <Input id="source-host" placeholder="localhost" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source-port">Port</Label>
            <Input id="source-port" placeholder="3306" defaultValue="3306" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source-user">Username</Label>
            <Input id="source-user" placeholder="root" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source-pass">Password</Label>
            <Input id="source-pass" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source-db">Database</Label>
            <Input id="source-db" placeholder="source_db" />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-medium">Database Tujuan</h2>
          <div className="space-y-2">
            <Label htmlFor="dest-host">Host</Label>
            <Input id="dest-host" placeholder="localhost" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dest-port">Port</Label>
            <Input id="dest-port" placeholder="3306" defaultValue="3306" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dest-user">Username</Label>
            <Input id="dest-user" placeholder="root" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dest-pass">Password</Label>
            <Input id="dest-pass" type="password" placeholder="••••••••" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dest-db">Database</Label>
            <Input id="dest-db" placeholder="dest_db" />
          </div>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/">Batal</Link>
        </Button>
        <Button>Simpan Koneksi</Button>
      </div>
    </div>
  );
}