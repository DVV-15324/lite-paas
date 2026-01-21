// api/invoices.ts

import { axiosInstance } from "../../../shared/axios/api";
import { InvoiceItem } from "../model/invoice";

export const ApiInvoices = async (): Promise<InvoiceItem[]> => {
    const response = await axiosInstance.post("/v2/invoice/user");
    return response.data.data || [];
};
