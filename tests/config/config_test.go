package config_test

import (
	"os"
	"testing"

	"magic-mariadb/internal/config"
)

func TestLoad_MissingEncryptionKeyPath(t *testing.T) {
	os.Unsetenv("ENCRYPTION_KEY_PATH")
	os.Setenv("APP_ENV", "prod")

	cfg, err := config.Load()
	if cfg != nil {
		t.Error("expected nil Config on missing required field")
	}
	if err == nil {
		t.Error("expected error on missing ENCRYPTION_KEY_PATH")
	}
}

func TestLoad_InvalidLogLevel(t *testing.T) {
	os.Setenv("ENCRYPTION_KEY_PATH", "/tmp/key")
	os.Setenv("LOG_LEVEL", "invalid")
	os.Setenv("APP_ENV", "prod")

	cfg, err := config.Load()
	if cfg != nil {
		t.Error("expected nil Config on invalid LOG_LEVEL")
	}
	if err == nil {
		t.Error("expected error on invalid LOG_LEVEL")
	}
}

func TestLoad_InvalidAppEnv(t *testing.T) {
	os.Setenv("ENCRYPTION_KEY_PATH", "/tmp/key")
	os.Unsetenv("LOG_LEVEL")
	os.Setenv("APP_ENV", "invalid")

	cfg, err := config.Load()
	if cfg != nil {
		t.Error("expected nil Config on invalid APP_ENV")
	}
	if err == nil {
		t.Error("expected error on invalid APP_ENV")
	}
}

func TestLoad_DefaultValues(t *testing.T) {
	os.Setenv("ENCRYPTION_KEY_PATH", "/tmp/key")
	os.Unsetenv("LISTEN_ADDR")
	os.Unsetenv("META_DB_PATH")
	os.Unsetenv("LOG_LEVEL")
	os.Setenv("APP_ENV", "prod")
	os.Unsetenv("METRICS_ENABLED")
	os.Unsetenv("MAGIC_ALLOW_REMOTE")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.ListenAddr != "127.0.0.1:8080" {
		t.Errorf("expected default ListenAddr, got %s", cfg.ListenAddr)
	}
	if cfg.MetaDBPath != "./magic.db" {
		t.Errorf("expected default MetaDBPath, got %s", cfg.MetaDBPath)
	}
	if cfg.LogLevel != "info" {
		t.Errorf("expected default LogLevel, got %s", cfg.LogLevel)
	}
}

func TestLoad_EnvOverride(t *testing.T) {
	os.Setenv("ENCRYPTION_KEY_PATH", "/tmp/key")
	os.Setenv("LISTEN_ADDR", "0.0.0.0:9000")
	os.Setenv("META_DB_PATH", "./test.db")
	os.Setenv("LOG_LEVEL", "debug")
	os.Setenv("APP_ENV", "dev")
	os.Setenv("METRICS_ENABLED", "true")
	os.Setenv("MAGIC_ALLOW_REMOTE", "true")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.ListenAddr != "0.0.0.0:9000" {
		t.Errorf("expected overridden ListenAddr, got %s", cfg.ListenAddr)
	}
	if cfg.MetaDBPath != "./test.db" {
		t.Errorf("expected overridden MetaDBPath, got %s", cfg.MetaDBPath)
	}
	if cfg.LogLevel != "debug" {
		t.Errorf("expected overridden LogLevel, got %s", cfg.LogLevel)
	}
	if cfg.AppEnv != "dev" {
		t.Errorf("expected overridden AppEnv, got %s", cfg.AppEnv)
	}
	if !cfg.MetricsEnabled {
		t.Error("expected MetricsEnabled true")
	}
	if !cfg.AllowRemote {
		t.Error("expected AllowRemote true")
	}
}

func TestLoad_NonLoopbackWithoutAllowRemote_Fails(t *testing.T) {
	os.Setenv("ENCRYPTION_KEY_PATH", "/tmp/key")
	os.Setenv("LISTEN_ADDR", "0.0.0.0:8080")
	os.Setenv("APP_ENV", "prod")
	os.Unsetenv("MAGIC_ALLOW_REMOTE")

	cfg, err := config.Load()
	if cfg != nil {
		t.Error("expected nil Config when non-loopback without AllowRemote")
	}
	if err == nil {
		t.Error("expected error when non-loopback without AllowRemote")
	}
}

func TestLoad_LoopbackAlways_Passes(t *testing.T) {
	os.Setenv("ENCRYPTION_KEY_PATH", "/tmp/key")
	os.Setenv("LISTEN_ADDR", "127.0.0.1:8080")
	os.Setenv("APP_ENV", "prod")
	os.Unsetenv("MAGIC_ALLOW_REMOTE")

	cfg, err := config.Load()
	if err != nil {
		t.Errorf("unexpected error: %v", err)
	}
	if cfg == nil {
		t.Error("expected Config when loopback")
	}
}