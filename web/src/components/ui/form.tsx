"use client";

import type * as React from "react";
import type * as LabelPrimitive from "@radix-ui/react-label";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { get } from "lodash";

interface FormProps<TFieldValues extends FieldValues>
  extends React.ComponentProps<"form"> {
  form: UseFormReturn<TFieldValues, unknown, FieldValues>;
}

function Form<TFieldValues extends FieldValues>({
  children,
  ...props
}: FormProps<TFieldValues>) {
  return (
    <form data-slot="form" {...props}>
      <FormFieldProvider>{children}</FormFieldProvider>
    </form>
  );
}

function FormFieldProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface FormFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  form: UseFormReturn<TFieldValues, unknown, FieldValues>;
  render: (props: {
    field: React.ComponentProps<"input">;
    fieldState: {
      error?: { message?: string };
    };
  }) => React.ReactElement;
}

function FormField<TFieldValues extends FieldValues>({
  name,
  form,
  render,
}: FormFieldProps<TFieldValues>) {
  const value = get(form.watch(), name) ?? "";
  const error = get(form.formState.errors, name) as
    | { message?: string }
    | undefined;

  return render({
    field: {
      name,
      value: value as string | number,
      onChange: (e) => {
        const val =
          e.target instanceof HTMLInputElement && e.target.type === "number"
            ? Number(e.target.value)
            : e.target.value;
        form.setValue(name, val as never, { shouldValidate: true });
      },
      onBlur: () => form.trigger(name),
      id: name,
    },
    fieldState: { error },
  });
}

function FormLabel({
  children,
  className,
  htmlFor,
}: React.ComponentProps<typeof LabelPrimitive.Root> & { htmlFor?: string }) {
  return (
    <label data-slot="form-label" className={className} htmlFor={htmlFor}>
      {children}
    </label>
  );
}

function FormControl({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="form-message" className={className} {...props} />;
}

function FormItem({
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { children?: React.ReactNode }) {
  return (
    <div data-slot="form-item" className={className} {...props}>
      {children}
    </div>
  );
}

export { Form, FormField, FormLabel, FormControl, FormMessage, FormItem };
