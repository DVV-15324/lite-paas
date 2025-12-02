import { useState, useEffect } from "react";

import { Pencil, Save } from "lucide-react";
import { UpdateProfileType } from "../model/user";
import { enqueueSnackbar } from "notistack";
import { ApiUpdateUser } from "../services/api";
import { AxiosError } from "axios";
import Papa from "papaparse";
import Select from "react-select";

import { useHookAuth } from "../../auth/hooks/authHooks";

type Field = "name" | "email" | "phone" | "address";
const fields: Field[] = ["name", "email", "phone", "address"];

type Option = { value: string; label: string };
type AddressRow = {
    ProvinceName: string;
    WardName: string;
};

export const ProfileUI = () => {
    const { profile } = useHookAuth();

    // Editable chỉ phone và address
    const isEditableField = (field: Field) => field === "address" || field === "phone";


    const [editing, setEditing] = useState<Field | null>(null);
    const [values, setValues] = useState<Record<Field, string>>({
        name: profile ? `${profile.name}` : "",
        email: profile?.email || "",
        phone: profile?.phone.String || "",
        address: profile?.address.String || "",
    });

    // Dữ liệu CSV địa chỉ
    const [rawData, setRawData] = useState<AddressRow[]>([]);

    // Các cấp chọn tỉnh/xã dạng option
    const [provinces, setProvinces] = useState<Option[]>([]);
    const [wardsMap, setWardsMap] = useState<Record<string, Option[]>>({});

    // Giá trị đang chọn cho address
    const [selectedProvince, setSelectedProvince] = useState<Option | null>(null);
    const [selectedWard, setSelectedWard] = useState<Option | null>(null);

    // Load CSV 1 lần lúc mount
    useEffect(() => {
        fetch("./data/address.csv")
            .then((res) => res.text())
            .then((csvText) => {
                Papa.parse<AddressRow>(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (result) => setRawData(result.data),
                    error: (err: any) => console.error("CSV parse error:", err),
                });
            });
    }, []);

    // Khi rawData thay đổi, build danh sách các cấp địa chỉ
    useEffect(() => {
        // Danh sách tỉnh duy nhất
        const uniqueProvinces = Array.from(new Set(rawData.map((r) => r.ProvinceName))).map((p) => ({
            value: p,
            label: p,
        }));
        setProvinces(uniqueProvinces);

        // Map xã theo tỉnh (bỏ huyện)
        const wardMap: Record<string, Set<string>> = {};
        rawData.forEach(({ ProvinceName, WardName }) => {
            if (!wardMap[ProvinceName]) wardMap[ProvinceName] = new Set();
            wardMap[ProvinceName].add(WardName);
        });
        const wardOptionMap: Record<string, Option[]> = {};
        Object.entries(wardMap).forEach(([province, wardsSet]) => {
            wardOptionMap[province] = Array.from(wardsSet).map((w) => ({
                value: w,
                label: w,
            }));
        });
        setWardsMap(wardOptionMap);
    }, [rawData]);

    // Khi values.address thay đổi (hoặc khi mount), set giá trị chọn cho Select
    useEffect(() => {
        if (!values.address) return;

        const parts = values.address.split(" - ").map((p) => p.trim());
        if (parts.length === 2) {
            const [wardName, provinceName] = parts;

            const provinceOpt = provinces.find((p) => p.value === provinceName);
            setSelectedProvince(provinceOpt || null);

            const wardOpt = wardsMap[provinceName]?.find((w) => w.value === wardName) || null;
            setSelectedWard(wardOpt);
        }
    }, [values.address, provinces, wardsMap]);

    // Cập nhật các state khi chọn địa chỉ
    const onProvinceChange = (option: Option | null) => {
        setSelectedProvince(option);
        setSelectedWard(null);
    };

    const onWardChange = (option: Option | null) => {
        setSelectedWard(option);
    };

    // Xây dựng address string chuẩn
    const buildAddress = () => {
        if (!selectedProvince || !selectedWard) return "";
        return `${selectedWard.label} - ${selectedProvince.label}`;
    };

    // Lưu địa chỉ
    const saveAddress = async () => {
        if (!selectedProvince || !selectedWard) {
            enqueueSnackbar("Vui lòng chọn đủ địa chỉ", { variant: "warning" });
            return;
        }
        const newAddress = buildAddress();
        setValues((prev) => ({ ...prev, address: newAddress }));
        setEditing(null);
        try {
            await ApiUpdateUser<UpdateProfileType>({
                data: { address: newAddress },
            });
            enqueueSnackbar("Cập nhật địa chỉ thành công!", { variant: "success" });
        } catch (error) {
            const err = error as AxiosError;
            enqueueSnackbar(err.message || "Lỗi khi cập nhật địa chỉ", { variant: "error" });
        }
    };


    if (!profile) return <div className="text-gray-500">Đang tải thông tin người dùng...</div>;



    const RenderField = ({ field }: { field: Field }) => {
        const editable = isEditableField(field);
        const isEditing = editing === field;

        // State tạm lưu input khi edit
        const [tempValue, setTempValue] = useState(values[field]);

        // Đồng bộ khi bắt đầu edit
        useEffect(() => {
            if (isEditing) {
                setTempValue(values[field]);
            }
        }, [isEditing, values, field]);

        const handleSave = async () => {
            try {
                await ApiUpdateUser<UpdateProfileType>({
                    data: { [field]: tempValue },
                });
                // Cập nhật giá trị chính
                setValues((prev) => ({ ...prev, [field]: tempValue }));
                enqueueSnackbar(`Cập nhật ${field === "phone" ? "số điện thoại" : field} thành công!`, {
                    variant: "success",
                });
                setEditing(null);
            } catch (error) {
                const err = error as AxiosError;
                enqueueSnackbar(err.message || `Lỗi khi cập nhật ${field}`, { variant: "error" });
            }
        };

        return (
            <div className="flex flex-col gap-2">
                <div className="text-gray-700 font-medium capitalize">{field}:</div>

                {isEditing && editable ? (
                    field === "address" ? (
                        <>
                            <Select
                                options={provinces}
                                value={selectedProvince}
                                onChange={onProvinceChange}
                                placeholder="Chọn tỉnh/thành"
                                isClearable
                            />
                            {selectedProvince && (
                                <Select
                                    options={wardsMap[selectedProvince.value] || []}
                                    value={selectedWard}
                                    onChange={onWardChange}
                                    placeholder="Chọn phường/xã"
                                    isClearable
                                />
                            )}
                            <button onClick={saveAddress} className="text-green-600 hover:text-green-800 mt-2 w-20">
                                <Save size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <input
                                value={tempValue}
                                onChange={(e) => setTempValue(e.target.value)}
                                className="border px-3 py-1 rounded w-full"
                            />
                            <button onClick={handleSave} className="text-green-600 hover:text-green-800 mt-2 w-20">
                                <Save size={20} />
                            </button>
                        </>
                    )
                ) : (
                    <div className="flex justify-between items-center">
                        <div>{values[field] || "Không rõ"}</div>
                        {editable && (
                            <button onClick={() => setEditing(field)} className="text-blue-500 hover:text-blue-700">
                                <Pencil size={20} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    };
    return (
        <div className="w-full xl:w-5xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
            <div className="text-xl font-semibold text-gray-800 text-center">Thông tin người dùng</div>

            <div className="flex items-center gap-4 justify-center relative w-20 h-20 mx-auto">
                <img
                    src={"/avatar.png"}
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-500 cursor-pointer"
                />
            </div>
            {fields.map((field) => (
                <RenderField key={field} field={field} />
            ))}
        </div>
    );
};
