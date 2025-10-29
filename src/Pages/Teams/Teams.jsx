import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    fetchTeamMembers,
    updateTeamMembers,
    fetchAgents,
} from "../../features/teamsSlice";
import { fetchCompanies } from "../../features/companiesSlice";
import { FaEdit, FaTrashAlt, FaUsers, FaPlus, FaEye } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { Link } from "react-router-dom";

const Teams = () => {
    const dispatch = useDispatch();
    const { teams, loading: teamsLoading, membersCache, agentsCache } = useSelector((s) => s.teams);
    const { companies, loading: compLoading } = useSelector((s) => s.companies);
    const { user } = useSelector((s) => s.auth);

    const perms = user?.permissions || [];
    const canAdd = perms.includes("add teams");
    const canEdit = perms.includes("edit teams");
    const canDelete = perms.includes("delete teams");
    const canView = perms.includes("view teams");
    const showActions = canEdit || canDelete;

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [formData, setFormData] = useState({
        company_id: "",
        name: "",
        Specialization: "",
        lead_id: "",
        members: [],
    });

    useEffect(() => {
        if (!user) return;

        const isAgent = user?.roles?.includes("Agent");
        const canViewTeams = perms.includes("view teams");

        if (isAgent) {
            if (canViewTeams) {
                dispatch(fetchTeams());
                dispatch(fetchCompanies());
            }
        } else if (canViewTeams) {
            dispatch(fetchTeams());
            dispatch(fetchCompanies());
        }
    }, [dispatch, user]);

    useEffect(() => {
        if ((modalType === "create" || modalType === "edit") && formData.company_id) {
            dispatch(fetchAgents(formData.company_id));
        }
    }, [dispatch, formData.company_id, modalType]);

    const teamsArray = Array.isArray(teams) ? teams : teams?.data || [];
    const companyAgents = agentsCache[formData.company_id] || [];

    const handleCreate = () => {
        if (!canAdd) return;
        setModalType("create");
        setFormData({ company_id: "", name: "", Specialization: "", lead_id: "", members: [] });
        setSelectedTeam(null);
        setShowModal(true);
    };

    const handleEdit = (team) => {
        if (!canEdit) return;
        setModalType("edit");
        setSelectedTeam(team);
        setFormData({
            company_id: team.company_id,
            name: team.name,
            Specialization: team.Specialization,
            lead_id: team.lead?.id || "",
            members: team.members?.map((m) => m.id) || [],
        });
        setShowModal(true);
    };

    const handleDelete = (team) => {
        if (!canDelete) return;
        setSelectedTeam(team);
        setModalType("delete");
        setShowModal(true);
    };

    const handleManageMembers = async (team) => {
        if (!team?.id) return toast.error("Invalid team");
        try {
            await dispatch(fetchTeamMembers(team.id)).unwrap();
            dispatch(fetchAgents(team.company_id));
        } catch {
            return toast.error("Failed to load members");
        }

        setFormData((prev) => ({
            ...prev,
            company_id: team.company_id,
            members: membersCache[team.id]?.map((m) => m.id) || [],
        }));
        setSelectedTeam(team);
        setModalType("manage-members");
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const toggleMember = (userId) => {
        setFormData((prev) => ({
            ...prev,
            members: prev.members.includes(userId)
                ? prev.members.filter((id) => id !== userId)
                : [...prev.members, userId],
        }));
    };

    const selectAllAgents = () => {
        const allAgentIds = companyAgents.map((u) => u.id);
        const allSelected = allAgentIds.every((id) => formData.members.includes(id));
        setFormData((prev) => ({ ...prev, members: allSelected ? [] : allAgentIds }));
    };

    const handleConfirm = async () => {
        try {
            if (modalType === "delete") {
                await dispatch(deleteTeam(selectedTeam.id)).unwrap();
                toast.success("Team deleted successfully!");
            } else if (modalType === "create") {
                const payload = {
                    company_id: Number(formData.company_id),
                    name: formData.name.trim(),
                    Specialization: formData.Specialization.trim(),
                };
                if (formData.lead_id) payload.user_id = Number(formData.lead_id);
                await dispatch(createTeam(payload)).unwrap();
                toast.success("Team created successfully!");
            } else if (modalType === "edit") {
                const payload = {
                    company_id: Number(formData.company_id),
                    name: formData.name.trim(),
                    Specialization: formData.Specialization.trim(),
                };
                if (formData.lead_id) payload.user_id = Number(formData.lead_id);
                await dispatch(updateTeam({ id: selectedTeam.id, data: { ...payload, _method: "PUT" } })).unwrap();
                toast.success("Team updated successfully!");
            } else if (modalType === "manage-members") {
                if (!selectedTeam?.id) return toast.error("Team not found");
                await dispatch(updateTeamMembers({ teamId: selectedTeam.id, members: formData.members })).unwrap();
                toast.success("Members updated successfully!");
            }
            dispatch(fetchTeams());
        } catch (error) {
            const msg = error.errors
                ? Object.values(error.errors).flat().join(", ")
                : error?.message || "An error occurred";
            toast.error(msg);
        } finally {
            setShowModal(false);
        }
    };

    if (teamsLoading || compLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <TailSpin height={150} width={150} color="var(--primary-color)" />
            </div>
        );
    }

    return (
        <div className="p-6 relative">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Teams Management</h1>
                {canAdd && (
                    <button
                        onClick={handleCreate}
                        className="bg-[var(--secondary-color)] text-white hover:bg-[#DE9900] px-3 py-1.5 rounded-md flex items-center gap-2 text-[16px]"
                    >
                        <FaPlus /> Create Team
                    </button>
                )}
            </div>

            {!canView ? (
                <p className="text-center text-gray-500 py-8">You don't have permission to view teams.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-[900px] w-full border-collapse bg-white shadow-md rounded-lg">
                        <thead className="bg-[var(--primary-color)] text-text-color">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Specialization</th>
                                <th className="p-3 text-left">Company</th>
                                <th className="p-3 text-left">Lead</th>
                                <th className="p-3 text-left">Members</th>
                                {showActions && <th className="p-3 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {teamsArray.length > 0 ? (
                                teamsArray.map((team, idx) => (
                                    <tr key={team.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{idx + 1}</td>
                                        <td className="p-3 font-semibold">{team.name}</td>
                                        <td className="p-3">{team.Specialization}</td>
                                        <td className="p-3">{companies.find((c) => c.id === team.company_id)?.name || "—"}</td>
                                        <td className="p-3">{team.lead?.name || "—"}</td>
                                        <td className="p-3">{team.members?.length || 0}</td>
                                        {showActions && (
                                            <td className="p-3 text-center">
                                                <div className="flex justify-center gap-4">
                                                    {canEdit && (
                                                        <>
                                                            <FaEdit
                                                                onClick={() => handleEdit(team)}
                                                                className="text-blue-600 cursor-pointer hover:scale-110"
                                                            />
                                                            <Tooltip content="Edit" />
                                                        </>
                                                    )}
                                                    {canView && (
                                                        <Link to={`/teams/${team.id}`}>
                                                            <FaEye className="text-purple-600 cursor-pointer hover:scale-110" />
                                                        </Link>
                                                    )}
                                                    {canEdit && (
                                                        <FaUsers
                                                            onClick={() => handleManageMembers(team)}
                                                            className="text-green-600 cursor-pointer hover:scale-110"
                                                        />
                                                    )}
                                                    {canDelete && (
                                                        <FaTrashAlt
                                                            onClick={() => handleDelete(team)}
                                                            className="text-red-600 cursor-pointer hover:scale-110"
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-6 text-gray-500">
                                        No teams found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">
                            {modalType === "delete"
                                ? "Confirm Deletion"
                                : modalType === "edit"
                                    ? "Edit Team"
                                    : modalType === "create"
                                        ? "Create Team"
                                        : "Manage Team Members"}
                        </h3>

                        {modalType === "delete" && (
                            <p className="mb-6">
                                Are you sure you want to delete <strong>{selectedTeam?.name}</strong>?
                            </p>
                        )}

                        {(modalType === "create" || modalType === "edit") && (
                            <div className="flex flex-col gap-4">
                                <select
                                    name="company_id"
                                    value={formData.company_id}
                                    onChange={handleInputChange}
                                    className="border rounded-lg px-3 py-2"
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    name="name"
                                    placeholder="Team Name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="border rounded-lg px-3 py-2"
                                />
                                <input
                                    name="Specialization"
                                    placeholder="Specialization"
                                    value={formData.Specialization}
                                    onChange={handleInputChange}
                                    className="border rounded-lg px-3 py-2"
                                />
                                <select
                                    name="lead_id"
                                    value={formData.lead_id}
                                    onChange={handleInputChange}
                                    className="border rounded-lg px-3 py-2"
                                    disabled={!formData.company_id}
                                >
                                    <option value="">
                                        {formData.company_id ? "Select Lead" : "First select company"}
                                    </option>
                                    {companyAgents.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {modalType === "manage-members" && (
                            <div className="space-y-3">
                                <button
                                    onClick={selectAllAgents}
                                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                                    disabled={companyAgents.length === 0}
                                >
                                    {formData.members.length === companyAgents.length
                                        ? "Deselect All"
                                        : "Select All Agents"}
                                </button>
                                <div className="max-h-64 overflow-y-auto border p-2 rounded bg-gray-50">
                                    {companyAgents.length === 0 ? (
                                        <p className="text-center text-sm text-gray-500">
                                            {formData.company_id
                                                ? "No agents available for this company."
                                                : "Loading agents..."}
                                        </p>
                                    ) : (
                                        companyAgents.map((u) => (
                                            <label
                                                key={u.id}
                                                className="flex items-center gap-2 py-1 cursor-pointer text-sm"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.members.includes(u.id)}
                                                    onChange={() => toggleMember(u.id)}
                                                />
                                                <span>
                                                    {u.name} <span className="text-gray-500">({u.email})</span>
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-200 py-2 px-4 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            {["create", "edit", "manage-members"].includes(modalType) && (
                                <button
                                    onClick={handleConfirm}
                                    className="bg-[var(--secondary-color)] text-white py-2 px-4 rounded hover:bg-[#DE9900]"
                                >
                                    Save
                                </button>
                            )}
                            {modalType === "delete" && (
                                <button
                                    onClick={handleConfirm}
                                    className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teams;