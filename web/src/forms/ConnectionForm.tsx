"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useFormError } from "@/hooks/useFormError";
import { useState } from "react";
import { connectionService } from "@/lib/services/connections";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  connectionSchema,
  type ConnectionFormValues,
} from "./connection.schema";

interface ConnectionFormProps {
  initialValues?: Partial<ConnectionFormValues>;
  onSuccess?: () => void;
}

export function ConnectionForm({
  initialValues,
  onSuccess,
}: ConnectionFormProps) {
  const router = useRouter();
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: initialValues ?? {
      name: "",
      host: "",
      port: 3306,
      user: "",
      password: "",
    },
  });

  const { banner, apply, clear } = useFormError(form);

  async function onSubmit(values: ConnectionFormValues) {
    setIsSaving(true);
    clear();
    try {
      const result = await connectionService.testPreSave(values);
      if (!result.success) {
        apply(
          Object.assign(new Error(result.error ?? "Test failed") as never, {
            code: "VALIDATION_FAILED",
            details: { fields: { host: result.error } },
          }),
        );
        return;
      }
      await connectionService.create(values);
      onSuccess?.();
      router.refresh();
    } catch (err) {
      apply(err as never);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTest() {
    const valid = await form.trigger();
    if (!valid) return;
    setIsTesting(true);
    try {
      const values = form.getValues();
      const result = await connectionService.testPreSave(values);
      if (!result.success) {
        alert(result.error ?? "Connection failed");
      } else {
        alert("Connection successful!");
      }
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <Form form={form}>
      {banner && (
        <div className="rounded border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {banner}
        </div>
      )}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="name"
          form={form}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor="name">Connection Name</FormLabel>
              <FormControl>
                <Input id="name" placeholder="My Database" {...field} />
              </FormControl>
              {fieldState.error && (
                <FormMessage>{fieldState.error.message}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          name="host"
          form={form}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor="host">Host</FormLabel>
              <FormControl>
                <Input id="host" placeholder="localhost" {...field} />
              </FormControl>
              {fieldState.error && (
                <FormMessage>{fieldState.error.message}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          name="port"
          form={form}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor="port">Port</FormLabel>
              <FormControl>
                <Input id="port" type="number" {...field} />
              </FormControl>
              {fieldState.error && (
                <FormMessage>{fieldState.error.message}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          name="user"
          form={form}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor="user">Username</FormLabel>
              <FormControl>
                <Input id="user" placeholder="root" {...field} />
              </FormControl>
              {fieldState.error && (
                <FormMessage>{fieldState.error.message}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <FormField
          name="password"
          form={form}
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••"
                  {...field}
                />
              </FormControl>
              {fieldState.error && (
                <FormMessage>{fieldState.error.message}</FormMessage>
              )}
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Connection"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={isTesting}
          >
            {isTesting ? "Testing..." : "Test Connection"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
