export type UpdateProfileType = {
    address?: string;
    avatar?: string;
    phone?: string;
}



export type ChangePasswordType = {
    email: string;
    password: string;
    new_password: string;
};
