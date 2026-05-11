package config

import (
	"errors"
	"log/slog"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	ListenAddr         string
	MetaDBPath         string
	EncryptionKeyPath  string
	LogLevel           string
	AppEnv             string
	MetricsEnabled     bool
	AllowRemote        bool
}

var validLogLevels = map[string]bool{
	"debug": true, "info": true, "warn": true, "error": true,
}

var validAppEnvs = map[string]bool{
	"dev": true, "prod": true,
}

func Load() (*Config, error) {
	appEnv := os.Getenv("APP_ENV")
	if appEnv == "" || appEnv == "dev" {
		_ = godotenv.Load()
	}

	cfg := &Config{
		ListenAddr:         getEnvOrDefault("LISTEN_ADDR", "127.0.0.1:8080"),
		MetaDBPath:         getEnvOrDefault("META_DB_PATH", "./magic.db"),
		EncryptionKeyPath:  os.Getenv("ENCRYPTION_KEY_PATH"),
		LogLevel:           getEnvOrDefault("LOG_LEVEL", "info"),
		AppEnv:             getEnvOrDefault("APP_ENV", "prod"),
		MetricsEnabled:     os.Getenv("METRICS_ENABLED") == "true",
		AllowRemote:       os.Getenv("MAGIC_ALLOW_REMOTE") == "true",
	}

	if cfg.EncryptionKeyPath == "" {
		return nil, errors.New("ENCRYPTION_KEY_PATH is required")
	}

	if !validLogLevels[cfg.LogLevel] {
		return nil, errors.New("invalid LOG_LEVEL: must be debug, info, warn, or error")
	}

	if !validAppEnvs[cfg.AppEnv] {
		return nil, errors.New("invalid APP_ENV: must be dev or prod")
	}

	if err := validateRemoteAccess(cfg); err != nil {
		return nil, err
	}

	return cfg, nil
}

func validateRemoteAccess(cfg *Config) error {
	host := strings.Split(cfg.ListenAddr, ":")[0]
	isLoopback := host == "127.0.0.1" || host == "localhost" || host == "::1"

	if !isLoopback && !cfg.AllowRemote {
		return errors.New("ListenAddr must be loopback (127.0.0.1 or localhost) unless MAGIC_ALLOW_REMOTE=true")
	}

	if !isLoopback && cfg.AllowRemote {
		slog.Warn("REMOTE ACCESS ENABLED — credentials NOT auth-protected. Bind to 127.0.0.1 for security.")
	}

	return nil
}

func getEnvOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}