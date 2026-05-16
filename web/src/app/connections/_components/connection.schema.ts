import { z } from "zod";

export const connectionSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100),
  host: z.string().min(1, "Host wajib diisi").max(255),
  port: z.number().int().min(1).max(65535, "Port tidak valid"),
  user: z.string().min(1, "Username wajib diisi").max(100),
  database: z.string().min(1, "Nama database wajib diisi").max(100),
  password: z.string().max(500).optional(),
});

export type ConnectionFormInput = z.input<typeof connectionSchema>;
export type ConnectionFormValues = z.output<typeof connectionSchema>;
