import axios from "axios";
import { toast } from "react-toastify";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { "Content-Type": "application/json",
        Accept:"application/json",
     },
});

// Request Interceptor (Attaches Token)
axiosInstance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

//Response Interceptor (Handles Global Errors like 401/403)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response){
           const status = error.response.status;
           if (status === 401){   
            sessionStorage.clear();
            toast.error("Session expired. Please log in again.");     
            window.location.href = "/login";
           }else if (status >= 400 && status < 500){
            toast.error(error.response.data?.message || "Something went wrong.");
           }else if (status >= 500){
            toast.error("Server error. Please try again later.");
           }
        }
        return Promise.reject(error);
    }
);


export default axiosInstance;
