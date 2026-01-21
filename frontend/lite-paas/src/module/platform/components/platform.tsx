import { useState } from "react";
import { ServiceItem } from "../model/platform";

import { ApiCreateInvoice } from "../services/api";
import { useServices } from "../model/useServices";

const PlatformUI = () => {
    const { categories, loading } = useServices();
    const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

    const [registerLoading, setRegisterLoading] = useState(false);

    const handleConfirm = async () => {
        if (!selectedService) return;
        setRegisterLoading(true);
        try {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 30);
            await ApiCreateInvoice({
                service_id: selectedService.id,
                service_type: selectedService.service_type!,
                amount: selectedService.originalPrice!,
                payment_method: "credit_card",
                due_date: dueDate.toISOString(),
            });
            alert(`Đăng ký dịch vụ "${selectedService.name}" thành công!`);
        } catch (err: any) {
            alert(`Lỗi: ${err.message || "Unknown error"}`);
        } finally {
            setRegisterLoading(false);
            setSelectedService(null);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Đang tải dịch vụ...</div>;

    return (
        <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                {categories.map(cat => (
                    <div key={cat.id} className="bg-white rounded-xl shadow p-4">
                        <h3 className="font-bold">{cat.name}</h3>
                        <p className="text-sm text-gray-500">{cat.description}</p>
                        {cat.services.map(s => (
                            <div key={s.id} className="border p-2 mt-2 rounded">
                                <div className="space-y-1">
                                    <div><strong>Tên:</strong> {s.name}</div>
                                    <div><strong>Giá:</strong> {s.formattedPrice}</div>
                                    <div><strong>CPU:</strong> {s.specs?.cpu}</div>
                                    <div><strong>RAM:</strong> {s.specs?.ram}</div>
                                    <div><strong>Storage:</strong> {s.specs?.storage}</div>
                                </div>
                                <div className="flex space-x-2 mt-2">
                                    <button onClick={() => setSelectedService(s)} className="bg-gray-800 text-white px-2 py-1 rounded">
                                        Đăng ký
                                    </button>
                                </div>
                            </div>
                        ))}

                    </div>
                ))}
            </div>

            {/* Modal đăng ký */}
            {selectedService && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-[90%] max-w-md text-center">
                        <p>Bạn có chắc muốn đăng ký {selectedService.name}?</p>
                        <div className="flex justify-center space-x-3 mt-4">
                            <button onClick={() => setSelectedService(null)} className="bg-gray-200 px-4 py-2 rounded">Hủy</button>
                            <button onClick={handleConfirm} className="bg-blue-600 text-white px-4 py-2 rounded" disabled={registerLoading}>
                                {registerLoading ? "Đang xử lý..." : "Xác nhận"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlatformUI;