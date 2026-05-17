# Issue 14 — Fix preflight password decryption

## Problem
Endpoint `/api/profiles/{id}/preflight` fails to connect to MariaDB with "Access denied" (using password: NO) because it doesn't correctly handle password decryption for passwords stored with a nonce (format `ciphertext:nonce`). It ignores decryption errors and passes an empty nonce.

## Scope
- Fix `Preflight` handler in `internal/api/profiles_extra.go`.
- Ensure consistent password decryption logic across all handlers.

## Acceptance Criteria
- `Preflight` correctly splits `password_ciphertext` into ciphertext and nonce.
- `Preflight` handles decryption errors.
- Profile preflight works for connections with passwords.
