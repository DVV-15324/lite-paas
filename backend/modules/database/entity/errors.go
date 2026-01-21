package storage

import "errors"

var (
	ErrStorageNameNotValid        = errors.New("tên storage không hợp lệ")
	ErrStoragePriceNotValid       = errors.New("giá storage không hợp lệ")
	ErrStorageDescriptionNotValid = errors.New("miêu tả storage không hợp lệ")
)
