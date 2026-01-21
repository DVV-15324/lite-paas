
export interface ServiceData {
    Id: string;
    user_Id: string;
    service_Id: string;
    link_return: string;
    name_login: string;
    password_login: string;
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

