import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    deleteUser,
    updateUser,
    updateUserPermissions,
    fetchUsers,
} from "../../../features/usersSlice";
import { fetchCompanies } from "../../../features/companiesSlice";
import { fetchRoles } from "../../../features/rolesSlice"; 
import { fetchPermissions } from "../../../features/permissionSlice"; 
import { FaEdit, FaTrashAlt, FaUserShield } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-toastify";

const UsersData = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { users, loading: usersLoading } = useSelector((state) => state.users);
    const { roles, loading: rolesLoading } = useSelector((state) => state.roles);
    const { list: permissions, loading: permissionsLoading } = useSelector((state) => state.permissions); 
    const { user } = useSelector((state) => state.auth);
    const { companies, loading: companiesLoading } = useSelector((state) => state.companies);

    const userPermissions = user?.permissions || [];
    const canEdit = userPermissions.includes("edit users");
    const canDelete = userPermissions.includes("delete users");
    const canUpdatePermissions =
        userPermissions.includes("update user permissions") || canEdit;

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [formData, setFormData] = useState({
        company_id: "",
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "",
        permissions: [],
    });

    const selectedUser = users.find((u) => u.id === parseInt(id));

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchCompanies());
        dispatch(fetchRoles());       
        dispatch(fetchPermissions()); 
    }, [dispatch]);

    useEffect(() => {
        if (selectedUser) {
            setFormData({
                company_id: selectedUser.company?.id || "",
                name: selectedUser.name || "",
                email: selectedUser.email || "",
                password: "",
                password_confirmation: "",
                role: selectedUser.roles?.[0] || "",
                permissions:
                    selectedUser.permissions
                        ?.map((p) => {
                            const perm = permissions.find((per) => per.name === p);
                            return perm ? perm.id : null;
                        })
                        .filter((id) => id !== null) || [],
            });
        }
    }, [selectedUser, permissions]);

    // Show loading until ALL data is ready
    if (usersLoading || companiesLoading || rolesLoading || permissionsLoading) {
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

    if (!selectedUser) {
        return (
            <p className="p-8 text-red-500 text-sm sm:text-base">User not found</p>
        );
    }

    const handleEdit = () => {
        if (!canEdit) return;
        setModalType("edit");
        setShowModal(true);
    };

    const handleDelete = () => {
        if (!canDelete) return;
        setModalType("delete");
        setShowModal(true);
    };

    const handlePermissions = () => {
        if (!canUpdatePermissions) return;
        setModalType("permissions");
        setShowModal(true);
    };

    const handleConfirm = async () => {
        try {
            if (modalType === "delete") {
                await dispatch(deleteUser(selectedUser.id)).unwrap();
                toast.success("User deleted successfully!");
                navigate("/users");
            } else if (modalType === "edit") {
                const payload = {
                    company_id: formData.company_id,
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    password_confirmation: formData.password_confirmation,
                    role: formData.role,
                };

                await dispatch(updateUser({ id: selectedUser.id, data: payload })).unwrap();
                toast.success("User updated successfully!");

                // Refetch users and companies to reflect changes
                dispatch(fetchUsers());
                dispatch(fetchCompanies());
            } else if (modalType === "permissions") {
                const payload = {
                    permissions: formData.permissions
                        .map((id) => permissions.find((p) => p.id === id)?.name)
                        .filter(Boolean),
                };

                await dispatch(updateUserPermissions({ id: selectedUser.id, data: payload })).unwrap();
                toast.success("User permissions updated successfully!");
                dispatch(fetchUsers());
            }
        } catch (err) {
            toast.error(err.message || "An error occurred");
        } finally {
            setShowModal(false);
        }
    };

    const togglePermission = (permId) => {
        setFormData((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(permId)
                ? prev.permissions.filter((p) => p !== permId)
                : [...prev.permissions, permId],
        }));
    };

    const handleSelectAll = (e) => {
        const isChecked = e.target.checked;
        setFormData((prev) => ({
            ...prev,
            permissions: isChecked ? permissions.map((perm) => perm.id) : [],
        }));
    };

    const allSelected =
        permissions.length > 0 && formData.permissions.length === permissions.length;

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex flex-row-reverse justify-between items-center">
                <div>
                    <Link
                        to="/users"
                        className="relative text-lg font-semibold text-[var(--secondary-color)] hover:text-[#DE9900] transition duration-300 ease-in-out"
                    >
                        Back to Users
                    </Link>
                    <span className="mx-2 text-gray-600">/</span>
                    <span className="text-lg font-semibold">{selectedUser.name}</span>
                </div>
                <div className="items-start">
                    <h1 className="text-xl sm:text-2xl font-bold mb-2">
                        {selectedUser.name}
                    </h1>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                        {selectedUser.email}
                    </p>
                </div>
            </div>

            <div>
                <p className="mb-2 text-sm sm:text-base">
                    <strong>Role:</strong> {selectedUser.roles?.join(", ") || "N/A"}
                </p>
                <p className="mb-2 text-sm sm:text-base">
                    <strong>Company:</strong> {selectedUser.company?.name || "N/A"}
                </p>
            </div>

            <div className="mb-4">
                <strong className="text-sm sm:text-base">Permissions:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUser.permissions?.map((perm, permIdx) => (
                        <span
                            key={permIdx}
                            className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 hover:bg-gray-200 hover:shadow-sm transition-all duration-300 ease-in-out cursor-pointer"
                        >
                            {perm}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-6">
                {canEdit && (
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out text-sm sm:text-base"
                    >
                        <FaEdit /> Edit User
                    </button>
                )}
                {canUpdatePermissions && (
                    <button
                        onClick={handlePermissions}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out text-sm sm:text-base"
                    >
                        <FaUserShield /> Update Permissions
                    </button>
                )}
                {canDelete && (
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out text-sm sm:text-base"
                    >
                        <FaTrashAlt /> Delete User
                    </button>
                )}
            </div>

            {/* ===== MODAL ===== */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div
                        className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {modalType === "delete"
                                ? "Confirm Deletion"
                                : modalType === "edit"
                                    ? "Edit User"
                                    : "Update User Permissions"}
                        </h3>

                        {modalType === "delete" && (
                            <p className="text-gray-700 mb-6 text-sm sm:text-base">
                                Are you sure you want to delete the user{" "}
                                <strong>{selectedUser.name}</strong>?
                            </p>
                        )}

                        {modalType === "edit" && (
                            <form className="flex flex-col gap-4">
                                <select
                                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none text-sm sm:text-base"
                                    value={formData.company_id}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            company_id: e.target.value ? parseInt(e.target.value) : "",
                                        })
                                    }
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
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none text-sm sm:text-base"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                />
                                <input
                                    type="password"
                                    placeholder="Password (leave blank to keep current)"
                                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none text-sm sm:text-base"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none text-sm sm:text-base"
                                    value={formData.password_confirmation}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            password_confirmation: e.target.value,
                                        })
                                    }
                                />
                                <select
                                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none text-sm sm:text-base"
                                    value={formData.role}
                                    onChange={(e) =>
                                        setFormData({ ...formData, role: e.target.value })
                                    }
                                >
                                    <option value="">Select Role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </form>
                        )}

                        {modalType === "permissions" && (
                            <div className="max-h-[200px] overflow-y-auto border p-2 rounded-lg">
                                {permissions && permissions.length > 0 ? (
                                    <>
                                        <label className="flex items-center gap-2 mb-2 cursor-pointer font-bold text-lg">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={handleSelectAll}
                                            />
                                            Select All
                                        </label>
                                        {permissions.map((perm) => (
                                            <label
                                                key={perm.id}
                                                className="flex items-center gap-2 mb-1 cursor-pointer text-sm sm:text-base"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.permissions.includes(perm.id)}
                                                    onChange={() => togglePermission(perm.id)}
                                                />
                                                {perm.name}
                                            </label>
                                        ))}
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500">No permissions loaded.</p>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300 shadow-md text-sm sm:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`py-2 px-4 rounded-lg text-white transition duration-300 shadow-md text-sm sm:text-base ${modalType === "delete"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-[var(--secondary-color)] hover:bg-[#DE9900]"
                                    }`}
                            >
                                {modalType === "delete" ? "Delete" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersData;