import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { Response } from "./model";
import { enqueueSnackbar } from "notistack";
import CircularProgress from "@mui/material/CircularProgress";

// Hàm xử lý lỗi
const ErrorHandle = (error: AxiosError | Error) => {
    if (axios.isAxiosError(error)) {
        return {
            message: error.response?.data.error || "Lỗi hệ thống",
            error: error.response?.data.message,
        };
    }
    return { message: error.message || "UnKnown Error" };
};


export const DefaultLoading = () => {
    return (
        <div className="flex justify-center items-center h-40">
            <CircularProgress />
        </div>
    );
};


export const HomeUI = () => {
    return (
        <div className="w-full bg-stone-50 py-8">

            <div className="max-w-screen-xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-2xl font-semibold mb-2">
                        Hello Chào Mừng Các Bạn Đến Với BlogHomNay.
                    </h1>
                    <p className="text-gray-700">
                        Nơi Các Bạn Có Thể Viết Các Bài Blog Cá Nhân Và Nơi Học Hỏi <br />
                        Và Cùng Nhau Chia Sẻ Kiến Thức Về Công Nghệ Thông Tin
                    </p>
                </div>

                <div className="mt-6">
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>

                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>


                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>

                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>

                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>
                    <div>Hello</div>


                    <div>Hello</div>
                    <div>Hello</div>

                </div>
            </div>
        </div>
    );

};
