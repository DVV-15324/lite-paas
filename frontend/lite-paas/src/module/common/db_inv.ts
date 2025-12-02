export interface InvoiceItem {
    id: number;
    customer: string;
    service: string;
    date: string;
    amount: string;
    status: "paid" | "unpaid" | "pending";
    details: string;
}

// Dữ liệu hóa đơn mẫu
export const invoices: InvoiceItem[] = [
    {
        id: 1,
        customer: "Công ty SunCloud",
        service: "Dịch vụ lưu trữ Minio",
        date: "2025-10-15",
        amount: "500.000đ",
        status: "unpaid",
        details: "Thanh toán cho gói Minio Storage tháng 10/2025",
    },
    {
        id: 2,
        customer: "Nguyễn Văn A",
        service: "Database MySQL",
        date: "2025-10-12",
        amount: "300.000đ",
        status: "unpaid",
        details: "Hóa đơn dịch vụ MySQL chưa thanh toán tháng 10/2025",
    },
    {
        id: 3,
        customer: "Trần Thị B",
        service: "Python Runtime",
        date: "2025-09-28",
        amount: "250.000đ",
        status: "pending",
        details: "Hóa đơn đang xử lý thanh toán cho gói Python Runtime",
    },
    {
        id: 4,
        customer: "Công ty TechSolution",
        service: "Cloud Hosting Pro",
        date: "2025-10-01",
        amount: "1.200.000đ",
        status: "paid",
        details: "Hóa đơn đã thanh toán cho gói Cloud Hosting Pro tháng 10/2025",
    },
    {
        id: 5,
        customer: "Lê Văn C",
        service: "React JS Environment",
        date: "2025-10-05",
        amount: "150.000đ",
        status: "paid",
        details: "Hóa đơn đã thanh toán cho môi trường React JS",
    },
];

// Hàm utility để lấy hóa đơn theo ID
export const getInvoiceById = (id: number): InvoiceItem | undefined => {
    return invoices.find(invoice => invoice.id === id);
};

// Hàm utility để lọc hóa đơn theo trạng thái
export const getInvoicesByStatus = (status: InvoiceItem['status']): InvoiceItem[] => {
    return invoices.filter(invoice => invoice.status === status);
};

// Hàm utility để cập nhật trạng thái hóa đơn
export const updateInvoiceStatus = (id: number, status: InvoiceItem['status']): boolean => {
    const invoice = invoices.find(inv => inv.id === id);
    if (invoice) {
        invoice.status = status;
        return true;
    }
    return false;
};

// Hàm utility để thêm hóa đơn mới
export const addInvoice = (invoice: Omit<InvoiceItem, 'id'>): InvoiceItem => {
    const newInvoice: InvoiceItem = {
        ...invoice,
        id: Math.max(...invoices.map(inv => inv.id)) + 1
    };
    invoices.push(newInvoice);
    return newInvoice;
};