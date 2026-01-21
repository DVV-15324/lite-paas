package database_env

import ()

type CreateDatabaseEnv struct {
	EnvKeys string `json:"env_keys"`
}

func (c *CreateDatabaseEnv) Validate() error {
	err_keys := CheckEnvKeys(c.EnvKeys)
	if err_keys != nil {
		return err_keys
	}

	return nil
}
