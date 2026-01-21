
export interface RuntimeInfo {
    id: string;
    name: string;
    price: number;
    cpu: number;
    ram: number;
    storage: number;
    link_git: string;
    token_git: string;
    description: string;
    version: string;
    status: boolean;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    name: string;
    phone: { String: string; Valid: boolean };
    role: string;
    address: { String: string; Valid: boolean };
    email: string;
    deleted_at: string;
    created_at: string;
    updated_at: string;
}

export interface RuntimeData {
    id: string;
    user_id: string;
    service_id: string;
    link_git: string;
    info_runtime: RuntimeInfo;
    user: User;
    link_return: string;
    status: boolean;
    created_at: string;
    updated_at: string;
}

export interface GitHubRepoInfo {
    name: string;
    full_name: string;
    private: boolean;
    html_url: string;
    description: string;
    default_branch: string;
    permissions?: {
        admin: boolean;
        push: boolean;
        pull: boolean;
    };
}

