package runtime_env

import ()

func CheckDockerFile(dockerFile string) error {
	if len(dockerFile) < 0 {
		return ErrorDockerFile
	}
	return nil
}
