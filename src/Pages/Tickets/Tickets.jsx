import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    assignTicketToMe,
    fetchAgents,
} from "../../features/ticketsSlice";
import { fetchProjects } from "../../features/projectsSlice";
import { FaEdit, FaTrashAlt, FaPlus, FaEye, FaUserCheck } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";

const statusColors = {
    open: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-200 text-gray-800",
};

const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
};

const Tickets = () => {
    const dispatch = useDispatch();
    const { tickets, loading: ticketLoading, agentsCache } = useSelector((s) => s.tickets);
    const { projects, loading: projLoading } = useSelector((s) => s.projects);
    const { user } = useSelector((s) => s.auth);

    const perms = user?.permissions || [];
    const canAdd = perms.includes("add tickets");
    const canEdit = perms.includes("edit tickets");
    const canDelete = perms.includes("delete tickets");
    const canAssign = perms.includes("assign tickets");
    const canViewAll = perms.includes("view tickets");
    const canViewOwn = perms.includes("view own tickets");
    const isAgent = user?.roles?.includes("Agent");
    const showActions = canEdit || canDelete;

    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "medium",
        type: "bug",
        project_id: "",
        assigned_to: "",
        status: "open",
    });

    const projectAgents = formData.project_id ? agentsCache[formData.project_id] || [] : [];

    const getAgentName = (ticket) => {
        if (!ticket.assigned_to) return "Unassigned";

        if (typeof ticket.assigned_to === "object") {
            const a = ticket.assigned_to;
            return a?.name ? `${a.name} (${a.email || ""})` : "Unassigned";
        }

        // fallback: find agent by ID in cache
        const projectId = ticket.project?.id;
        const agents = agentsCache[projectId] || [];
        const agent = agents.find(a => a.id === ticket.assigned_to);

        return agent ? `${agent.name} (${agent.email})` : `Agent #${ticket.assigned_to}`;
    };

    // Fetch agents when project changes in modal
    useEffect(() => {
        if ((modalType === "create" || modalType === "edit") && formData.project_id) {
            if (!agentsCache[formData.project_id]) {
                dispatch(fetchAgents(formData.project_id));
            }
        }
    }, [dispatch, formData.project_id, modalType, agentsCache]);

    // Load tickets and projects
    useEffect(() => {
        if (!user) return;
        if (canViewAll || canViewOwn) {
            dispatch(fetchTickets());
            dispatch(fetchProjects());
        }
    }, [dispatch, user, canViewAll, canViewOwn]);

    useEffect(() => {
        if (tickets.length > 0) {
            tickets.forEach(ticket => {
                const projectId = ticket.project?.id;
                if (projectId && !agentsCache[projectId]) {
                    dispatch(fetchAgents(projectId));
                }
            });
        }
    }, [tickets, agentsCache, dispatch]);

    const ticketsArray = Array.isArray(tickets) ? tickets : [];
    const filteredTickets = canViewAll
        ? ticketsArray
        : ticketsArray.filter((t) => t.assigned_to === user.id);

    const handleCreate = () => {
        if (!canAdd) return;
        setModalType("create");
        setFormData({
            title: "",
            description: "",
            priority: "medium",
            type: "bug",
            project_id: "",
            assigned_to: "",
            status: "open",
        });
        setSelectedTicket(null);
        setShowModal(true);
    };

    const handleEdit = (ticket) => {
        if (!canEdit) return;
        setModalType("edit");
        setSelectedTicket(ticket);
        setFormData({
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            type: ticket.type || "bug",
            project_id: ticket.project.id,
            assigned_to: ticket.assigned_to ? String(ticket.assigned_to) : "",
            status: ticket.status,
        });

        if (!agentsCache[ticket.project.id]) {
            dispatch(fetchAgents(ticket.project.id));
        }
        setShowModal(true);
    };

    const handleDelete = (ticket) => {
        if (!canDelete) return;
        setSelectedTicket(ticket);
        setModalType("delete");
        setShowModal(true);
    };

    const handleAssignToMe = async (ticket) => {
        if (!isAgent || !canAssign) return;
        try {
            await dispatch(assignTicketToMe({ ticketId: ticket.id, agentId: user.id })).unwrap();
            toast.success("Assigned to you!");
            dispatch(fetchTickets());
        } catch {
            toast.error("Failed to assign");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            if (name === "project_id" && value && !agentsCache[value]) {
                dispatch(fetchAgents(value));
            }
            return updated;
        });
    };

    const handleConfirm = async () => {
        try {
            if (modalType === "delete") {
                await dispatch(deleteTicket(selectedTicket.id)).unwrap();
                toast.success("Ticket deleted");
            } else if (modalType === "create" || modalType === "edit") {
                if (!formData.title || !formData.project_id) {
                    toast.error("Title and Project are required");
                    return;
                }

                const payload = {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    priority: formData.priority,
                    type: formData.type,
                    project_id: Number(formData.project_id),
                    assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
                    ...(modalType === "edit" && { status: formData.status }),
                };

                if (modalType === "create") {
                    await dispatch(createTicket(payload)).unwrap();
                    toast.success("Ticket created");
                } else if (modalType === "edit") {
                    await dispatch(updateTicket({ id: selectedTicket.id, data: payload })).unwrap();
                    toast.success("Ticket updated");
                }
            }
            dispatch(fetchTickets());
        } catch (err) {
            toast.error(err?.message || "Operation failed");
        } finally {
            setShowModal(false);
        }
    };

    if (ticketLoading || projLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <TailSpin height={150} width={150} color="var(--primary-color)" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Tickets Management</h1>
                {canAdd && (
                    <button
                        onClick={handleCreate}
                        className="bg-[var(--secondary-color)] text-white hover:bg-[#DE9900] px-4 py-2 rounded-md flex items-center gap-2"
                        data-tooltip-id="tooltip"
                        data-tooltip-content="Create New Ticket"
                    >
                        <FaPlus /> Create Ticket
                    </button>
                )}
            </div>

            {!canViewAll && !canViewOwn ? (
                <p className="text-center text-gray-500 py-8">No permission to view tickets.</p>
            ) : filteredTickets.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No tickets found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white shadow-md rounded-lg">
                        <thead className="bg-[var(--primary-color)] text-white">
                            <tr>
                                <th className="p-3 text-left">#</th>
                                <th className="p-3 text-left">Title</th>
                                <th className="p-3 text-left">Project</th>
                                <th className="p-3 text-left">Priority</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Assigned To</th>
                                {showActions && <th className="p-3 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTickets.map((t, i) => (
                                <tr key={t.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">{i + 1}</td>
                                    <td className="p-3 font-semibold">{t.title}</td>
                                    <td className="p-3">{t.project?.name || "—"}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[t.priority]}`}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[t.status]}`}>
                                            {t.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {getAgentName(t)}
                                    </td>

                                    {showActions && (
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-3">
                                                {canEdit && (
                                                    <FaEdit
                                                        onClick={() => handleEdit(t)}
                                                        className="text-blue-600 cursor-pointer hover:scale-110"
                                                        data-tooltip-id="tooltip"
                                                        data-tooltip-content="Edit Ticket"
                                                    />
                                                )}
                                                <Link to={`/tickets/${t.id}`}>
                                                    <FaEye
                                                        className="text-purple-600 cursor-pointer hover:scale-110"
                                                        data-tooltip-id="tooltip"
                                                        data-tooltip-content="View Details"
                                                    />
                                                </Link>
                                                {isAgent && canAssign && (
                                                    <button
                                                        onClick={() => handleAssignToMe(t)}
                                                        className="text-green-600 hover:scale-110"
                                                        data-tooltip-id="tooltip"
                                                        data-tooltip-content="Assign to Me"
                                                    >
                                                        <FaUserCheck />
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <FaTrashAlt
                                                        onClick={() => handleDelete(t)}
                                                        className="text-red-600 cursor-pointer hover:scale-110"
                                                        data-tooltip-id="tooltip"
                                                        data-tooltip-content="Delete Ticket"
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
                    <div
                        className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold mb-4">
                            {modalType === "create" ? "Create Ticket" : "Edit Ticket"}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                    placeholder="Enter title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                    rows="3"
                                    placeholder="Enter description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="task">Task</option>
                                    <option value="bug">Bug</option>
                                    <option value="feature">Feature</option>
                                    <option value="improvement">Improvement</option>
                                </select>
                            </div>

                            {modalType === "edit" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                <select
                                    name="project_id"
                                    value={formData.project_id}
                                    onChange={handleInputChange}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="">Select Project</option>
                                    {projects.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* AGENT DROPDOWN */}
                            {formData.project_id && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assign Agent (optional)
                                    </label>
                                    {projectAgents.length > 0 ? (
                                        <select
                                            name="assigned_to"
                                            value={formData.assigned_to}
                                            onChange={handleInputChange}
                                            className="w-full border rounded p-2"
                                        >
                                            <option value="">Unassigned</option>
                                            {projectAgents.map((a) => (
                                                <option key={a.id} value={a.id}>
                                                    {a.name} ({a.email})
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <p className="text-sm text-gray-500">Loading agent...</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
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
                    <div
                        className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold mb-4">Delete Ticket</h3>
                        <p>
                            Delete <strong>{selectedTicket.title}</strong>?
                        </p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Tooltip id="tooltip" place="top" effect="solid" className="text-xs" />
        </div>
    );
};

export default Tickets;