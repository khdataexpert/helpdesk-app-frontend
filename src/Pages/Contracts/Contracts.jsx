import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    fetchProjects,
} from "../../features/contractsSlice";
import { FaEdit, FaTrashAlt, FaPlus, FaEye, FaFileAlt } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";

const statusColors = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    expired: "bg-red-100 text-red-800",
    cancelled: "bg-gray-200 text-text-color",
};

const Contracts = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { contracts, projects, loading } = useSelector(s => s.contracts);
    const { user } = useSelector(s => s.auth);

    const perms = user?.permissions || [];
    const canAdd = perms.includes("add contracts");
    const canEdit = perms.includes("edit contracts");
    const canDelete = perms.includes("delete contracts");
    const canViewAll = perms.includes("view contracts");
    const canViewOwn = perms.includes("view own contracts");
    const showActions = canEdit || canDelete;

    const clientMap = new Map();
    const companyMap = new Map();
    projects.forEach(p => {
        if (p.client?.id && p.client?.name) clientMap.set(p.client.id, { id: p.client.id, name: p.client.name });
        if (p.company?.id && p.company?.name) companyMap.set(p.company.id, { id: p.company.id, name: p.company.name });
    });

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [selected, setSelected] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [form, setForm] = useState({
        contract_number: "",
        notes: "",
        start_date: "",
        end_date: "",
        status: "active",
        client_id: "",
        project_id: "",
        company_id: "",
        attachment: null,
    });
    const [preview, setPreview] = useState(null);
   
    useEffect(() => {
        if (selectedProject) {
            setForm(p => ({
                ...p,
                company_id: selectedProject.company?.id || "",
                client_id: selectedProject.client?.id || ""
            }));
        } else {
            setForm(p => ({
                ...p,
                company_id: "",
                client_id: ""
            }));
        }
    }, [selectedProject]);

    useEffect(() => {
        if (!user) return;
        if (canViewAll || canViewOwn) {
            dispatch(fetchContracts());
            dispatch(fetchProjects());
        }
    }, [dispatch, user, canViewAll, canViewOwn]);

    const contractsArr = Array.isArray(contracts) ? contracts : [];
    const filtered = canViewAll
        ? contractsArr
        : contractsArr.filter(c => c.client?.id === user.id);

    const openCreate = () => {
        if (!canAdd) return;
        setModalType("create");
        setForm({
            contract_number: "",
            notes: "",
            start_date: "",
            end_date: "",
            status: "active",
            client_id: "",
            project_id: "",
            company_id: "",
            attachment: null,
        });
        setPreview(null);
        setSelected(null);
        setShowModal(true);
        setSelectedProject(null);
    };

    const openEdit = c => {
        if (!canEdit) return;
        setModalType("edit");
        setSelected(c);
        setForm({
            contract_number: c.contract_number || "",
            notes: c.notes || "",
            start_date: c.start_date || "",
            end_date: c.end_date || "",
            status: c.status || "active",
            client_id: c.client?.id || "",
            project_id: c.project?.id || "",
            company_id: c.company?.id || "",
            attachment: null,
        });
        setPreview(c.attachment);
        setShowModal(true);
    };

    const openDelete = c => {
        if (!canDelete) return;
        setSelected(c);
        setModalType("delete");
        setShowModal(true);
    };

    const handleInput = e => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
    };

    const handleFile = e => {
        const file = e.target.files[0];
        if (file) {
            setForm(p => ({ ...p, attachment: file }));
            setPreview(URL.createObjectURL(file));
        }
    };

    const submit = async () => {
        try {
            if (modalType === "delete") {
                await dispatch(deleteContract(selected.id)).unwrap();
                toast.success("Contract deleted");
                dispatch(fetchContracts());
                setShowModal(false);
                return;
            }
            if (!form.contract_number?.trim()) return toast.error("Contract number required");
            if (!form.client_id) return toast.error("Client required");
            if (!form.start_date || !form.end_date) return toast.error("Dates required");

            const fd = new FormData();
            fd.append("contract_number", form.contract_number.trim());
            fd.append("notes", form.notes?.trim() || "");
            fd.append("start_date", form.start_date);
            fd.append("end_date", form.end_date);
            fd.append("status", form.status);
            fd.append("client_id", form.client_id);
            if (form.project_id) fd.append("project_id", form.project_id);
            if (form.company_id) fd.append("company_id", form.company_id);
            if (form.attachment) fd.append("attachment", form.attachment);

            if (modalType === "create") {
                await dispatch(createContract(fd)).unwrap();
                toast.success("Contract created");
            } else {
                await dispatch(updateContract({ id: selected.id, formData: fd })).unwrap();
                toast.success("Contract updated");
            }

            dispatch(fetchContracts());
            setShowModal(false);
        } catch (e) {
            toast.error(e?.message || "Failed");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <TailSpin height={150} width={150} color="var(--primary-color)" />
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-color">Contracts Management</h1>
                {canAdd && (
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[var(--secondary-color)] text-white rounded-lg
                       shadow-md hover:bg-[#DE9900] hover:shadow-lg transform transition-all duration-200
                       hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-300"
                        data-tooltip-id="tt"
                        data-tooltip-content="Create Contract"
                    >
                        <FaPlus className="text-sm" /> Create Contract
                    </button>
                )}
            </div>

            {!canViewAll && !canViewOwn ? (
                <p className="text-center text-gray-500 py-12 text-lg">No permission.</p>
            ) : filtered.length === 0 ? (
                <p className="text-center text-gray-500 py-12 text-lg">No contracts found.</p>
            ) : (

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-[var(--primary-color)] text-white">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">#</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Number</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hidden sm:table-cell">Client</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hidden md:table-cell">Project</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider hidden lg:table-cell">Company</th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                                {showActions && <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c, i) => (
                                <tr key={c.id} className="border-b hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-4 py-3 text-sm font-medium">{i + 1}</td>
                                    <td className="px-4 py-3 font-semibold text-text-color">{c.contract_number}</td>
                                    <td className="px-4 py-3 text-sm hidden sm:table-cell">{c.client?.name || "—"}</td>
                                    <td className="px-4 py-3 text-sm hidden md:table-cell">{c.project?.name || "—"}</td>
                                    <td className="px-4 py-3 text-sm hidden lg:table-cell">{c.company?.name || "—"}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[c.status] || "bg-gray-100 text-text-color"}`}>
                                            {c.status.toUpperCase()}
                                        </span>
                                    </td>
                                    {showActions && (
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center items-center gap-3 text-lg">
                                                {canEdit && (
                                                    <button
                                                        onClick={() => openEdit(c)}
                                                        className="text-blue-600 hover:text-blue-800 transform transition-all duration-200 hover:scale-125"
                                                        data-tooltip-id="tt"
                                                        data-tooltip-content="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/contracts/${c.id}`)}
                                                    className="text-purple-600 hover:text-purple-800 transform transition-all duration-200 hover:scale-125"
                                                    data-tooltip-id="tt"
                                                    data-tooltip-content="View"
                                                >
                                                    <FaEye />
                                                </button>
                                                {c.attachment && (
                                                    <a
                                                        href={c.attachment}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:text-green-800 transform transition-all duration-200 hover:scale-125"
                                                        data-tooltip-id="tt"
                                                        data-tooltip-content="Attachment"
                                                    >
                                                        <FaFileAlt />
                                                    </a>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        onClick={() => openDelete(c)}
                                                        className="text-red-600 hover:text-red-800 transform transition-all duration-200 hover:scale-125"
                                                        data-tooltip-id="tt"
                                                        data-tooltip-content="Delete"
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (modalType === "create" || modalType === "edit") && (
                <div className="modal-overlay">
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold mb-5 text-text-color">
                            {modalType === "create" ? "Create Contract" : "Edit Contract"}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* Contract Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contract Number *</label>
                                <input
                                    name="contract_number"
                                    value={form.contract_number}
                                    onChange={handleInput}
                                    placeholder="CNT-2025-001"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                                    required
                                />
                            </div>
                            
                            {/* Project */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Project *</label>
                                <select
                                    name="project_id"
                                    value={form.project_id}
                                    onChange={(e) => {
                                        const pid = e.target.value;
                                        setForm(p => ({ ...p, project_id: pid }));
                                        const proj = projects.find(p => p.id == pid);
                                        setSelectedProject(proj || null);
                                    }}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                                    required
                                >
                                    <option value="">Select Project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>

                                {/* Show Company & Client names as read-only text (no dropdowns) */}
                                {selectedProject && (
                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                            <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800">
                                                {selectedProject.company?.name || "—"}
                                            </div>
                                            {/* Hidden input to send company_id */}
                                            <input type="hidden" name="company_id" value={selectedProject.company?.id || ""} />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                                            <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800">
                                                {selectedProject.client?.name || "—"}
                                            </div>
                                            {/* Hidden input to send client_id */}
                                            <input type="hidden" name="client_id" value={selectedProject.client?.id || ""} />
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                        {/* Start Date */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                            <input
                                type="date"
                                name="start_date"
                                value={form.start_date}
                                onChange={handleInput}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                                required
                            />
                        </div>

                        {/* End Date */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                            <input
                                type="date"
                                name="end_date"
                                value={form.end_date}
                                onChange={handleInput}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                                required
                            />
                        </div>

                        {/* Status */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleInput}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200"
                            >
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="expired">Expired</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Notes */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                            <textarea
                                name="notes"
                                value={form.notes}
                                onChange={handleInput}
                                placeholder="Contract notes..."
                                rows="3"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200 resize-none"
                            />
                        </div>

                        {/* Attachment */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Attachment</label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFile}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-200
                             file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--secondary-color)] file:text-white hover:file:bg-[#DE9900]"
                            />
                            {preview && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">Preview:</p>
                                    {typeof preview === "string" ? (
                                        <a href={preview} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                            {preview.split("/").pop()}
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-700">{form.attachment?.name}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transform transition-all duration-200 hover:scale-105"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submit}
                            className="px-5 py-2.5 bg-[var(--secondary-color)] text-white rounded-lg hover:bg-[#DE9900] transform transition-all duration-200 hover:scale-105 shadow-md"
                        >
                            Save
                        </button>
                    </div>
                </div>
                    </div>
    )
}

{/* ---------- DELETE MODAL ---------- */ }
{
    showModal && modalType === "delete" && (
        <div className="modal-overlay">
            <div
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all duration-300 scale-100"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-xl font-bold mb-4 text-text-color">Delete Contract</h3>
                <p className="text-gray-700">
                    Delete <strong>{selected?.contract_number}</strong>?
                </p>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={() => setShowModal(false)}
                        className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transform transition-all duration-200 hover:scale-105"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transform transition-all duration-200 hover:scale-105 shadow-md"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

<Tooltip id="tt" place="top" effect="solid" className="text-xs" />
                </div >
            )
            };

export default Contracts;