import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../features/usersSlice";

const Users = () => {
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector((state) => state.users);

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    if (loading) return <p className="p-8 text-lg">Loading users...</p>;
    if (error)
        return (
            <p className="p-8 text-red-500">
                {typeof error === "string" ? error : error.message || "An error occurred"}
            </p>
        );


    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-[#235784] mb-6">Users Management</h1>

            <div className="overflow-x-auto shadow-md rounded-xl bg-white">
                <table className="min-w-full border-collapse">
                    <thead className="bg-[#235784] text-[#EEF6F7]">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">ID</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">Name</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">Email</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">Role</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">Company</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr
                                key={user.id}
                                className={`border-b hover:bg-[#F7AA00]/10 transition ${index % 2 === 0 ? "bg-[#EEF6F7]/30" : "bg-white"
                                    }`}
                            >
                                <td className="px-6 py-3 text-sm">{user.id}</td>
                                <td className="px-6 py-3 text-sm font-medium">{user.name}</td>
                                <td className="px-6 py-3 text-sm">{user.email}</td>
                                <td className="px-6 py-3 text-sm">{user.roles.join(", ")}</td>
                                <td className="px-6 py-3 text-sm">{user.company?.name}</td>
                                <td className="px-6 py-3 text-sm">{user.created_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
