package auth

import (
	"fmt"
	"regexp"
)

func CheckEmail(email string) error {
	if len(email) < 1 {
		return ErrorEmailIsNotEmpty
	}
	_, err := regexp.MatchString(`^[0-9a-zA-Z.\-+]+@[0-9a-zA-Z]+\.[0-9a-zA-Z]{2,}$`, email)
	if err != nil {
		return ErrorEmailNotValid
	}
	return nil
}

func CheckPasword(password string) error {
	if len(password) < 1 {
		return ErrorPasswordIsNotEmpty
	}
	if len(password) < 2 || len(password) > 20 {
		return ErrorPasswordNotValid
	}
	return nil
}

func CheckName(name string) error {
	if len(name) < 1 {
		return ErrorNameIsNotEmpty
	}
	if len(name) < 2 || len(name) > 20 {
		return ErrorNameNotValid
	}
	return nil
}

func CheckPhone(phone string) error {
	// Regex đầu số các nhà mạng tại Việt Nam
	viettel := `^(0|\+84|84)(32|33|34|35|36|37|38|39|96|97|98|86)[0-9]{7}$`
	vinaphone := `^(0|\+84|84)(81|82|83|84|85|88|91|94)[0-9]{7}$`
	mobifone := `^(0|\+84|84)(70|76|77|78|79|89|90|93)[0-9]{7}$`
	vietnamobile := `^(0|\+84|84)(52|56|58|92)[0-9]{7}$`
	gmobile := `^(0|\+84|84)(59|99)[0-9]{7}$`

	// Kết hợp tất cả regex thành một
	pattern := fmt.Sprintf("(%s)|(%s)|(%s)|(%s)|(%s)", viettel, vinaphone, mobifone, vietnamobile, gmobile)

	match, _ := regexp.MatchString(pattern, phone)
	if !match {
		return ErrorPhoneNotValid
	}
	return nil
}
