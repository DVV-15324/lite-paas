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

export interface ServiceCategory {
    id: number;
    name: string;
    description: string;
    icon: string;
    services: ServiceItem[];
}

export interface MyService {
    id: number;
    name: string;
    category: string;
    status: "running" | "stopped" | "error";
    createdAt: string;
    specs?: {
        cpu: string;
        ram: string;
        storage: string;
        os: string;
    };
}

export const serviceCategories: ServiceCategory[] = [
    {
        id: 1,
        name: "Môi trường chạy",
        description: "Các dịch vụ môi trường runtime và development",
        icon: "⚙️",
        services: [
            { id: 101, name: "Golang", description: "Môi trường chạy Golang với các phiên bản khác nhau", status: 'active', price: "Miễn phí", specs: { cpu: "2 vCPU", ram: "4GB", storage: "50GB SSD", os: "Ubuntu 20.04" } },
            { id: 102, name: "React JS", description: "Môi trường phát triển React với hot reload", status: 'active', price: "Miễn phí", specs: { cpu: "2 vCPU", ram: "4GB", storage: "50GB SSD", os: "Ubuntu 20.04" } },
            { id: 103, name: "Java", description: "JDK và JRE với các phiên bản từ 8 đến 21", status: 'active', price: "Miễn phí", specs: { cpu: "2 vCPU", ram: "4GB", storage: "50GB SSD", os: "Ubuntu 20.04" } },
            { id: 104, name: "Python", description: "Python environment với pip và virtualenv", status: 'active', price: "Miễn phí", specs: { cpu: "2 vCPU", ram: "4GB", storage: "50GB SSD", os: "Ubuntu 20.04" } },
            { id: 105, name: "Node.js", description: "Node.js runtime với npm và yarn", status: 'active', price: "Miễn phí", specs: { cpu: "2 vCPU", ram: "4GB", storage: "50GB SSD", os: "Ubuntu 20.04" } },
        ],
    },
    {
        id: 2,
        name: "Cơ sở dữ liệu",
        description: "Các dịch vụ database và lưu trữ dữ liệu",
        icon: "🗄️",
        services: [
            { id: 201, name: "MySQL", description: "Database MySQL với replication và backup tự động", status: 'active', price: "Miễn phí", specs: { cpu: "2 vCPU", ram: "4GB", storage: "50GB SSD", os: "Ubuntu 20.04" } },
            { id: 202, name: "PostgreSQL", description: "PostgreSQL với extensions và full-text search", status: 'active', price: "Miễn phí", specs: { cpu: "2 vCPU", ram: "4GB", storage: "50GB SSD", os: "Ubuntu 20.04" } },
            { id: 203, name: "MongoDB", description: "NoSQL database với sharding và replication", status: 'active', price: "Miễn phí", specs: { cpu: "2 vCPU", ram: "4GB", storage: "50GB SSD", os: "Ubuntu 20.04" } },
            { id: 204, name: "Redis", description: "In-memory data structure store", status: 'active', price: "Miễn phí", specs: { cpu: "2 vCPU", ram: "4GB", storage: "50GB SSD", os: "Ubuntu 20.04" } },
            { id: 205, name: "SQL Server", description: "Microsoft SQL Server database", status: 'active', price: "Miễn phí", specs: { cpu: "2 vCPU", ram: "4GB", storage: "50GB SSD", os: "Ubuntu 20.04" } },
        ],
    },
    {
        id: 3,
        name: "Dịch vụ lưu trữ & file",
        description: "Cloud storage và file management services",
        icon: "💾",
        services: [
            { id: 301, name: "Minio", description: "Lưu trữ file với CDN và backup tự động", status: 'active', price: "Miễn phí", specs: { cpu: "2 vCPU", ram: "4GB", storage: "50GB SSD", os: "Ubuntu 20.04" } },
        ],
    },
];

// Dữ liệu dịch vụ của người dùng
export const myServicesData: MyService[] = [
    {
        id: 1,
        name: "MySQL Database",
        category: "Cơ sở dữ liệu",
        status: "running",
        createdAt: "2025-10-31",
        specs: { cpu: "2 vCPU", ram: "4GB", storage: "50GB SSD", os: "Ubuntu 20.04" },
    },
    {
        id: 2,
        name: "React Runtime",
        category: "Môi trường chạy",
        status: "running",
        createdAt: "2025-10-29",
        specs: { cpu: "2 vCPU", ram: "4GB", storage: "50GB SSD", os: "Ubuntu 20.04" },
    },
    {
        id: 3,
        name: "Redis Cache",
        category: "Cơ sở dữ liệu",
        status: "stopped",
        createdAt: "2025-10-28",
        specs: { cpu: "1 vCPU", ram: "2GB", storage: "20GB SSD", os: "Ubuntu 20.04" },
    },
];