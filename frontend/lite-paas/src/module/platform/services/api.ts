import { AxiosResponse } from "axios"
import { axiosInstance } from "../../../shared/axios/api"
import { CreateInvoiceItem } from "../model/platform"


export const ApiCreateInvoice = async <T>(data: CreateInvoiceItem): Promise<T> => {
    const response: AxiosResponse<{ data: T }> = await axiosInstance.post("/v2/invoice/", data)
    return response.data.data
}


export const ApiFetchServices = async <T>(url: string): Promise<T[]> => {
    const res: AxiosResponse<{ data: T[] }> = await axiosInstance.post<{ data: T[] }>(url);
    return res.data.data ?? [];
};
