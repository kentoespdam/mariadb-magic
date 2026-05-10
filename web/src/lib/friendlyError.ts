const ERROR_MESSAGES: Record<string, { friendly: string; detail: string }> = {
  ER_DUP_ENTRY: {
    friendly: "Data duplikat",
    detail: "Data yang diinput sudah ada di database tujuan",
  },
  ER_NO_REFERENCED_ROW_2: {
    friendly: "Referensi tidak ditemukan",
    detail: "Foreign key tidak ditemukan di tabel tujuan",
  },
  ER_ROW_IS_REFERENCED_2: {
    friendly: "Data masih direferensikan",
    detail: "Data tidak bisa dihapus karena masih digunakan oleh data lain",
  },
  ER_DATA_TOO_LONG: {
    friendly: "Data terlalu panjang",
    detail: "Nilai yang diinput melebihi kapasitas kolom",
  },
  ER_TRUNCATED_WRONG_VALUE: {
    friendly: "Format salah",
    detail: "Nilai tidak sesuai dengan tipe data kolom",
  },
  ER_BAD_NULL_ERROR: {
    friendly: "Nilai tidak boleh kosong",
    detail: "Kolom tidak menerima nilai NULL",
  },
};

export function toFriendlyError(
  code: string,
  originalMessage?: string
): { friendly: string; detail: string } {
  const mapped = ERROR_MESSAGES[code];
  if (mapped) {
    return {
      ...mapped,
      detail: originalMessage ? `${mapped.detail} (${originalMessage})` : mapped.detail,
    };
  }
  return {
    friendly: "Terjadi kesalahan",
    detail: originalMessage || code,
  };
}

export function formatMariadbCode(code: string): string {
  if (code.startsWith("ER_")) {
    return code;
  }
  return `ER_${code}`;
}
