package mariadb

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/go-sql-driver/mysql"
)

var ErrNotFound = errors.New("server not found")

var ToFriendlyHandshake = map[string]string{
	"1045": "Password salah",
	"1049": "Database tidak ditemukan",
	"2003": "Server tidak dapat dihubungi",
	"2002": "Koneksi timeout",
	"2005": "Host tidak dikenal",
}

func TestConnection(cfg Config) error {
	db, err := cfg.Connect()
	if err != nil {
		return friendlyError(err)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return friendlyError(err)
	}

	if cfg.DBName != "" {
		if _, err := db.ExecContext(ctx, "USE "+cfg.DBName); err != nil {
			return friendlyError(err)
		}
	}

	if _, err := db.ExecContext(ctx, "SELECT 1"); err != nil {
		return friendlyError(err)
	}

	return nil
}

func friendlyError(err error) error {
	var me *mysql.MySQLError
	if !errors.As(err, &me) {
		return err
	}

	msg, ok := ToFriendlyHandshake[fmt.Sprintf("%d", me.Number)]
	if !ok {
		return err
	}

	return errors.New(msg)
}