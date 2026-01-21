
export interface User {
    id: string;
    name: string;
    role: string;
    email: string;
    deleted_at: string;
    created_at: string;
    updated_at: string;
}

export interface ServiceInfo {
    id: string;
    name: string;
    price: number;
    cpu: number;
    ram: number;
    storage: number;
    description: string;
    version: string;
    status: boolean;
    service_type?: string;
    created_at: string;
    updated_at: string;
}

export interface InvoiceItem {
    id: string;
    user_id: string;
    user: User;
    service_id: string;
    service_type: string;
    amount: number;
    status: boolean;
    due_date: string;
    created_at: string;
    updated_at: string;
    info_runtime?: ServiceInfo;
    info_database?: ServiceInfo;

}