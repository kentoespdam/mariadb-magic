"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Connection } from "@/types/Connection"
import { Loader2, CheckCircle2, XCircle, Database } from "lucide-react"

interface ConnectionFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: ConnectionFormData) => void
  onTest?: (data: ConnectionFormData) => Promise<{ status: "ok" | "failed"; message?: string }>
  initialData?: Partial<Connection>
}

export interface ConnectionFormData {
  name: string
  host: string
  port: number
  username: string
  password: string
  database: string
  ssl: boolean
}

export function ConnectionForm({ open, onClose, onSave, onTest, initialData }: ConnectionFormProps) {
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "failed">("idle")
  const [testMessage, setTestMessage] = useState<string>("")

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ConnectionFormData>({
    defaultValues: {
      name: initialData?.name || "",
      host: initialData?.host || "",
      port: initialData?.port || 3306,
      username: initialData?.username || "",
      password: initialData?.password || "",
      database: initialData?.database || "",
      ssl: initialData?.ssl || false,
    },
  })

  const handleTest = async (data: ConnectionFormData) => {
    if (!onTest) return
    setTestStatus("testing")
    setTestMessage("")
    try {
      const result = await onTest(data)
      setTestStatus(result.status)
      setTestMessage(result.message || "")
    } catch {
      setTestStatus("failed")
      setTestMessage("Gagal menghubungi server")
    }
  }

  const handleSave = (data: ConnectionFormData) => {
    onSave(data)
    reset()
    onClose()
  }

  const handleClose = () => {
    reset()
    setTestStatus("idle")
    setTestMessage("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            {initialData?.id ? "Edit Koneksi" : "Tambah Koneksi Baru"}
          </DialogTitle>
          <DialogDescription>
            Masukkan detail koneksi MariaDB untuk Source atau Destination
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Koneksi</Label>
            <Input
              id="name"
              placeholder="Contoh: Source Production"
              {...register("name", { required: "Nama koneksi wajib diisi" })}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-[12px] text-error">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="host">Host</Label>
              <Input
                id="host"
                placeholder="localhost atau IP"
                {...register("host", { required: "Host wajib diisi" })}
                aria-invalid={!!errors.host}
              />
              {errors.host && (
                <p className="text-[12px] text-error">{errors.host.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                {...register("port", {
                  required: "Port wajib diisi",
                  valueAsNumber: true,
                  min: { value: 1, message: "Port minimal 1" },
                  max: { value: 65535, message: "Port maksimal 65535" },
                })}
                aria-invalid={!!errors.port}
              />
              {errors.port && (
                <p className="text-[12px] text-error">{errors.port.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="username"
                {...register("username", { required: "Username wajib diisi" })}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <p className="text-[12px] text-error">{errors.username.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password", { required: "Password wajib diisi" })}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-[12px] text-error">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="database">Database</Label>
            <Input
              id="database"
              placeholder="nama_database"
              {...register("database", { required: "Database wajib diisi" })}
              aria-invalid={!!errors.database}
            />
            {errors.database && (
              <p className="text-[12px] text-error">{errors.database.message}</p>
            )}
          </div>

          {testStatus !== "idle" && (
            <div
              className={`flex items-center gap-2 rounded border p-3 ${
                testStatus === "ok"
                  ? "border-success/30 bg-success/10"
                  : testStatus === "failed"
                  ? "border-error/30 bg-error/10"
                  : ""
              }`}
            >
              {testStatus === "testing" && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-info" />
                  <span className="text-small">Menguji koneksi...</span>
                </>
              )}
              {testStatus === "ok" && (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-small text-success">Koneksi berhasil</span>
                </>
              )}
              {testStatus === "failed" && (
                <>
                  <XCircle className="h-4 w-4 text-error" />
                  <span className="text-small text-error">
                    {testMessage || "Koneksi gagal"}
                  </span>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            {onTest && (
              <Button
                type="button"
                variant="outline"
                onClick={handleSubmit(handleTest)}
                disabled={testStatus === "testing"}
              >
                {testStatus === "testing" ? "Menguji..." : "Test Koneksi"}
              </Button>
            )}
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!isDirty && testStatus === "ok"}>
              Simpan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}