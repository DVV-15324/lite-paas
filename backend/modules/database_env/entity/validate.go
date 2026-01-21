package database_env

import ()

func CheckEnvKeys(envkey string) error {
	if len(envkey) < 1 {
		return ErrorEnvValues
	}
	return nil
}
func CheckEnvValues(envvalues string) error {
	if len(envvalues) < 1 {
		return ErrorEnvValues
	}
	return nil
}
