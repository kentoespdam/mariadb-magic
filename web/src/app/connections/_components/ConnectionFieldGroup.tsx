/**
 * ConnectionFieldGroup.tsx
 *
 * Komponen grup input untuk konfigurasi koneksi database.
 * Digunakan dalam form pembuatan/pembaruan koneksi.
 */

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type {
  UseFormReturn,
  FieldValues,
  FieldPath,
  FieldErrors,
} from "react-hook-form";

interface ConnectionFieldGroupProps<T extends FieldValues> {
  prefix: FieldPath<T> & ("source" | "destination");
  form: UseFormReturn<T>;
  onTest: () => void;
  isTesting: boolean;
}

export function ConnectionFieldGroup<T extends FieldValues>({
  prefix,
  form,
  onTest,
  isTesting,
}: ConnectionFieldGroupProps<T>) {
  const isSource = prefix === "source";
  const errors = (form.formState.errors[prefix] as FieldErrors<T>) || {};

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {isSource ? "Database Sumber" : "Database Tujuan"}
      </h3>

      <div className="space-y-2">
        <Label>Nama Koneksi</Label>
        <Input
          {...form.register(`${prefix}.name` as FieldPath<T>)}
          placeholder={isSource ? "Source DB" : "Destination DB"}
        />
        {errors?.name && (
          <p className="text-xs text-destructive">
            {String(errors.name.message)}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Host</Label>
          <Input
            {...form.register(`${prefix}.host` as FieldPath<T>)}
            placeholder="localhost"
          />
        </div>
        <div className="space-y-2">
          <Label>Port</Label>
          <Input
            type="number"
            {...form.register(`${prefix}.port` as FieldPath<T>, {
              valueAsNumber: true,
            })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Username</Label>
          <Input
            {...form.register(`${prefix}.user` as FieldPath<T>)}
            placeholder="root"
          />
        </div>
        <div className="space-y-2">
          <Label>Database</Label>
          <Input
            {...form.register(`${prefix}.database` as FieldPath<T>)}
            placeholder={isSource ? "source_db" : "dest_db"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Password</Label>
        <Input
          type="password"
          {...form.register(`${prefix}.password` as FieldPath<T>)}
          placeholder="••••••••"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onTest}
        disabled={isTesting}
        className="w-full"
      >
        {isTesting ? "Menguji..." : "Test Koneksi"}
      </Button>
    </div>
  );
}
