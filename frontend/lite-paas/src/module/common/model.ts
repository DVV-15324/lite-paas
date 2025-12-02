export type Response<T> = {
    data: T;
    total?: number;  // total có thể có hoặc không, kiểu number
};
