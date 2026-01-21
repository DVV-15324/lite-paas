package database_sub

func checkUsername(user string) error {
	if len(user) == 0 {
		return ErrDatabaseSubInvalidUsername
	}
	return nil
}

func checkPassword(pass string) error {
	if len(pass) < 4 {
		return ErrDatabaseSubInvalidPassword
	}
	return nil
}
