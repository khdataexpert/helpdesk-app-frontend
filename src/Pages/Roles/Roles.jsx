import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchRoles,
    deleteRole,
    createRole,
    updateRole,
} from "../../features/rolesSlice";
import { fetchPermissions } from "../../features/permissionSlice";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-toastify";

const Roles = () => {
    const dispatch = useDispatch();
    const { roles, loading } = useSelector((state) => state.roles);
    const { user } = useSelector((state) => state.auth);
    const { list: permissions } = useSelector((state) => state.permissions);
    const userPermissions = user?.permissions || [];
    const canCreate = userPermissions.includes("add Roles");
    const canEdit = userPermissions.includes("edit Roles");
    const canDelete = userPermissions.includes("delete Roles");
    const canView = userPermissions.includes("view Roles");

    // Modal control
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [formData, setFormData] = useState({ name: "", permissions: [] });

    useEffect(() => {
        dispatch(fetchRoles());
        dispatch(fetchPermissions());
    }, [dispatch]);

    const rolesArray = Array.isArray(roles) ? roles : roles?.data || [];

    const handleCreate = () => {
        if (!canCreate) return;
        setModalType("create");
        setFormData({ name: "", permissions: [] });
        setShowModal(true);
    };

    const handleEdit = (role) => {
        if (!canEdit) return;
        setModalType("edit");
        setSelectedRole(role);
        setFormData({
            name: role.name,
            permissions: role.permissions.map((p) => p.id),
        });
        setShowModal(true);
    };

    const handleDelete = (role) => {
        if (!canDelete) return;
        setSelectedRole(role);
        setModalType("delete");
        setShowModal(true);
    };

    const handleConfirm = async () => {
        const payload = {
            name: formData.name.trim(),
            permissions: formData.permissions
                .map((id) => permissions.find((p) => p.id === id)?.name)
                .filter(Boolean),
        };

        try {
            if (modalType === "delete") {
                await dispatch(deleteRole(selectedRole.id)).unwrap();
                toast.success("Role deleted successfully!");
            } else if (modalType === "create") {
                await dispatch(createRole(payload)).unwrap();
                toast.success("Role created successfully!");
            } else if (modalType === "edit") {
                await dispatch(updateRole({ id: selectedRole.id, data: payload })).unwrap();
                toast.success("Role updated successfully!");
            }

            dispatch(fetchRoles());
        } catch (error) {
            toast.error(error.message || "An error occurred");
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

    const allSelected = permissions.length > 0 && formData.permissions.length === permissions.length;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <TailSpin
                    height={150}
                    width={150}
                    color="var(--primary-color)"
                    ariaLabel="loading"
                />
            </div>
        );
    }

    return (
        <div className="p-6 relative">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Roles Management</h1>
                {canCreate && (
                    <button
                        onClick={handleCreate}
                        className="bg-[var(--secondary-color)] text-white hover:bg-[#DE9900] hover:shadow-md
                      px-2 py-1 rounded-md flex items-center gap-2 transition-all duration-300 ease-in-out text-[16px] font-medium"
                    >
                        <FaPlus /> Create Role
                    </button>
                )}
            </div>

            {canView ? (
                <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full border-collapse bg-white shadow-md rounded-lg">
                        <thead className="bg-[var(--primary-color)] text-text-color">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Role Name</th>
                                <th className="p-3 text-left">Permissions</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rolesArray.length > 0 ? (
                                rolesArray.map((role, idx) => (
                                    <tr
                                        key={role.id}
                                        className="border-b hover:bg-gray-50 transition-all duration-300 ease-in-out"
                                    >
                                        <td className="p-3">{idx + 1}</td>
                                        <td className="p-3 font-semibold">{role.name}</td>
                                        <td className="p-3">
                                            <div className="flex flex-wrap gap-2">
                                                {role.permissions.map((perm) => (
                                                    <span
                                                        key={perm.id}
                                                        className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700"
                                                    >
                                                        {perm.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-4">
                                                {canEdit && (
                                                    <FaEdit
                                                        className="text-blue-600 cursor-pointer transition-all duration-300 hover:scale-110"
                                                        onClick={() => handleEdit(role)}
                                                    />
                                                )}
                                                {canDelete && (
                                                    <FaTrashAlt
                                                        className="text-red-600 cursor-pointer transition-all duration-300 hover:scale-110"
                                                        onClick={() => handleDelete(role)}
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-6 text-gray-500">
                                        No roles found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">You don’t have permission to view roles.</p>
            )}

            {/* ===== MODAL ===== */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {modalType === "delete"
                                ? "Confirm Deletion"
                                : modalType === "edit"
                                    ? "Edit Role"
                                    : "Create Role"}
                        </h3>
                        {modalType === "delete" && (
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete the role{" "}
                                <strong>{selectedRole?.name}</strong> and its permissions?
                            </p>
                        )}

                        {(modalType === "create" || modalType === "edit") && (
                            <form className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    placeholder="Role Name"
                                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />

                                <div className="max-h-[200px] overflow-y-auto border p-2 rounded-lg">
                                    {permissions && permissions.length > 0 ? (
                                        <>
                                            <label className="flex items-center gap-2 mb-2 cursor-pointer font-bold text-lg ">
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
                                                    className="flex items-center gap-2 mb-1 cursor-pointer"
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
                                        <p className="text-sm text-gray-500">
                                            No permissions loaded.
                                        </p>
                                    )}
                                </div>
                            </form>
                        )}
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-300 shadow-md"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`py-2 px-4 rounded-lg text-white transition duration-300 shadow-md ${modalType === "delete"
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

export default Roles;