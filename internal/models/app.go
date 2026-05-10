package models

type AppSettings struct {
	KeyMode   string `json:"key_mode"`
	KDFSalt   []byte `json:"kdf_salt"`
	KDFParams string `json:"kdf_params_json"`
}

type Connection struct {
	ID                 string `json:"id"`
	Name               string `json:"name"`
	Host               string `json:"host"`
	Port               int    `json:"port"`
	User               string `json:"user"`
	PasswordCiphertext string `json:"password_ciphertext"`
	CreatedAt          string `json:"created_at"`
	UpdatedAt          string `json:"updated_at"`
}
