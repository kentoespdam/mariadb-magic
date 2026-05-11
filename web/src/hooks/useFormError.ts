import { useState, useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ApiError } from "../lib/apiClient.types";

interface FormErrorDetails {
  fields?: Record<string, string>;
}

export function useFormError<T extends Record<string, unknown>>(
  form: UseFormReturn<T>,
) {
  const [banner, setBanner] = useState<string | null>(null);

  const apply = useCallback(
    (err: ApiError) => {
      const details = err.details as FormErrorDetails | undefined;
      if (details?.fields && typeof details.fields === "object") {
        Object.entries(details.fields).forEach(([field, message]) => {
          form.setError(field as keyof T, { message: String(message) });
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
