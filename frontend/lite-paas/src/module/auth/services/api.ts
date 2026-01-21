import { AxiosResponse } from "axios"
import { LoginType, RegisterType } from "../model/auth"
import { axiosInstance } from "../../../shared/axios/api"

export const ApiLogin = async <T>(data: LoginType): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.post("/v1/auth/login", data)
    return response.data
}

export const ApiRegister = async <T>(data: RegisterType): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.post("/v1/auth/register", data)
    return response.data
}

export const ApiProfile = async <T>(): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.post(`/v2/user/get_user`)

    return response.data
}
