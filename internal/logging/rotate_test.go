package logging

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLogRotation(t *testing.T) {
	tempDir := t.TempDir()
	logPath := filepath.Join(tempDir, "app.log")

	writer := InitRotatingWriter(logPath)
	// Write ~11 MB of data to trigger rotation (max 10 MB)
	chunk := make([]byte, 1024*1024) // 1 MB
	for i := 0; i < 11; i++ {
		if _, err := writer.Write(chunk); err != nil {
			t.Fatalf("write failed: %v", err)
		}
	}

	// Close the rotating logger to flush
	if rw, ok := writer.(*RotatingWriter); ok {
		rw.current.Close()
	}

	// After rotation, original file should be compressed and a new file created.
	files, err := os.ReadDir(tempDir)
	if err != nil {
		t.Fatalf("readdir failed: %v", err)
	}
	foundLog := false
	foundCompressed := false
	for _, f := range files {
		name := f.Name()
		if name == "app.log" {
			foundLog = true
		} else if name == "app.log.gz" {
			foundCompressed = true
		}
	}
	if !foundLog {
		t.Fatalf("new log file not found after rotation")
	}
	if !foundCompressed {
		t.Fatalf("compressed rotated log not found")
	}
}
