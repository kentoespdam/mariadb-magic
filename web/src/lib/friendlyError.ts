/**
 * friendlyError.ts
 *
 * Mirror dari logic ToFriendly BE untuk pemetaan error MariaDB dan API
 * ke pesan Bahasa Indonesia yang ramah pengguna.
 */

export interface FriendlyError {
  message: string;
  technical?: string;
  code?: string | number;
}

const MARIADB_ERRORS: Record<string | number, string> = {
  // Handshake errors
  1045: "Username atau password salah",
  1049: "Database tidak ditemukan",
  2002: "Koneksi timeout / port salah",
  2003: "Server tidak terhubung",
  2005: "Host tidak dikenal",

  // Row errors
  1048: "Kolom wajib diisi (NULL tidak diperbolehkan)",
  1062: "Data sudah ada (duplikasi pada kolom unik)",
  1264: "Nilai di luar jangkauan kolom",
  1292: "Format nilai tidak valid",
  1366: "Tipe data atau karakter tidak didukung",
  1406: "Data terlalu panjang untuk kolom ini",
  1452: "Data referensi tidak ditemukan (Foreign Key failure)",
};

const API_CODES: Record<string, string> = {
  VALIDATION_FAILED: "Data yang dikirim tidak valid",
  NOT_FOUND: "Data tidak ditemukan",
  CONFLICT: "Terjadi konflik data",
  CONFLICT_RUNNING_SESSION: "Session sedang berjalan, tidak bisa diubah",
  INTERNAL: "Terjadi kesalahan internal server",
};

export function toFriendly(err: unknown): FriendlyError {
  if (typeof err === "string") return { message: err };

  const e = err as {
    code?: string | number;
    errorCode?: string | number;
    message?: string;
    error?: { code?: string | number; message?: string };
  };

  const code = e.code || e.errorCode || e.error?.code;
  const message = e.message || e.error?.message;

  if (code && MARIADB_ERRORS[code]) {
    return {
      message: MARIADB_ERRORS[code],
      technical: message,
      code,
    };
  }

  if (code && API_CODES[code]) {
    return {
      message: API_CODES[code],
      technical: message,
      code,
    };
  }

  // Fallback
  return {
    message: message || "Terjadi kesalahan yang tidak diketahui",
    technical: message,
    code,
  };
}
