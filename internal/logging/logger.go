package logging

import (
	"log"
	"os"
)

// NewLogger initializes a standard logger writing to the given file.
func NewLogger(filename string) *log.Logger {
	file, err := os.OpenFile(filename, os.O_CREATE|os.O_RDWR|os.O_APPEND, 0o644)
	if err != nil {
		panic(err)
	}
	return log.New(file, "", log.LstdFlags)
}
