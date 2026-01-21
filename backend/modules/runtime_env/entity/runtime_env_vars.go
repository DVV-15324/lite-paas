package runtime_env

import ()

type CreateRuntimeEnv struct {
	DockerFile string `json:"docker_file"`
}

func (c *CreateRuntimeEnv) Validate() error {
	err_runtime_env := CheckDockerFile(c.DockerFile)
	if err_runtime_env != nil {
		return err_runtime_env
	}
	return nil
}
