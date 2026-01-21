// Interfaces cho Storage
export interface SubStorage {
    Id: string;
    user_Id: string;
    service_Id: string;
    link: string;
    info_database: {
        id: string;
        name: string;
        price: number;
        cpu: number;
        ram: number;
        storage: number;
        service_type: string;
        description: string;
        version: string;
        status: boolean;
        created_at: string;
        updated_at: string;
    };
    user: {
        id: string;
        name: string;
        role: string;
        email: string;
        deleted_at: string;
        created_at: string;
        updated_at: string;
    };
    port: number;
    status: boolean;
    created_at: string;
    updated_at: string;
}

// Interfaces cho Runtime
export interface SubRuntime {
    id: string;
    user_id: string;
    service_id: string;
    link_git: string;
    info_runtime: {
        id: string;
        name: string;
        price: number;
        cpu: number;
        ram: number;
        storage: number;
        description: string;
        version: string;
        status: boolean;
        created_at: string;
        updated_at: string;
    };
    user: {
        id: string;
        name: string;
        role: string;
        email: string;
        deleted_at: string;
        created_at: string;
        updated_at: string;
    };
    link_return: string;
    status: boolean;
    created_at: string;
    updated_at: string;
}

// Interface thống nhất cho Service
export interface MyService {
    id: string;
    name: string;
    category: string;
    type: "storage" | "runtime";
    specs: {
        cpu: string;
        ram: string;
        storage: string;
        version: string;
        link?: string;
        link_return?: string;
        link_git?: string;
        port?: number;
    };
    status: "running" | "stopped" | "error";
}