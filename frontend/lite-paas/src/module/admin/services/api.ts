import { axiosInstance } from "../../../shared/axios/api";
import { InvoiceItem } from "../../invoices/model/invoice";


export const ApiInvoices = async (): Promise<InvoiceItem[]> => {
    const response = await axiosInstance.post("/admin/invoice/all");
    return response.data.data || [];
};
