import { Navigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = Navigate({ to: "/dashboard", replace: true });

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-white text-center">
            <h1 className="text-9xl font-extrabold text-gray-300">404</h1>
            <p className="text-3xl font-semibold text-gray-800 mt-4">Page Not Found</p>
            <p className="text-gray-500 mt-2 mb-6">
                Sorry, the page you are looking for does not exist.
            </p>
            <button
                onClick={() => navigate}
                className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-150 shadow-md"
            >
                Take me Home (Dashboard)
            </button>
        </div>
    );
};

export default NotFound;


