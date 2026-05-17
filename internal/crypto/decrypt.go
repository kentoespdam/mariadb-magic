package crypto

import "strings"

// DecryptStoredCredential decrypts a value stored in "ciphertext:nonce" format.
// If no nonce is present, it attempts to decrypt with an empty nonce.
func DecryptStoredCredential(kp KeyProvider, storedValue string) (string, error) {
	parts := strings.Split(storedValue, ":")
	if len(parts) == 2 {
		return kp.Decrypt(parts[0], parts[1])
	}
	return kp.Decrypt(storedValue, "")
}
