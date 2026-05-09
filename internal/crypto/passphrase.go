package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"runtime"

	"golang.org/x/crypto/argon2"
)

var ErrInvalidPassphrase = errors.New("invalid passphrase")

type PassphraseProvider struct {
	passphrase []byte
	salt      []byte
	params    Params
}

type Params struct {
	Memory      uint32
	Iterations uint32
	Parallelism uint8
	SaltLen    uint32
	KeyLen     uint32
}

var DefaultParams = &Params{
	Memory:      64 * 1024,
	Iterations: 1,
	Parallelism: uint8(runtime.NumCPU()),
	SaltLen:    16,
	KeyLen:     32,
}

func NewPassphraseProvider(passphrase string, salt []byte, params *Params) *PassphraseProvider {
	if params == nil {
		params = DefaultParams
	}
	return &PassphraseProvider{
		passphrase: []byte(passphrase),
		salt:      salt,
		params:    *params,
	}
}

func (p *PassphraseProvider) Key() ([]byte, error) {
	return argon2.IDKey(p.passphrase, p.salt, p.params.Iterations, p.params.Memory, p.params.Parallelism, p.params.KeyLen), nil
}

func (p *PassphraseProvider) Encrypt(plaintext string) (string, string, error) {
	key, err := p.Key()
	if err != nil {
		return "", "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", "", err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", "", err
	}

	nonce := make([]byte, aesgcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", "", err
	}

	ciphertext := aesgcm.Seal(nil, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), base64.StdEncoding.EncodeToString(nonce), nil
}

func (p *PassphraseProvider) Decrypt(ciphertextB64, nonceB64 string) (string, error) {
	key, err := p.Key()
	if err != nil {
		return "", err
	}

	ciphertext, err := base64.StdEncoding.DecodeString(ciphertextB64)
	if err != nil {
		return "", err
	}

	nonce, err := base64.StdEncoding.DecodeString(nonceB64)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	plaintext, err := aesgcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", ErrInvalidPassphrase
	}
	return string(plaintext), nil
}

func (p *PassphraseProvider) Rekey(newProvider KeyProvider) error {
	oldKey, err := p.Decrypt("", "")
	if err != nil {
		return err
	}
	ciphertext, nonce, err := newProvider.Encrypt(oldKey)
	if err != nil {
		return err
	}
	_, err = newProvider.Decrypt(ciphertext, nonce)
	return err
}

func NewPassphraseKeyProvider(passphrase string) KeyProvider {
	return NewPassphraseProvider(passphrase, nil, nil)
}