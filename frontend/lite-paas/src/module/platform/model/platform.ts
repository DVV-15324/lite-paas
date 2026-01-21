export interface CreateInvoiceItem {
    service_id: string;
    service_type: string;
    amount: number;
    payment_method: string;
    due_date: string;
}

export interface ServiceSpecs {
    cpu: number;
    ram: number;
    storage: number;
    version?: string;
}

export interface ServiceItem {
    id: string;
    name: string;
    price: number;
    description?: string;
    status: boolean;
    cpu?: number;
    ram?: number;
    storage?: number;
    version?: string;
    service_type?: string;
    created_at?: string;
    updated_at?: string;
    originalPrice: number;
    formattedPrice?: string; // thêm trường này
    specs?: {
        cpu: string;
        ram: string;
        storage: string;
        version?: string;
    }
}


export interface ServiceCategory {
    id: string;
    name: string;
    description: string;
    services: ServiceItem[];
}