package crypto

const (
	ServiceName = "magicsync"
	UserKey     = "master"
	KeyLen      = 32
)

type KeyMode string

const (
	KeyModeOSKeystore KeyMode = "os_keystore"
	KeyModePassphrase KeyMode = "passphrase"
)

type KeyProvider interface {
	Encrypt(plaintext string) (ciphertext string, nonce string, err error)
	Decrypt(ciphertext, nonce string) (plaintext string, err error)
	Rekey(newProvider KeyProvider) error
}

type ProviderFactory func(keyMode KeyMode, db Getter) (KeyProvider, error)

type Getter interface {
	Get(key string) (string, error)
	Set(key, value string) error
}
