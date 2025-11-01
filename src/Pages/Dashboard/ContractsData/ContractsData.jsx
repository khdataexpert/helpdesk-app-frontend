import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { showContract, clearContractDetails } from "../../../features/contractsSlice";
import { FaArrowLeft, FaFileSignature, FaUserTie, FaProjectDiagram, FaBuilding, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-toastify";

const statusColors = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    expired: "bg-red-100 text-red-800",
    cancelled: "bg-gray-200 text-gray-800",
};

const ContractsData = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { contractDetails: c, loading, error } = useSelector(s => s.contracts);

    useEffect(() => {
        dispatch(showContract(id));
        return () => dispatch(clearContractDetails());
    }, [dispatch, id]);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <TailSpin height={150} width={150} color="var(--primary-color)" />
            </div>
        );
    }

    if (!c) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500 text-lg">Contract not found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 inline-flex items-center gap-2 text-[var(--secondary-color)] hover:underline transform transition-all duration-200 hover:scale-105">
                    <FaArrowLeft /> Back
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm font-medium transform transition-all duration-200 hover:scale-105">
                <FaArrowLeft /> Back to Contracts
            </button>

            <div className="bg-gradient-to-r from-orange-300 to-[#F7AA00] text-white p-6 rounded-2xl shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 animate-slideDown">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <FaFileSignature className="text-3xl opacity-90" />
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">{c.contract_number}</h1>
                            <p className="text-sm opacity-90">ID: #{c.id}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                        <div className="flex items-center gap-2"><FaUserTie /> <strong>Client:</strong> {c.client?.name}</div>
                        {c.project && <div className="flex items-center gap-2"><FaProjectDiagram /> <strong>Project:</strong> {c.project.name}</div>}
                        {c.company && <div className="flex items-center gap-2"><FaBuilding /> <strong>Company:</strong> {c.company.name}</div>}
                    </div>
                </div>
                <div className="bg-white/20 px-6 py-3 rounded-xl shadow-inner text-center">
                    <p className="text-2xl sm:text-3xl font-bold capitalize">{c.status}</p>
                    <p className="uppercase text-xs tracking-wider">Status</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-2"><FaCalendarAlt /> Date Range</h2>
                    <p><strong>Start:</strong> {new Date(c.start_date).toLocaleDateString()}</p>
                    <p><strong>End:</strong> {new Date(c.end_date).toLocaleDateString()}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-2"><FaUserTie /> Client</h2>
                    <p className="text-gray-700">{c.client?.email}</p>
                </div>
                {c.company && (
                    <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1">
                        <h2 className="text-lg font-semibold flex items-center gap-2 mb-2"><FaBuilding /> Company</h2>
                        <p className="text-gray-700">{c.company.email}</p>
                        <p className="text-sm">{c.company.phone}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1">
                    <h2 className="text-lg font-semibold mb-3">Notes</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{c.notes || "—"}</p>
                </div>
                {c.attachment && (
                    <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1">
                        <h2 className="text-lg font-semibold flex items-center gap-2 mb-3"><FaFileAlt /> Attachment</h2>
                        <a href={c.attachment} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[var(--secondary-color)] hover:underline transform transition-all duration-200 hover:scale-105">
                            <FaFileAlt className="text-xl" /> View File
                        </a>
                    </div>
                )}
            </div>

            <div className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1">
                <h2 className="text-lg font-semibold mb-3">Created By</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">{c.creator?.name?.charAt(0) || "?"}</span>
                        </div>
                        <div>
                            <p className="font-medium">{c.creator?.name || "—"}</p>
                            <p className="text-sm">{c.creator?.email || "—"}</p>
                        </div>
                    </div>
                    <span className="text-sm text-gray-500">{new Date(c.created_at).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default ContractsData;