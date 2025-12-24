"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Search, Shield, ShieldOff, Trash2, UserCog } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

export default function AdminManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            } else {
                toast.error(data.error || "Failed to fetch users");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetUserId: userId, newRole }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                fetchUsers(); // Refresh list
            } else {
                toast.error(data.message || "Failed to update role");
            }
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    const confirmDelete = (userId) => {
        setUserToDelete(userId);
        setDeleteModalOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            const res = await fetch(`/api/admin/users?id=${userToDelete}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                fetchUsers(); // Refresh list
            } else {
                toast.error(data.message || "Failed to delete user");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setDeleteModalOpen(false);
            setUserToDelete(null);
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <UserCog className="w-8 h-8 text-[#de5422]" />
                    Admin Management
                </h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#de5422]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600">User</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Role</th>
                                <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                        Loading users...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-[#de5422] font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === "admin"
                                                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                                                    }`}
                                            >
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {user.role === "customer" ? (
                                                    <button
                                                        onClick={() => handleRoleUpdate(user._id, "admin")}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                                        title="Promote to Admin"
                                                    >
                                                        <Shield className="w-3 h-3" />
                                                        Make Admin
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRoleUpdate(user._id, "customer")}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
                                                        title="Demote to Customer"
                                                    >
                                                        <ShieldOff className="w-3 h-3" />
                                                        Remove Admin
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => confirmDelete(user._id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Standard Confirmation Modal */}
            <ConfirmModal
                show={deleteModalOpen}
                title="Delete User?"
                message="Are you sure you want to delete this user? This action cannot be undone and will permanently remove their data from the system."
                yesText="Delete User"
                variant="danger"
                onYes={handleDeleteUser}
                onNo={() => {
                    setDeleteModalOpen(false);
                    setUserToDelete(null);
                }}
            />
        </div>
    );
}
