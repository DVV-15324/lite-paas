export interface ServiceItem {
    id: number;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'pending';
    price?: string;
    specs?: {
        cpu: string;
        ram: string;
        storage: string;
        os: string;
    };
}


export interface SupportRequestItem {
    id: number;
    department: string;
    service: string;
    title: string;
    date: string;
    status: string;
}

export interface Department {
    id: string;
    name: string;
    icon: string;
}


// Dữ liệu hỗ trợ
export const departments: Department[] = [
    { id: 'technical', name: 'Phòng kỹ thuật', icon: '🔧' },
    { id: 'finance', name: 'Phòng tài chính', icon: '💰' },
    { id: 'operations', name: 'Phòng vận hành', icon: '⚙️' },
];

export const services: string[] = [
    'Cloud Storage',
    'Compute Engine',
    'Database Service',
    'Network & Firewall',
    'Khác',
];

export const initialSupportRequests: SupportRequestItem[] = [
    { id: 1, department: 'Phòng kỹ thuật', service: 'Cloud Storage', title: 'Lỗi deploy app BNCloud', date: '2025-10-29', status: 'Đang xử lý' },
    { id: 2, department: 'Phòng tài chính', service: 'Báo cáo', title: 'Không truy cập được báo cáo chi phí', date: '2025-10-30', status: 'Hoàn tất' },
];