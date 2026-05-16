import { z } from "zod";

export const connectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  host: z.string().min(1, "Host is required").max(255),
  port: z.coerce.number().int().min(1).max(65535),
  user: z.string().min(1, "Username is required").max(100),
  database: z.string().min(1, "Database name is required").max(100),
  password: z.string().max(500).optional(),
});

export type ConnectionFormInput = z.input<typeof connectionSchema>;
export type ConnectionFormValues = z.output<typeof connectionSchema>;
