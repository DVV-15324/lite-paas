package database_env

import "time"

type DatabaseEnv struct {
	Id         int        `json:"id" db:"id"`
	DatabaseId int        `json:"database_id" db:"database_id"`
	EnvKeys    string     `json:"env_keys" db:"env_keys"`
	CreatedAt  *time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  *time.Time `json:"updated_at" db:"updated_at"`
}

func (p *DatabaseEnv) Mask() {
	// Không public -> không cần mask
}
