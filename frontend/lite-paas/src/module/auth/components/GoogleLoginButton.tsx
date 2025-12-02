import { useContext } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../context/authContext";

const GoogleLoginButton = () => {
    const { handleCredentialResponse } = useContext(AuthContext);

    const login = useGoogleLogin({
        onSuccess: async (credentialResponse) => {

            await handleCredentialResponse(credentialResponse);

        },
        onError: () => {
            console.error("Google login failed");
        },

    });


    return (
        <button
            onClick={() => login()}
            className="bg-gray-100 border border-gray-400 px-4 py-2 rounded flex items-center gap-2 hover:shadow transition duration-200 w-full flex justify-center items-center"
        >
            <img
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google"
                className="w-5 h-5"
            />
            <span className="text-sm font-medium text-gray-800">
                Đăng nhập với Google
            </span>
        </button>
    );
};

export default function GoogleLogin() {
    return (
        <GoogleOAuthProvider clientId="101056890896-vn9ti2n5e312kdfd9b13bfjvjm77admo.apps.googleusercontent.com">
            <div className="flex justify-center mt-2 w-full">
                <GoogleLoginButton />
            </div>
        </GoogleOAuthProvider>
    );
}
