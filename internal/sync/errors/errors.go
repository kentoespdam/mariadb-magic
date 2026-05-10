package errors

import (
	"fmt"
)

type ErrorCategory int

const (
	CategoryRow ErrorCategory = iota
	CategoryConnection
	CategoryUnknown
)

type FriendlyError struct {
	Category  ErrorCategory
	Technical string
	Friendly  string
	Column    string
	Value     string
	Code      int
}

func ToFriendly(code int, msg string) FriendlyError {
	switch code {
	case 1048:
		return FriendlyError{
			Category:  CategoryRow,
			Technical: msg,
			Friendly:  fmt.Sprintf("Kolom %s tidak boleh NULL", extractColumn(msg)),
		}
	case 1062:
		col, val := extractUniqueKey(msg)
		return FriendlyError{
			Category:  CategoryRow,
			Technical: msg,
			Friendly: fmt.Sprintf("Baris bertabrakan dengan data yang sudah ada di Destination pada kolom unik %s (nilai %s). Kemungkinan ada baris di Destination yang bukan berasal dari Source", col, val),
		}
	case 1264:
		return FriendlyError{
			Category:  CategoryRow,
			Technical: msg,
			Friendly:  fmt.Sprintf("Nilai %s di luar rentang kolom %s", extractValue(msg), extractColumn(msg)),
		}
	case 1292:
		return FriendlyError{
			Category:  CategoryRow,
			Technical: msg,
			Friendly:  fmt.Sprintf("Nilai tidak valid untuk kolom %s: %s", extractColumn(msg), extractValue(msg)),
		}
	case 1366:
		if isEmoji(msg) {
			return FriendlyError{
				Category:  CategoryRow,
				Technical: msg,
				Friendly:  "Nilai mengandung karakter khusus (emoji atau aksara non-Latin) yang tidak didukung kolom Destination. Minta admin Destination ubah charset kolom ke utf8mb4 dengan ALTER TABLE {tabel} CONVERT TO CHARACTER SET utf8mb4",
			}
		}
		return FriendlyError{
			Category:  CategoryRow,
			Technical: msg,
			Friendly:  fmt.Sprintf("Nilai tidak valid untuk kolom %s", extractColumn(msg)),
		}
	case 1406:
		col := extractColumn(msg)
		val := extractValue(msg)
		return FriendlyError{
			Category:  CategoryRow,
			Technical: msg,
			Friendly:  fmt.Sprintf("Data terlalu panjang untuk kolom %s (nilai: %s)", col, truncate(val, 50)),
		}
	case 1452:
		col, val := extractFK(msg)
		return FriendlyError{
			Category:  CategoryRow,
			Technical: msg,
			Friendly:  fmt.Sprintf("FK constraint gagal: nilai %s di kolom %s tidak ditemukan di tabel referensi", val, col),
		}
	case 2002, 2003, 2006, 2013:
		return FriendlyError{
			Category:  CategoryConnection,
			Technical: msg,
			Friendly:  "Tidak dapat terhubung ke database. Periksa koneksi dan coba lagi.",
		}
	default:
		return FriendlyError{
			Category:  CategoryUnknown,
			Technical: msg,
			Friendly:  fmt.Sprintf("Error %d: %s", code, msg),
		}
	}
}