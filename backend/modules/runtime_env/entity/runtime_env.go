package runtime_env

import "time"

type RuntimeEnv struct {
	Id         int        `json:"id" db:"id"`
	RuntimeId  int        `json:"runtime_id" db:"runtime_id"`
	DockerFile string     `json:"docker_file" db:"docker_file"`
	CreatedAt  *time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  *time.Time `json:"updated_at" db:"updated_at"`
}

func (p *RuntimeEnv) Mask() {
	// Không public -> không cần mask
}
