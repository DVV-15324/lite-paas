package storage

func CheckName(name string) error {
	if len(name) == 0 {
		return ErrStorageNameNotValid
	}
	return nil
}

func CheckPrice(price float64) error {
	if price <= 0 {
		return ErrStoragePriceNotValid
	}
	return nil
}

func CheckDescription(desc string) error {
	if len(desc) < 5 {
		return ErrStorageDescriptionNotValid
	}
	return nil
}
