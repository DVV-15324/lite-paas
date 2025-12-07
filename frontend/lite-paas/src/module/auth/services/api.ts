import { AxiosResponse } from "axios"
import { LoginType, RegisterType, ChangePasswordType, ForgotPasswordType } from "../model/auth"
import { axiosInstance } from "../../common/api"


export const ApiLogin = async <T>(data: LoginType): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.post("/v1/auth/login", data)
    return response.data
}

export const ApiRegister = async <T>(data: RegisterType): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.post("/v1/auth/register", data)
    return response.data
}

export const ApiProfile = async <T>(): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.post(`/v2/user/get_user_id`)

    return response.data
}

export const ApiProfileP = async <T>(id: string): Promise<T> => {
    const response: AxiosResponse<T> = await axiosInstance.post(`/v1/user/get_user_id_p/${id}`)
    return response.data
}

export const ApiLoginGoogle = async <T>(token: string): Promise<T> => {

    const response: AxiosResponse<T> = await axiosInstance.post(`/v1/auth/google`, {
        access_token: token,
    });

    return response.data;
}

export const ApiForgetPassword = async<T>(data: ForgotPasswordType): Promise<T> => {
    const response = await axiosInstance.post<T>(`/v1/auth/forgot_password`, data)

    return response.data
}


export const ApiChangePassword = async <T>(data: ChangePasswordType): Promise<T> => {
    const response = await axiosInstance.post<T>(`/v2/auth/change_password`, data)

    return response.data
}

