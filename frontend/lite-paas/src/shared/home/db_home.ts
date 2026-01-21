export interface Service {
    id: number;
    name: string;
    description: string;

}

export const services: Service[] = [
    {
        id: 1,
        name: "Runtime Environment",
        description: "Cung cấp môi trường chạy có sẵn cho ứng dụng.",
    },
    {
        id: 2,
        name: "Database",
        description: "Cung cấp database có sẵn cho ứng dụng.",
    },
];
