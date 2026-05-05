package logging

import (
	"compress/gzip"
	"io"
	"os"
	"time"
)

// RotatingWriter implements a simple log rotation.
type RotatingWriter struct {
	filename   string
	maxSize    int64 // bytes
	maxAge     time.Duration
	compress   bool
	current    *os.File
	currentSize int64
}

// NewRotatingWriter creates a writer with given parameters.
func NewRotatingWriter(filename string, maxSizeMB int, maxAgeDays int, compress bool) *RotatingWriter {
	rw := &RotatingWriter{
		filename: filename,
		maxSize:  int64(maxSizeMB) * 1024 * 1024,
		maxAge:   time.Duration(maxAgeDays) * 24 * time.Hour,
		compress: compress,
	}
	rw.openCurrent()
	return rw
}

func (rw *RotatingWriter) openCurrent() {
	f, err := os.OpenFile(rw.filename, os.O_CREATE|os.O_RDWR|os.O_APPEND, 0o644)
	if err != nil {
		panic(err)
	}
	info, _ := f.Stat()
	rw.current = f
	rw.currentSize = info.Size()
}

func (rw *RotatingWriter) Write(p []byte) (n int, err error) {
	if rw.currentSize+int64(len(p)) > rw.maxSize {
		rw.rotate()
	}
	n, err = rw.current.Write(p)
	rw.currentSize += int64(n)
	return
}

func (rw *RotatingWriter) rotate() {
	rw.current.Close()
	// compress old file
	if rw.compress {
		compressFile(rw.filename)
	}
	// create new file
	rw.openCurrent()
}

func compressFile(name string) {
	// simplistic: rename to .gz and write gzip
	data, err := os.ReadFile(name)
	if err != nil {
		return
	}
	gzName := name + ".gz"
	gf, err := os.Create(gzName)
	if err != nil {
		return
	}
	defer gf.Close()
	w, _ := gzip.NewWriterLevel(gf, gzip.BestSpeed)
	w.Write(data)
	w.Close()
	os.Remove(name)
}

// InitRotatingWriter returns a simple rotating writer.
func InitRotatingWriter(filename string) io.Writer {
	return NewRotatingWriter(filename, 10, 30, true)
}
