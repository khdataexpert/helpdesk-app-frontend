import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, createUser } from "../../features/usersSlice";
import { fetchRoles } from "../../features/rolesSlice";
import { fetchPermissions } from "../../features/permissionSlice";
import { fetchCompanies } from "../../features/companiesSlice";
import { FaEye, FaPlus } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Users = () => {
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector((state) => state.users);
    const { user } = useSelector((state) => state.auth);
    const { roles } = useSelector((state) => state.roles);
    const { companies }= useSelector((state) => state.companies)
    const userPermissions = user?.permissions || [];
    const canCreate = userPermissions.includes("add users");
    const canView = userPermissions.includes("view users");
    

    // Modal control for create
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        company_id: user?.company?.id || "",
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "",
    });
    useEffect(() => {
        // console.log("Users:", users);
        // console.log("Companies:", companies);
    }, [users, companies]);

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchRoles());
        dispatch(fetchPermissions());
        dispatch(fetchCompanies());
    }, [dispatch]);

    const handleCreate = () => {
        if (!canCreate) return;
        setFormData({
            company_id: user?.company?.id || "",
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
            role: "",
        });
        setShowModal(true);
    };

    const handleConfirm = async () => {
        const payload = {
            company_id: formData.company_id,
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            password_confirmation: formData.password_confirmation,
            role: formData.role,
        };
        try {
            await dispatch(createUser(payload)).unwrap();
            toast.success("User created successfully!");
            dispatch(fetchUsers());
        } catch (error) {
            toast.error(error.message || "An error occurred");
        } finally {
            setShowModal(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <TailSpin
                    height={150}
                    width={150}
                    color="var(--primary-color)"
                    ariaLabel="loading"
                />
            </div>
        );
    }

    if (error) {
        return (
            <p className="p-8 text-red-500 text-sm sm:text-base">
                {typeof error === "string" ? error : error.message || "An error occurred"}
            </p>
        );
    }

    return (
        <div className="p-4 sm:p-6 md:p-8 relative">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <h1 className="text-xl sm:text-2xl font-bold">Users Management</h1>
                {canCreate && (
                    <button
                        onClick={handleCreate}
                        className="bg-[var(--secondary-color)] text-white hover:bg-[#DE9900] hover:shadow-md px-3 py-2 rounded-md flex items-center gap-2 transition-all duration-300 ease-in-out text-base sm:text-[16px] font-medium"
                    >
                        <FaPlus /> Create User
                    </button>
                )}
            </div>

            {canView ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full w-full border-collapse bg-white shadow-md rounded-lg">
                        <thead className="bg-[var(--primary-color)] text-text-color">
                            <tr>
                                <th className="p-3 text-left text-sm sm:text-base">#</th>
                                <th className="p-3 text-left text-sm sm:text-base">Name</th>
                                <th className="p-3 text-left text-sm sm:text-base">Email</th>
                                <th className="p-3 text-left text-sm sm:text-base">Role</th>
                                <th className="p-3 text-left text-sm sm:text-base">Company</th>
                                <th className="p-3 text-center text-sm sm:text-base">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((userItem, idx) => (
                                    <tr
                                        key={userItem.id}
                                        className="border-b hover:bg-gray-50 transition-all duration-300 ease-in-out"
                                    >
                                        <td className="p-3 text-sm sm:text-base">{idx + 1}</td>
                                        <td className="p-3 font-semibold text-sm sm:text-base">{userItem.name}</td>
                                        <td className="p-3 text-sm sm:text-base">{userItem.email}</td>
                                        <td className="p-3 text-sm sm:text-base">{userItem.roles?.join(", ") || "N/A"}</td>
                                        <td className="p-3 text-sm sm:text-base">{userItem.company?.name || "N/A"}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center items-center gap-4">
                                                <Link to={`/users/${userItem.id}`} className="flex items-center gap-2 cursor-pointer transition-all duration-300 hover:scale-110 hover:text-red-700">
                                                    <FaEye className="text-text-color" />
                                                    <span className="text-sm sm:text-base font-semibold text-text-color sm:inline">
                                                        View
                                                    </span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-6 text-gray-500 text-sm sm:text-base">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8 text-sm sm:text-base">
                    You don’t have permission to view users.
                </p>
            )}

            {/* ===== CREATE MODAL ===== */}
            {showModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Create User</h3>
                        <form className="flex flex-col gap-4">
                            <select
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none text-sm sm:text-base"
                                value={formData.company_id}
                                onChange={(e) => setFormData({ ...formData, company_id: parseInt(e.target.value) })}
                            >
                                <option value="">Select Company</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="text"
                                placeholder="Name"
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none text-sm sm:text-base"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none text-sm sm:text-base"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none text-sm sm:text-base"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none text-sm sm:text-base"
                                value={formData.password_confirmation}
                                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                            />
                            <select
                                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none text-sm sm:text-base"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="">Select Role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.name}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </form>
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300 shadow-md text-sm sm:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="py-2 px-4 rounded-lg text-white transition duration-300 shadow-md bg-[var(--secondary-color)] hover:bg-[#DE9900] text-sm sm:text-base"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;