export interface HistoryInvoiceItem {
    id: string;
    date: string;
    service: string;
    amount: number;
    status: "paid" | "pending" | "overdue";
    dueDate: string;
}


// Dữ liệu lịch sử hóa đơn
export const historyInvoices: HistoryInvoiceItem[] = [
    {
        id: "INV-2024-001",
        date: "15/10/2024",
        service: "MySQL Database",
        amount: 450000,
        status: "paid",
        dueDate: "30/10/2024"
    },
    {
        id: "INV-2024-002",
        date: "01/10/2024",
        service: "Node.js Runtime",
        amount: 320000,
        status: "paid",
        dueDate: "15/10/2024"
    },
    {
        id: "INV-2024-003",
        date: "20/09/2024",
        service: "PostgreSQL",
        amount: 520000,
        status: "paid",
        dueDate: "05/10/2024"
    },
    {
        id: "INV-2024-004",
        date: "05/09/2024",
        service: "Redis Cache",
        amount: 280000,
        status: "paid",
        dueDate: "20/09/2024"
    },
    {
        id: "INV-2024-005",
        date: "15/08/2024",
        service: "Python Environment",
        amount: 380000,
        status: "paid",
        dueDate: "30/08/2024"
    }
];

// Dữ liệu filter
export const years = ["2024", "2023", "2022"];

export const months = [
    { value: "01", label: "Tháng 1" },
    { value: "02", label: "Tháng 2" },
    { value: "03", label: "Tháng 3" },
    { value: "04", label: "Tháng 4" },
    { value: "05", label: "Tháng 5" },
    { value: "06", label: "Tháng 6" },
    { value: "07", label: "Tháng 7" },
    { value: "08", label: "Tháng 8" },
    { value: "09", label: "Tháng 9" },
    { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" },
    { value: "12", label: "Tháng 12" }
];
// Hàm utility cho HistoryInvoice
export const getHistoryInvoicesByPeriod = (year: string, month: string): HistoryInvoiceItem[] => {
    return historyInvoices.filter(invoice => {
        const invoiceDate = invoice.date.split('/');
        return invoiceDate[2] === year && invoiceDate[1] === month;
    });
};

export const getTotalPaidAmount = (): number => {
    return historyInvoices
        .filter(invoice => invoice.status === 'paid')
        .reduce((total, invoice) => total + invoice.amount, 0);
};

export const getPaidInvoicesCount = (): number => {
    return historyInvoices.filter(invoice => invoice.status === 'paid').length;
};

export const getStatusColor = (status: string): string => {
    switch (status) {
        case "paid":
            return "bg-green-100 text-green-800";
        case "pending":
            return "bg-yellow-100 text-yellow-800";
        case "overdue":
            return "bg-red-100 text-red-800";
        default:
            return "bg-gray-100 text-gray-800";
    }
};

export const getStatusText = (status: string): string => {
    switch (status) {
        case "paid":
            return "Đã thanh toán";
        case "pending":
            return "Chờ thanh toán";
        case "overdue":
            return "Quá hạn";
        default:
            return status;
    }
};

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
};