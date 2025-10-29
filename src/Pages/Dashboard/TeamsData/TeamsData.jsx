import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { showTeam } from "../../../features/teamsSlice";
import { FaArrowLeft, FaUsers, FaCalendarAlt, FaTag, FaUserTie } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-toastify";

const TeamsData = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { teamDetails, loading, error } = useSelector((s) => s.teams);
    const team = teamDetails?.team;
    const members = team?.members || [];

    useEffect(() => {
        dispatch(showTeam(id));
    }, [dispatch, id]);

    useEffect(() => {
        if (error) toast.error(error);
    }, [error]);

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString();
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <TailSpin height={150} width={150} color="var(--primary-color)" />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">Team not found.</p>
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
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition text-sm"
            >
                <FaArrowLeft /> Back to Teams
            </button>

            {/* Header Card */}
            <div className="bg-gradient-to-r from-orange-300 to-[#F7AA00] text-white p-6 rounded-2xl shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <FaUsers className="text-3xl opacity-90" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">
                                {team?.name || "Team"}
                            </h1>
                            <p className="text-sm opacity-90">
                                Team ID: {team?.id || "—"}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm mt-3">
                        <div className="flex items-center gap-2">
                            <FaUserTie />{" "}
                            <span>
                                <strong>Lead:</strong> {team?.lead?.name || "—"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaTag />{" "}
                            <span>
                                <strong>Specialization:</strong> {team?.Specialization || "—"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaCalendarAlt />{" "}
                            <span>
                                <strong>Created:</strong> {formatDate(team?.created_at)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Members Count Badge */}
                <div className="flex-shrink-0 text-center bg-white/20 px-5 py-3 rounded-xl shadow-inner">
                    <p className="text-3xl font-bold">{members.length}</p>
                    <p className="uppercase text-sm tracking-wide">Members</p>
                </div>
            </div>

            {/* Members Section */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FaUsers className="text-[#F7AA00]" /> Team Members
                </h2>

                {members.length === 0 ? (
                    <p className="text-gray-500">No members in this team yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200 rounded-xl">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold">#</th>
                                    <th className="py-3 px-4 text-left font-semibold">Name</th>
                                    <th className="py-3 px-4 text-left font-semibold">Email</th>
                                    <th className="py-3 px-4 text-left font-semibold">Role</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {members.map((member, index) => (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-gray-50 transition text-gray-700"
                                    >
                                        <td className="py-3 px-4">{index + 1}</td>
                                        <td className="py-3 px-4">{member.name || "—"}</td>
                                        <td className="py-3 px-4">{member.email || "—"}</td>
                                        <td className="py-3 px-4 capitalize">
                                            {member.role || "Member"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamsData;