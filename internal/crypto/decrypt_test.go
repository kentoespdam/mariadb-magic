package crypto

import (
	"testing"
)

type mockKeyProvider struct{}

func (m *mockKeyProvider) Encrypt(plaintext string) (string, string, error) {
	return plaintext, "nonce", nil
}

func (m *mockKeyProvider) Decrypt(ciphertext, nonce string) (string, error) {
	if nonce == "" {
		return "decrypted:" + ciphertext, nil
	}
	return "decrypted:" + ciphertext + ":" + nonce, nil
}

func (m *mockKeyProvider) Rekey(newProvider KeyProvider) error {
	return nil
}

func TestDecryptStoredCredential(t *testing.T) {
	kp := &mockKeyProvider{}

	tests := []struct {
		name        string
		storedValue string
		expected    string
	}{
		{
			name:        "with nonce",
			storedValue: "secret:123",
			expected:    "decrypted:secret:123",
		},
		{
			name:        "without nonce",
			storedValue: "secret",
			expected:    "decrypted:secret",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := DecryptStoredCredential(kp, tt.storedValue)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != tt.expected {
				t.Errorf("expected %q, got %q", tt.expected, got)
			}
		})
	}
}
