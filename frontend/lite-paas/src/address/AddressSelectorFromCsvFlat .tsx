import { useState, useEffect } from "react";
import Papa from "papaparse";
import Select from "react-select";

type Option = { value: string; label: string };

type AddressRow = {
    ProvinceName: string;
    WardName: string;
};

export const AddressSelectorFromCsvFlat = ({
    value,
    onChange,
}: {
    value: string;
    onChange: (newAddress: string) => void;
}) => {
    const [rawData, setRawData] = useState<AddressRow[]>([]);

    const [provinces, setProvinces] = useState<Option[]>([]);
    const [wardsMap, setWardsMap] = useState<Record<string, Option[]>>({});

    const [selectedProvince, setSelectedProvince] = useState<Option | null>(null);
    const [selectedWard, setSelectedWard] = useState<Option | null>(null);

    useEffect(() => {
        fetch("/data/address.csv")
            .then((res) => res.text())
            .then((csvText) => {
                Papa.parse<AddressRow>(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (result) => {
                        setRawData(result.data);
                    },
                    error: (err: any) => console.error("CSV parse error:", err),
                });
            });
    }, []);

    useEffect(() => {
        const uniqueProvinces = Array.from(
            new Set(rawData.map((r) => r.ProvinceName))
        ).map((p) => ({
            value: p,
            label: p,
        }));
        setProvinces(uniqueProvinces);
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


    useEffect(() => {
        if (!value) {
            setSelectedProvince(null);
            setSelectedWard(null);
            return;
        }

        const parts = value.split(" - ").map((p) => p.trim());
        if (parts.length === 2) {
            const [wardName, provinceName] = parts;
            const prov = provinces.find((p) => p.value === provinceName) || null;
            setSelectedProvince(prov);

            const ward =
                prov && wardsMap[prov.value]
                    ? wardsMap[prov.value].find((w) => w.value === wardName) || null
                    : null;
            setSelectedWard(ward);
        }
    }, [value, provinces, wardsMap]);

    const onProvinceChange = (option: Option | null) => {
        setSelectedProvince(option);
        setSelectedWard(null);
        if (option) {
            onChange("");
        }
    };

    const onWardChange = (option: Option | null) => {
        setSelectedWard(option);
        if (option && selectedProvince) {
            onChange(`${option.label} - ${selectedProvince.label}`);
        }
    };

    return (
        <div className="space-y-2 max-w-md">
            <Select
                placeholder="Chọn tỉnh/thành"
                options={provinces}
                onChange={onProvinceChange}
                value={selectedProvince}
                isClearable
            />

            <Select
                placeholder="Chọn phường/xã"
                options={selectedProvince ? wardsMap[selectedProvince.value] || [] : []}
                onChange={onWardChange}
                value={selectedWard}
                isClearable
                isDisabled={!selectedProvince}
            />
        </div>
    );
};
