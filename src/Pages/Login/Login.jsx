import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { loginUser } from "../../features/authSlice";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { TailSpin } from "react-loader-spinner";
import loginImg from "../../assests/login.png";

const Login = () => {
    const dispatch = useDispatch();
    const { loading, error, token } = useSelector((state) => state.auth);
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    const [showPassword, setShowPassword] = useState(false);
    const [credentials, setCredentials] = useState({ email: "", password: "" });
    const [touched, setTouched] = useState({ email: false, password: false });

    const { email, password } = credentials;

    const emailRequired = touched.email && email.trim() === "";
    const passwordRequired = touched.password && password.trim() === "";

    const emailErrorFromServer =
        error?.toLowerCase().includes("user not found") ||
            error?.toLowerCase().includes("validation")
            ? error
            : "";

    const passwordErrorFromServer = error
        ?.toLowerCase()
        .includes("wrong password")
        ? error
        : "";

    const fallbackError =
        error &&
        !emailErrorFromServer &&
        !passwordErrorFromServer &&
        error !== "Validation error: Missing fields";

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser(credentials));
    };

    if (token) {
        return <Navigate to={from} replace />;
    }

    return (
        <div className="w-full h-screen flex flex-col md:flex-row items-start">
            {/* LEFT IMAGE SECTION */}
            <div className="hidden md:flex md:w-2/3 lg:w-1/2 h-full bg-[#40A8C4]">
                <img
                    className="w-full h-full object-cover"
                    src={loginImg}
                    alt="Login"
                />
            </div>

            {/* RIGHT FORM SECTION */}
            <div className="w-full md:w-2/3 lg:w-1/2 h-full bg-white flex flex-col p-6 md:p-14 justify-center">
                <div className="w-full max-w-md mx-auto">
                    <h1 className="text-[#235784] text-3xl font-bold mb-6 text-center md:text-left">
                        Log In
                    </h1>

                    <form onSubmit={handleSubmit} className="flex flex-col">
                        {/* EMAIL INPUT */}
                        <label htmlFor="email" className="text-[#235784] font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            autoComplete="username"
                            value={email}
                            onChange={handleChange}
                            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                            required
                            className={`w-full bg-[#EEF6F7] text-[#235784] border-b py-2 px-3 mb-1 focus:outline-none focus:border-[#235784] hover:shadow transition-all duration-300 ${emailRequired || emailErrorFromServer
                                ? "border-red-500"
                                : "border-gray-300"
                                }`}
                            placeholder="Enter your email"
                        />
                        {emailRequired && (
                            <div className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm mb-3">
                                Email is required
                            </div>
                        )}
                        {emailErrorFromServer && (
                            <div className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm mb-3">
                                {emailErrorFromServer}
                            </div>
                        )}

                        {/* PASSWORD INPUT */}
                        <label htmlFor="password" className="text-[#235784] font-medium">
                            Password
                        </label>
                        <div className="relative pt-3">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                autoComplete="current-password"
                                value={password}

                                onChange={handleChange}
                                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                                required
                                className={`w-full bg-[#EEF6F7] text-[#235784] border-b py-2 px-3 mb-1 focus:outline-none focus:border-[#235784] hover:shadow transition-all duration-300 ${passwordRequired || passwordErrorFromServer
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute bottom-4 right-2 flex items-center text-[#235784] hover:text-[#40A8C4] transition"
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>

                        {passwordRequired && (
                            <div className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm mb-3">
                                Password is required
                            </div>
                        )}
                        {passwordErrorFromServer && (
                            <div className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm mb-3">
                                {passwordErrorFromServer}
                            </div>
                        )}

                        {/* FALLBACK / GENERAL ERROR */}
                        {fallbackError && (
                            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md text-sm mt-4">
                                Wrong email or password. Please try again.
                            </div>
                        )}

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#235784] text-white py-2 mt-6 rounded-lg hover:bg-[#1d4d6b] transition duration-300 ease-in disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? (
                                <TailSpin height={20} width={20} color="#ffffff" ariaLabel="loading" />
                            ) : (
                                "Log In"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
