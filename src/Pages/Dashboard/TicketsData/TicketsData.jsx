import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { showTicket, clearTicketDetails, fetchAgents } from "../../../features/ticketsSlice";
import { FaArrowLeft, FaTag, FaExclamationTriangle, FaProjectDiagram, FaUserCheck, FaClock } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-toastify";

const priorityColors = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
};

const TicketsData = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { ticketDetails: ticket, loading, error, agentsCache } = useSelector((s) => s.tickets);

    useEffect(() => {
        dispatch(showTicket(id));
        return () => dispatch(clearTicketDetails());
    }, [dispatch, id]);

    // Fetch agent for this ticket's project
    useEffect(() => {
        if (ticket?.project?.id && !agentsCache[ticket.project.id]) {
            dispatch(fetchAgents(ticket.project.id));
        }
    }, [ticket, agentsCache, dispatch]);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    const getAgentName = () => {
        if (!ticket?.assigned_to) return "Unassigned";
        if (typeof ticket.assigned_to === "object") {
            const a = ticket.assigned_to;
            return a?.name ? `${a.name} (${a.email || ""})` : "Unassigned";
        }
        // Handle numeric ID form (fallback)
        const agents = agentsCache[ticket.project?.id] || [];
        const agent = agents.find(a => a.id === ticket.assigned_to);
        return agent ? `${agent.name} (${agent.email})` : `Agent #${ticket.assigned_to}`;
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <TailSpin height={150} width={150} color="var(--primary-color)" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">Ticket not found.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-[var(--secondary-color)] hover:underline flex items-center gap-2 mx-auto"
                >
                    <FaArrowLeft /> Back
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
            >
                <FaArrowLeft /> Back to Tickets
            </button>

            <div className="bg-gradient-to-r from-orange-300 to-[#F7AA00] text-white p-6 rounded-2xl shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <FaTag className="text-3xl opacity-90" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">{ticket.title}</h1>
                            <p className="text-sm opacity-90">ID: #{ticket.id}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm mt-3">
                        <div className="flex items-center gap-2">
                            <FaExclamationTriangle />
                            <span>
                                <strong>Priority:</strong>{" "}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                                    {ticket.priority.toUpperCase()}
                                </span>
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <FaProjectDiagram />
                            <span>
                                <strong>Project:</strong> {ticket.project.name}
                            </span>
                        </div>

                        {ticket.type && (
                            <div className="flex items-center gap-2">
                                <FaTag />
                                <span>
                                    <strong>Type:</strong> {ticket.type}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0 text-center bg-white/20 px-5 py-3 rounded-xl shadow-inner">
                    <p className="text-3xl font-bold">{ticket.status.replace("_", " ")}</p>
                    <p className="uppercase text-sm tracking-wide">Status</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl shadow">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                        <FaUserCheck /> Assigned To
                    </h2>
                    <p>{getAgentName()}</p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
                        <FaClock /> Created At
                    </h2>
                    <p>{new Date(ticket.created_at).toLocaleString()}</p>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                    {ticket.description || "—"}
                </p>
            </div>
        </div>
    );
};

export default TicketsData;