"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { UseFormReturn, FieldValues, FieldPath } from "react-hook-form";

interface ConnectionFieldsProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onTest: () => void;
  isTesting: boolean;
  prefix?: string;
}

export function ConnectionFields<T extends FieldValues>({
  form,
  onTest,
  isTesting,
  prefix,
}: ConnectionFieldsProps<T>) {
  // Helper to get nested error
  const getError = (fieldName: string) => {
    const fullPath = prefix ? `${prefix}.${fieldName}` : fieldName;
    const pathParts = fullPath.split(".");
    let currentError: any = form.formState.errors;
    for (const part of pathParts) {
      if (!currentError) return undefined;
      currentError = currentError[part];
    }
    return currentError as { message?: string } | undefined;
  };

  // Helper to register nested field
  const registerField = (
    fieldName: string,
    options: Parameters<typeof form.register>[1] = {},
  ) => {
    const fullPath = (
      prefix ? `${prefix}.${fieldName}` : fieldName
    ) as FieldPath<T>;
    return form.register(fullPath, options);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="conn-name">Nama Koneksi</Label>
        <Input
          id="conn-name"
          {...registerField("name")}
          placeholder="MariaDB Local"
        />
        {getError("name") && (
          <p className="text-xs text-destructive">
            {getError("name")?.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="conn-host">Host</Label>
          <Input
            id="conn-host"
            {...registerField("host")}
            placeholder="localhost"
          />
          {getError("host") && (
            <p className="text-xs text-destructive">
              {getError("host")?.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="conn-port">Port</Label>
          <Input
            id="conn-port"
            type="number"
            {...registerField("port", { valueAsNumber: true })}
            placeholder="3306"
          />
          {getError("port") && (
            <p className="text-xs text-destructive">
              {getError("port")?.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="conn-user">Username</Label>
          <Input id="conn-user" {...registerField("user")} placeholder="root" />
          {getError("user") && (
            <p className="text-xs text-destructive">
              {getError("user")?.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="conn-db">Database</Label>
          <Input
            id="conn-db"
            {...registerField("database")}
            placeholder="my_database"
          />
          {getError("database") && (
            <p className="text-xs text-destructive">
              {getError("database")?.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="conn-pass">Password</Label>
        <Input
          id="conn-pass"
          type="password"
          {...registerField("password")}
          placeholder="••••••••"
        />
        {getError("password") && (
          <p className="text-xs text-destructive">
            {getError("password")?.message}
          </p>
        )}
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
