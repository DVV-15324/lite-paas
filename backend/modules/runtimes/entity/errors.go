package runtime

import "errors"

var (
	ErrorRuntimeNameNotValid     = errors.New("tên runtime không hợp lệ")
	ErrorRuntimePriceNotValid    = errors.New("giá runtime không hợp lệ")
	ErrorRuntimeDescribeNotValid = errors.New("miêu tả runtime không hợp lệ")
	ErrorRuntimeVersionNotValid  = errors.New("version runtime version không hợp lệ")
)
