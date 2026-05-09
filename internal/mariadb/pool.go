package mariadb

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/gofrs/flock"
)

var (
	mu     flock.Flock
	dbPath string
	db     *sql.DB
)

type Config struct {
	Host      string
	Port      int
	User      string
	Password  string
	DBName    string
	TLS       bool
	LocalZero bool
}

func (c *Config) DSN() string {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8mb4&parseTime=true",
		c.User, c.Password, c.Host, c.Port, c.DBName)
	if c.LocalZero {
		dsn += "&loc=UTC"
	}
	if c.TLS {
		dsn += "&tls=skip-verify"
	}
	return dsn
}

func (c *Config) Connect() (*sql.DB, error) {
	db, err := sql.Open("mysql", c.DSN())
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(4)
	db.SetMaxIdleConns(2)
	db.SetConnMaxLifetime(30 * time.Minute)
	db.SetConnMaxIdleTime(5 * time.Minute)

	if err := db.PingContext(context.Background()); err != nil {
		return nil, err
	}
	return db, nil
}

func Open(path string) (*sql.DB, error) {
	dbPath = path
	mu.Lock()
	db, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, err
	}
	return db, nil
}

func Close() error {
	if db != nil {
		db.Close()
	}
	mu.Unlock()
	return nil
}