import * as yup from "yup";

export const LoginSchema = yup.object({
    email: yup.string().email("email invalid").required("email is required"),
    password: yup.string().required("password is required")
})

export const RegisterSchema = yup.object({
    name: yup.string().required("name is required"),
    email: yup.string().email("email invalid").required("email is required"),
    password: yup.string().required("password is required"),
}) 