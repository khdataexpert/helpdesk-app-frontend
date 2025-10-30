import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    assignProject,
    fetchAgents,
    fetchTeams,
} from "../../features/projectsSlice";
import { fetchCompanies } from "../../features/companiesSlice";
import { FaEdit, FaTrashAlt, FaPlus, FaEye, FaUserCheck } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";

const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
};

const Projects = () => {
    const dispatch = useDispatch();
    const {
        projects,
        loading: projLoading,
        agentsCache,
        teamsCache,
    } = useSelector((s) => s.projects);
    const { companies, loading: compLoading } = useSelector((s) => s.companies);
    const { user } = useSelector((s) => s.auth);

    const perms = user?.permissions || [];
    const canAdd = perms.includes("add projects");
    const canEdit = perms.includes("edit projects");
    const canDelete = perms.includes("delete projects");
    const canAssign = perms.includes("assign projects");
    const canViewAll = perms.includes("view projects");
    const canViewOwn = perms.includes("view own projects");
    const isAgent = user?.roles?.includes("Agent");
    const isClient = user?.roles?.includes("Client");
    const showActions = canEdit || canDelete;

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [selectedProject, setSelectedProject] = useState(null);
    const [formData, setFormData] = useState({
        company_id: "",
        name: "",
        description: "",
        status: "pending",
        client_id: "",
        team_id: "",
        assigned_to: "",
    });

    useEffect(() => {
        if (!user) return;
        if (canViewAll || canViewOwn) {
            dispatch(fetchProjects());
            dispatch(fetchCompanies());
        }
    }, [dispatch, user, canViewAll, canViewOwn]);

    useEffect(() => {
        if ((modalType === "create" || modalType === "edit") && formData.company_id) {
            dispatch(fetchAgents(formData.company_id));
            dispatch(fetchTeams(formData.company_id));
        }
    }, [dispatch, formData.company_id, modalType]);

    useEffect(() => {
        if (modalType === "create" && isClient && !formData.client_id) {
            setFormData((prev) => ({ ...prev, client_id: user.id }));
        }
    }, [modalType, isClient, user.id]);

    const projectsArray = Array.isArray(projects) ? projects : [];
    const companyAgents = agentsCache[formData.company_id] || [];
    const companyTeams = teamsCache[formData.company_id] || [];

    const filteredProjects = canViewAll
        ? projectsArray
        : projectsArray.filter((p) => p.client?.id === user.id);

    const handleCreate = () => {
        if (!canAdd) return;
        setModalType("create");
        setFormData({
            company_id: "",
            name: "",
            description: "",
            status: "pending",
            client_id: isClient ? user.id : "",
            team_id: "",
            assigned_to: "",
        });
        setSelectedProject(null);
        setShowModal(true);
    };

    const handleEdit = (proj) => {
        if (!canEdit) return;
        setModalType("edit");
        setSelectedProject(proj);
        setFormData({
            company_id: proj.company.id,
            name: proj.name,
            description: proj.description,
            status: proj.status,
            client_id: proj.client.id || "",
            team_id: proj.team?.id || "",
            assigned_to: proj.assigned_to || "",
        });
        setShowModal(true);
    };

    const handleDelete = (proj) => {
        if (!canDelete) return;
        setSelectedProject(proj);
        setModalType("delete");
        setShowModal(true);
    };

    const handleAssignToMe = async (proj) => {
        if (!isAgent || !canAssign) return;
        try {
            await dispatch(assignProject({ projectId: proj.id, agentId: user.id })).unwrap();
            toast.success("Assigned to you!");
            dispatch(fetchProjects());
        } catch {
            toast.error("Failed to assign");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleConfirm = async () => {
        try {
            if (modalType === "delete") {
                await dispatch(deleteProject(selectedProject.id)).unwrap();
                toast.success("Project deleted");
            } else if (modalType === "create" || modalType === "edit") {
                // VALIDATE client_id
                if (!formData.client_id) {
                    toast.error("Client is required");
                    return;
                }

                const payload = {
                    company_id: Number(formData.company_id),
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    status: formData.status,
                    client_id: Number(formData.client_id),
                    team_id: formData.team_id ? Number(formData.team_id) : null,
                    assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
                };
                if (modalType === "create") {
                    await dispatch(createProject(payload)).unwrap();
                    toast.success("Project created");
                } else if (modalType === "edit") {
                    await dispatch(updateProject({ id: selectedProject.id, data: payload })).unwrap();
                    toast.success("Project updated");
                }
            }
            dispatch(fetchProjects());
        } catch (err) {
            toast.error(err?.message || "Operation failed");
        } finally {
            setShowModal(false);
        }
    };

    if (projLoading || compLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <TailSpin height={150} width={150} color="var(--primary-color)" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Projects Management</h1>
                {canAdd && (
                    <button
                        onClick={handleCreate}
                        className="bg-[var(--secondary-color)] text-white hover:bg-[#DE9900] px-4 py-2 rounded-md flex items-center gap-2"
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Create New Project"
                    >
                        <FaPlus /> Create Project
                    </button>
                )}
            </div>

            {!canViewAll && !canViewOwn ? (
                <p className="text-center text-gray-500 py-8">No permission to view projects.</p>
            ) : filteredProjects.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No projects found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-[var(--primary-color)] text-white">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Client</th>
                                <th className="p-3 text-left">Company</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Team</th>
                                <th className="p-3 text-left">Assigned</th>
                                {showActions && <th className="p-3 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProjects.map((proj, i) => (
                                <tr key={proj.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{i + 1}</td>
                                    <td className="p-3 font-semibold">{proj.name}</td>
                                    <td className="p-3">{proj.client?.name || "—"}</td>
                                    <td className="p-3">{proj.company?.name || "—"}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[proj.status]}`}>
                                            {proj.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="p-3">{proj.team?.name || "—"}</td>
                                    <td className="p-3">
                                        {proj.assigned_to_name || proj.assigned_to?.name || "—"}
                                    </td>

                                    {showActions && (
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-3">
                                                {canEdit && (
                                                    <FaEdit
                                                        onClick={() => handleEdit(proj)}
                                                        className="text-blue-600 cursor-pointer hover:scale-110"
                                                        data-tooltip-id="tooltip"
                                                        data-tooltip-content="Edit Project"
                                                    />
                                                )}
                                                <Link to={`/projects/${proj.id}`}>
                                                    <FaEye
                                                        className="text-purple-600 cursor-pointer hover:scale-110"
                                                        data-tooltip-id="tooltip"
                                                        data-tooltip-content="View Details"
                                                    />
                                                </Link>
                                                {isAgent && canAssign && (
                                                    <button
                                                        onClick={() => handleAssignToMe(proj)}
                                                        className="text-green-600 hover:scale-110"
                                                        data-tooltip-id="tooltip"
                                                        data-tooltip-content="Assign to Me"
                                                    >
                                                        <FaUserCheck />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <FaTrashAlt
                                                        onClick={() => handleDelete(proj)}
                                                        className="text-red-600 cursor-pointer hover:scale-110"
                                                        data-tooltip-id="tooltip"
                                                        data-tooltip-content="Delete Project"
                                                    />
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

            {/* CREATE / EDIT MODAL */}
            {showModal && (modalType === "create" || modalType === "edit") && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">
                            {modalType === "create" ? "Create Project" : "Edit Project"}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <select
                                    name="company_id"
                                    value={formData.company_id}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                <input
                                    name="name"
                                    placeholder="Enter project name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    placeholder="Enter description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {/* CLIENT DROPDOWN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                                <select
                                    name="client_id"
                                    value={formData.client_id}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                    required
                                >
                                    <option value="">Select Client</option>
                                    {companies.map((client) => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* TEAM DROPDOWN */}
                            {formData.company_id && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Team (optional)</label>
                                    <select
                                        name="team_id"
                                        value={formData.team_id}
                                        onChange={handleInputChange}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="">Select Team</option>
                                        {companyTeams.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* AGENT DROPDOWN */}
                            {formData.company_id && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Agent to</label>
                                    <select
                                        name="assigned_to"
                                        value={formData.assigned_to}
                                        onChange={handleInputChange}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="">Select Agent</option>
                                        {companyAgents.map((a) => (
                                            <option key={a.id} value={a.id}>{a.name} ({a.email})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 bg-[var(--secondary-color)] text-white rounded hover:bg-[#DE9900]"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {showModal && modalType === "delete" && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold mb-4">Delete Project</h3>
                        <p>Delete <strong>{selectedProject.name}</strong>?</p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                                Cancel
                            </button>
                            <button onClick={handleConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOOLTIP COMPONENT */}
            <Tooltip id="tooltip" place="top" effect="solid" className="text-xs" />
        </div>
    );
};

export default Projects;