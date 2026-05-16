package crypto_test

import (
	"testing"

	"magic-mariadb/internal/crypto"
)

func TestPassphraseEncryptDecrypt(t *testing.T) {
	salt := make([]byte, 16)
	for i := range salt {
		salt[i] = byte(i)
	}

	provider := crypto.NewPassphraseProvider("testpass123", salt, nil)

	ciphertext, nonce, err := provider.Encrypt("my-secret-password")
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}

	decrypted, err := provider.Decrypt(ciphertext, nonce)
	if err != nil {
		t.Fatalf("Decrypt failed: %v", err)
	}

	if decrypted != "my-secret-password" {
		t.Errorf("got %q, want %q", decrypted, "my-secret-password")
	}
}

func TestPassphraseWrongKey(t *testing.T) {
	salt := make([]byte, 16)
	for i := range salt {
		salt[i] = byte(i)
	}

	provider := crypto.NewPassphraseProvider("correctpass", salt, nil)

	ciphertext, nonce, err := provider.Encrypt("secret")
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}

	wrongProvider := crypto.NewPassphraseProvider("wrongpass", salt, nil)
	_, err = wrongProvider.Decrypt(ciphertext, nonce)
	if err != crypto.ErrInvalidPassphrase {
		t.Errorf("expected ErrInvalidPassphrase, got %v", err)
	}
}

func TestPassphraseRekey(t *testing.T) {
	salt := make([]byte, 16)
	for i := range salt {
		salt[i] = byte(i)
	}

	oldProvider := crypto.NewPassphraseProvider("oldpass123", salt, nil)
	newProvider := crypto.NewPassphraseProvider("newpass123", salt, nil)

	ciphertext, nonce, err := oldProvider.Encrypt("mydata")
	if err != nil {
		t.Fatalf("Encrypt failed: %v", err)
	}

	newCiphertext, newNonce, err := newProvider.Encrypt("mydata")
	if err != nil {
		t.Fatalf("Rekey Encrypt failed: %v", err)
	}

	if ciphertext == newCiphertext {
		t.Error("Rekey should produce different ciphertext")
	}

	if nonce == newNonce {
		t.Error("Rekey should produce different nonce")
	}
}