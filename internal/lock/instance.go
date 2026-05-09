package lock

import (
	"fmt"
	"net/url"
	"os"
	"path/filepath"

	"github.com/gofrs/flock"
)

type Instance struct {
	lockPath string
	flock    *flock.Flock
	url      string
}

func NewInstance(dataDir string) *Instance {
	return &Instance{
		lockPath: filepath.Join(dataDir, "magicsync.lock"),
	}
}

func (i *Instance) Acquire(serverURL string) error {
	i.url = serverURL
	i.flock = flock.New(i.lockPath)

	locked, err := i.flock.TryLock()
	if err != nil {
		return fmt.Errorf("failed to acquire lock: %w", err)
	}

	if !locked {
		return i.handleExistingInstance()
	}

	if err := os.WriteFile(i.lockPath, []byte(serverURL), 0644); err != nil {
		i.flock.Unlock()
		return fmt.Errorf("failed to write lock file: %w", err)
	}

	return nil
}

func (i *Instance) handleExistingInstance() error {
	data, err := os.ReadFile(i.lockPath)
	if err != nil {
		return fmt.Errorf("instance already running, cannot read lock file: %w", err)
	}

	existingURL := string(data)
	if existingURL != "" {
		if _, err := url.Parse(existingURL); err == nil {
			_ = OpenURL(existingURL)
		}
	}

	return ErrAnotherInstanceRunning
}

func (i *Instance) Release() {
	if i.flock != nil {
		_ = i.flock.Unlock()
	}
}

func OpenURL(url string) error {
	return openBrowser(url)
}

var ErrAnotherInstanceRunning = fmt.Errorf("another instance is already running")