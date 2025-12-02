export interface Service {
    id: number;
    name: string;
    description: string;
    icon: string;
}

export const services: Service[] = [
    {
        id: 1,
        name: "Cloud Hosting",
        description: "Dịch vụ lưu trữ đám mây với hiệu suất cao và độ ổn định tuyệt đối.",
        icon: "☁️"
    },
    {
        id: 2,
        name: "Cloud Storage",
        description: "Lưu trữ dữ liệu an toàn, truy cập mọi lúc mọi nơi với băng thông không giới hạn.",
        icon: "💾"
    },
    {
        id: 3,
        name: "Cloud Database",
        description: "Cơ sở dữ liệu đám mây với khả năng mở rộng linh hoạt và bảo mật cao.",
        icon: "🗄️"
    }
];