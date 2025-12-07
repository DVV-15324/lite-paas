export type LoginType = {
    email: string;
    password: string;
}
export type ResponseLoginType = {

    access_token: {
        token: string;
        expire_at: string;
    }

}
export type RegisterType = {
    email: string;
    password: string;
    name: string;
}

export type ProfileType = {
    id: string;
    email: string;
    name: string;
    type_auth: string;
    phone: {
        String: string;
        Valid: boolean;
    };
    address: {
        String: string;
        Valid: boolean;
    };
    avatar: {
        String: string;
        Valid: boolean;
    };
}


export type ForgotPasswordType = {
    email: string;
};


export type ChangePasswordType = {
    new_password: string;
};
