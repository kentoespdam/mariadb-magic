import { useState, useCallback } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import type { ApiError } from "../lib/apiClient.types";

interface FormErrorDetails {
  fields?: Record<string, string>;
}

export function useFormError<T extends FieldValues>(
  form: UseFormReturn<T, unknown, FieldValues>,
) {
  const [banner, setBanner] = useState<string | null>(null);

  const apply = useCallback(
    (err: ApiError) => {
      const details = err.details as FormErrorDetails | undefined;
      if (details?.fields && typeof details.fields === "object") {
        Object.entries(details.fields).forEach(([field, message]) => {
          form.setError(field as Path<T>, { message: String(message) });
        });
      } else {
        setBanner(err.message);
      }
    },
    [form],
  );

  const clear = useCallback(() => {
    setBanner(null);
    form.clearErrors();
  }, [form]);

  return { banner, apply, clear };
}
