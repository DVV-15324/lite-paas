
import { axiosInstance } from "../../common/api"
import { UpdateProfileType } from "../model/user"

export const ApiUpdateUser = async <T>(data: { data: UpdateProfileType }): Promise<T> => {
    const response = await axiosInstance.post<T>(`/v2/user/update_user_id`, data.data)

    return response.data
}

