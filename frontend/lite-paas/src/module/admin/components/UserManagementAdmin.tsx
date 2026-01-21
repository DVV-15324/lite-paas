import React, { useEffect, useState } from "react";

interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    banned?: boolean;
    phone?: { String: string; Valid: boolean };
    created_at: string;
}

interface ApiResponse {
    data: User[];
}

const baseURL = "http://localhost:3000";

const UserManagementAdmin: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [role, setRole] = useState<"all" | "admin" | "user">("all");

    const token = localStorage.getItem("access_token");

    // Fetch users
    const fetchUsers = async () => {
        if (!token) return;

        setLoading(true);
        const res = await fetch(`${baseURL}/admin/user/get_user_all`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        const json: ApiResponse = await res.json();
        setUsers(json.data);
        console.log(json.data)
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Ban / Unban
    const toggleBan = async (user: User) => {
        if (!token) return;

        const ok = window.confirm(
            `${user.banned ? "Mở khóa" : "Khóa"} người dùng ${user.name}?`
        );
        if (!ok) return;

        await fetch(
            `${baseURL}/admin/auth/${user.id}/${user.banned ? 0 : 1}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        setUsers((prev) =>
            prev.map((u) =>
                u.id === user.id ? { ...u, banned: !u.banned } : u
            )
        );
    };

    // Filter
    const filteredUsers = users.filter((u) => {
        if (role !== "all" && u.role !== role) return false;
        if (
            search &&
            !u.name.toLowerCase().includes(search.toLowerCase()) &&
            !u.email.toLowerCase().includes(search.toLowerCase())
        )
            return false;
        return true;
    });

    if (loading) return <p>Đang tải...</p>;

    return (
        <div className="p-4 space-y-4">
            {/* Filters */}
            <div className="flex gap-2">
                <input
                    className="border px-2 py-1"
                    placeholder="Tìm tên hoặc email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="border px-2 py-1"
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                >
                    <option value="all">Tất cả</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
            </div>

            {/* Table */}
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Tên</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Vai trò</th>
                        <th className="border p-2">Trạng thái</th>
                        <th className="border p-2">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((u) => (
                        <tr key={u.id}>
                            <td className="border p-2">{u.name}</td>
                            <td className="border p-2">{u.email}</td>
                            <td className="border p-2">{u.role}</td>
                            <td className="border p-2">
                                {u.banned ? "Hoạt động" : "Đã khóa"}
                            </td>
                            <td className="border p-2">
                                <button
                                    className="text-blue-600 underline"
                                    onClick={() => toggleBan(u)}
                                >
                                    {u.banned ? "Khóa" : "Mở khóa"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementAdmin;
