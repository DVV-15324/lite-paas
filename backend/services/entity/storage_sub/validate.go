package storagesub

// func checkLinkReturn(link string) error {
// 	if len(link) == 0 {
// 		return ErrStorageSubInvalidLinkReturn
// 	}
// 	return nil
// }

func checkUsername(user string) error {
	if len(user) == 0 {
		return ErrStorageSubInvalidUsername
	}
	return nil
}

func checkPassword(pass string) error {
	if len(pass) < 4 {
		return ErrStorageSubInvalidPassword
	}
	return nil
}

func checkPort(port string) error {
	if len(port) == 0 {
		return ErrStorageSubInvalidPort
	}
	return nil
}
