import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
} from "../../features/companiesSlice";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-toastify";

const Companies = () => {
    const dispatch = useDispatch();
    const { companies, loading, error } = useSelector((state) => state.companies);
    const { user } = useSelector((state) => state.auth);
    const userPermissions = user?.permissions || [];
    const canCreate = userPermissions.includes("add companies");
    const canEdit = userPermissions.includes("edit companies");
    const canDelete = userPermissions.includes("delete companies");
    const canView = userPermissions.includes("view companies") || userPermissions.includes("view own companies");

    const showActions = canEdit || canDelete; // New: Check if actions column should be shown

    // Modal control
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        email: "",
        image: null,
    });

    useEffect(() => {
        if (canView) {
            dispatch(fetchCompanies());
        }
    }, [dispatch, canView]);

    const companiesArray = Array.isArray(companies) ? companies : companies?.data || [];

    const handleCreate = () => {
        if (!canCreate) return;
        setModalType("create");
        setFormData({ name: "", address: "", phone: "", email: "", image: null });
        setShowModal(true);
    };

    const handleEdit = (company) => {
        if (!canEdit) return;
        setModalType("edit");
        setSelectedCompany(company);
        setFormData({
            name: company.name,
            address: company.address,
            phone: company.phone,
            email: company.email,
            image: null,
        });
        setShowModal(true);
    };

    const handleDelete = (company) => {
        if (!canDelete) return;
        setSelectedCompany(company);
        setModalType("delete");
        setShowModal(true);
    };

    const handleConfirm = async () => {
        try {
            const payload = {
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                email: formData.email,
                image: formData.image,
            };

            if (modalType === "delete") {
                await dispatch(deleteCompany(selectedCompany.id)).unwrap();
                toast.success("Company deleted successfully!");
            } else if (modalType === "create") {
                await dispatch(createCompany(payload)).unwrap();
                toast.success("Company created successfully!");
            } else if (modalType === "edit") {
                await dispatch(updateCompany({ id: selectedCompany.id, data: payload })).unwrap();
                toast.success("Company updated successfully!");
            }

            dispatch(fetchCompanies());
            console.log("Form Data:", formData);
        } catch (error) {
            const errorMessage = error.errors
                ? Object.values(error.errors).flat().join(", ")
                : error || "An error occurred";
            toast.error(errorMessage);
        } finally {
            setShowModal(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

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
                <h1 className="text-2xl font-bold">Companies Management</h1>
                {canCreate && (
                    <button
                        onClick={handleCreate}
                        className="bg-[var(--secondary-color)] text-white hover:bg-[#DE9900] hover:shadow-md
              px-2 py-1 rounded-md flex items-center gap-2 transition-all duration-300 ease-in-out text-[16px] font-medium"
                    >
                        <FaPlus /> Create Company
                    </button>
                )}
            </div>

            {error && <p className="text-red-600 text-center mb-4">{error}</p>}

            {canView ? (
                <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full border-collapse bg-white shadow-md rounded-lg">
                        <thead className="bg-[var(--primary-color)] text-text-color">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Address</th>
                                <th className="p-3 text-left">Phone</th>
                                <th className="p-3 text-left">Email</th>
                                <th className="p-3 text-left">Image</th>
                                {showActions && <th className="p-3 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {companiesArray.length > 0 ? (
                                companiesArray.map((company, idx) => (
                                    <tr
                                        key={company.id}
                                        className="border-b hover:bg-gray-50 transition-all duration-300 ease-in-out"
                                    >
                                        <td className="p-3">{idx + 1}</td>
                                        <td className="p-3 font-semibold">{company.name}</td>
                                        <td className="p-3">{company.address}</td>
                                        <td className="p-3">{company.phone}</td>
                                        <td className="p-3">{company.email}</td>
                                        <td className="p-3">
                                            {company.image ? (
                                                <img
                                                    src={company.image}
                                                    alt={company.name}
                                                    className="h-12 w-12 object-cover rounded"
                                                />
                                            ) : (
                                                <span className="text-gray-500">No image</span>
                                            )}
                                        </td>
                                        {showActions && (
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center gap-4">
                                                    {canEdit && (
                                                        <FaEdit
                                                            className="text-blue-600 cursor-pointer transition-all duration-300 hover:scale-110"
                                                            onClick={() => handleEdit(company)}
                                                        />
                                                    )}
                                                    {canDelete && (
                                                        <FaTrashAlt
                                                            className="text-red-600 cursor-pointer transition-all duration-300 hover:scale-110"
                                                            onClick={() => handleDelete(company)}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={showActions ? 7 : 6} className="text-center py-6 text-gray-500">
                                        No companies found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">
                    You don’t have permission to view companies.
                </p>
            )}

            {/* ===== MODAL ===== */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {modalType === "delete"
                                ? "Confirm Deletion"
                                : modalType === "edit"
                                    ? "Edit Company"
                                    : "Create Company"}
                        </h3>
                        {modalType === "delete" && (
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete the company{" "}
                                <strong>{selectedCompany?.name}</strong>?
                            </p>
                        )}

                        {(modalType === "create" || modalType === "edit") && (
                            <form className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Company Name"
                                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="text"
                                    name="address"
                                    placeholder="Address"
                                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone"
                                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-[var(--secondary-color)] outline-none"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/png,image/jpeg,image/jpg"
                                    className="border rounded-lg px-3 py-2"
                                    onChange={handleInputChange}
                                />
                                {formData.image && (
                                    <img
                                        src={URL.createObjectURL(formData.image)}
                                        alt="Preview"
                                        className="h-24 w-24 object-cover rounded mt-2"
                                    />
                                )}
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

export default Companies;