import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { showProject, clearProjectDetails } from "../../../features/projectsSlice";
import { FaArrowLeft, FaTag, FaUserTie, FaBuilding, FaUsers, FaUserCheck } from "react-icons/fa";
import { TailSpin } from "react-loader-spinner";
import { toast } from "react-toastify";

const ProjectsData = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { projectDetails: project, loading, error } = useSelector((s) => s.projects);

    useEffect(() => {
        dispatch(showProject(id));
        return () => dispatch(clearProjectDetails());
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

    if (!project) {
        return (
            <div className="p-6 text-center">
                <p className="text-gray-500">Project not found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-[var(--secondary-color)] hover:underline flex items-center gap-2 mx-auto">
                    <FaArrowLeft /> Back
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm">
                <FaArrowLeft /> Back to Projects
            </button>

            <div className="bg-gradient-to-r from-orange-300 to-[#F7AA00] text-white p-6 rounded-2xl shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <FaTag className="text-3xl opacity-90" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">{project.name}</h1>
                            <p className="text-sm opacity-90">ID: {project.id}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm mt-3">
                        <div className="flex items-center gap-2">
                            <FaUserTie /> <span><strong>Client:</strong> {project.client?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaBuilding /> <span><strong>Company:</strong> {project.company?.name}</span>
                        </div>
                    </div>
                </div>

                <div className="flex-shrink-0 text-center bg-white/20 px-5 py-3 rounded-xl shadow-inner">
                    <p className="text-3xl font-bold">{project.status.replace("_", " ")}</p>
                    <p className="uppercase text-sm tracking-wide">Status</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl shadow">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-3"><FaUsers /> Team</h2>
                    <p>{project.team?.name || "Not assigned"}</p>
                </div>

                <div className="bg-white p-5 rounded-xl shadow">
                    <h2 className="text-lg font-semibold flex items-center gap-2 mb-3"><FaUserCheck /> Assigned To</h2>
                    <p>{project.assigned_to_name || project.assigned_to?.name || "Not assigned"}</p>
                </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-3">Description</h2>
                <p className="text-gray-700">{project.description || "—"}</p>
            </div>
        </div>
    );
};

export default ProjectsData;