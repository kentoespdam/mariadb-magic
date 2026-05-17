package runner

import (
	"context"
	"database/sql"
	"encoding/json"

	"magic-mariadb/internal/crypto"
	"magic-mariadb/internal/mariadb"
	"magic-mariadb/internal/models"
)

func (r *Runner) decryptPassword(ciphertext string) (string, error) {
	return crypto.DecryptStoredCredential(r.crypto, ciphertext)
}

func connectMariaDB(host string, port int, user, password string) (*sql.DB, error) {
	cfg := mariadb.Config{Host: host, Port: port, User: user, Password: password}
	return cfg.Connect()
}

func getTablesForSelection(db *sql.DB, selectionJSON []byte) ([]mariadb.TableSchema, error) {
	var selection models.TableSelection
	if err := json.Unmarshal(selectionJSON, &selection); err != nil {
		return nil, err
	}
	var dbName string
	if err := db.QueryRowContext(context.Background(), "SELECT DATABASE()").Scan(&dbName); err != nil {
		return nil, err
	}
	schema, err := mariadb.NewIntrospector(db, dbName, 30).GetSchema(context.Background())
	if err != nil {
		return nil, err
	}
	var result []mariadb.TableSchema
	for _, t := range schema.Tables {
		for _, sel := range selection.Tables {
			if t.Name == sel {
				result = append(result, t)
			}
		}
	}
	return result, nil
}

func getDestSchema(db *sql.DB, _ []mariadb.TableSchema) (map[string]models.TableSchema, error) {
	var dbName string
	if err := db.QueryRowContext(context.Background(), "SELECT DATABASE()").Scan(&dbName); err != nil {
		return nil, err
	}
	schema, err := mariadb.NewIntrospector(db, dbName, 30).GetSchema(context.Background())
	if err != nil {
		return nil, err
	}
	result := make(map[string]models.TableSchema)
	for _, t := range schema.Tables {
		ts := make(models.TableSchema)
		for _, c := range t.Columns {
			ts[c.Name] = models.ColumnInfo{
				Name:     c.Name,
				Nullable: c.Nullable,
				Default:  c.Default,
				IsPK:     isPK(c.Name, t.PK),
			}
		}
		result[t.Name] = ts
	}
	return result, nil
}

func isPK(col string, pk []string) bool {
	for _, p := range pk {
		if p == col {
			return true
		}
	}
	return false
}

func (r *Runner) connectProfile(profile models.MappingProfile) (*sql.DB, *sql.DB, error) {
	srcConn, err := r.sessionsRepo.GetConnection(profile.SourceConnectionID)
	if err != nil {
		return nil, nil, err
	}
	destConn, err := r.sessionsRepo.GetConnection(profile.DestinationConnectionID)
	if err != nil {
		return nil, nil, err
	}
	srcPwd, err := r.decryptPassword(srcConn.PasswordCiphertext)
	if err != nil {
		return nil, nil, err
	}
	destPwd, err := r.decryptPassword(destConn.PasswordCiphertext)
	if err != nil {
		return nil, nil, err
	}
	srcDB, err := connectMariaDB(srcConn.Host, srcConn.Port, srcConn.User, srcPwd)
	if err != nil {
		return nil, nil, err
	}
	destDB, err := connectMariaDB(destConn.Host, destConn.Port, destConn.User, destPwd)
	if err != nil {
		srcDB.Close()
		return nil, nil, err
	}
	return srcDB, destDB, nil
}
