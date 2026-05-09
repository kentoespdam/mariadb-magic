package crypto

import (
	"errors"

	"github.com/zalando/go-keyring"
)

var ErrNotFound = errors.New("secret not found")

type KeystoreProvider struct{}

func NewKeystoreProvider() *KeystoreProvider {
	return &KeystoreProvider{}
}

func (p *KeystoreProvider) Encrypt(plaintext string) (string, string, error) {
	err := keyring.Set(ServiceName, UserKey, plaintext)
	if err != nil {
		return "", "", err
	}
	return plaintext, "", nil
}

func (p *KeystoreProvider) Decrypt(_, _ string) (string, error) {
	secret, err := keyring.Get(ServiceName, UserKey)
	if err != nil {
		if errors.Is(err, keyring.ErrNotFound) {
			return "", ErrNotFound
		}
		return "", err
	}
	return secret, nil
}

func (p *KeystoreProvider) Rekey(newProvider KeyProvider) error {
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