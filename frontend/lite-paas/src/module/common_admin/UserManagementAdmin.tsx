import React, { useState, useEffect } from "react";

interface User {
    id: string;
    name: string;
    phone: {
        String: string;
        Valid: boolean;
    };
    role: string;
    address: {
        String: string;
        Valid: boolean;
    };
    email: string;
    deleted_at: string;
    created_at: string;
    updated_at: string;
    is_banned?: boolean;
    banned_at?: string;
}

interface ApiResponse {
    status: number;
    message: string;
    total: number;
    data: User[];
    timestamp: string;
}

const baseURL = 'http://localhost:3000';

const UserManagementAdmin: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState<string>("all");
    const [showBanModal, setShowBanModal] = useState(false);
    const [showUnbanModal, setShowUnbanModal] = useState(false);
    const [userToAction, setUserToAction] = useState<User | null>(null);
    const [banReason, setBanReason] = useState("");

    // Lấy danh sách người dùng
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("access_token");
            if (!token) {
                throw new Error("Access token not found");
            }

            const response = await fetch(`${baseURL}/admin/user/all`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data: ApiResponse = await response.json();
            setUsers(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    // Ban user
    const banUser = async (userId: string, reason: string) => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                throw new Error("Access token not found");
            }

            // Gọi API ban user
            const response = await fetch(`${baseURL}/admin/user/ban/${userId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    reason: reason || "Vi phạm điều khoản"
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            // Cập nhật local state
            setUsers(users.map(user =>
                user.id === userId ? {
                    ...user,
                    is_banned: true,
                    banned_at: new Date().toISOString()
                } : user
            ));

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            return false;
        }
    };

    // Unban user
    const unbanUser = async (userId: string) => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                throw new Error("Access token not found");
            }

            // Gọi API unban user
            const response = await fetch(`${baseURL}/admin/user/unban/${userId}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            // Cập nhật local state
            setUsers(users.map(user =>
                user.id === userId ? {
                    ...user,
                    is_banned: false,
                    banned_at: undefined
                } : user
            ));

            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            return false;
        }
    };

    // Lọc users
    const filteredUsers = users.filter(user => {
        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            if (!user.name.toLowerCase().includes(term) &&
                !user.email.toLowerCase().includes(term) &&
                !(user.phone.Valid && user.phone.String.includes(term))) {
                return false;
            }
        }

        // Filter by role
        if (selectedRole !== "all" && user.role !== selectedRole) {
            return false;
        }

        return true;
    });

    // Phân loại users
    const activeUsers = users.filter(user => !user.is_banned);
    const bannedUsers = users.filter(user => user.is_banned);
    const adminUsers = users.filter(user => user.role === "admin");
    const regularUsers = users.filter(user => user.role === "user");

    // Định dạng ngày
    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Màu sắc cho role
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800';
            case 'user':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Màu sắc cho trạng thái
    const getStatusColor = (is_banned: boolean | undefined) => {
        return is_banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
    };

    // Văn bản trạng thái
    const getStatusText = (is_banned: boolean | undefined) => {
        return is_banned ? 'Đã bị khóa' : 'Hoạt động';
    };

    // Xử lý ban user - THÊM CONFIRM DIALOG TRƯỚC
    const handleBanClick = (user: User) => {
        const confirmMessage = `Bạn có chắc muốn khóa tài khoản người dùng ${user.name} (${user.email})?`;
        const userConfirmed = window.confirm(confirmMessage);

        if (userConfirmed) {
            setUserToAction(user);
            setBanReason("");
            setShowBanModal(true);
        }
    };

    // Xử lý unban user - THÊM CONFIRM DIALOG TRƯỚC
    const handleUnbanClick = (user: User) => {
        const confirmMessage = `Bạn có chắc muốn mở khóa tài khoản người dùng ${user.name} (${user.email})?`;
        const userConfirmed = window.confirm(confirmMessage);

        if (userConfirmed) {
            setUserToAction(user);
            setShowUnbanModal(true);
        }
    };

    // Xác nhận ban
    const confirmBan = async () => {
        if (userToAction) {
            const success = await banUser(userToAction.id, banReason);
            if (success) {
                alert("Đã khóa tài khoản người dùng!");
            }
            setShowBanModal(false);
            setUserToAction(null);
            setBanReason("");
        }
    };

    // Xác nhận unban
    const confirmUnban = async () => {
        if (userToAction) {
            const success = await unbanUser(userToAction.id);
            if (success) {
                alert("Đã mở khóa tài khoản người dùng!");
            }
            setShowUnbanModal(false);
            setUserToAction(null);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-center text-gray-600">Đang tải dữ liệu người dùng...</p>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6 p-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
                    <div className="text-red-600 text-center mb-3">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2 text-center">Đã xảy ra lỗi</h3>
                    <p className="text-red-600 text-center">{error}</p>
                    <button
                        onClick={() => fetchUsers()}
                        className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h2>
                    <p className="text-gray-600">Quản lý và kiểm soát truy cập người dùng hệ thống</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm theo tên, email hoặc số điện thoại..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Tất cả</option>
                            <option value="admin">Admin</option>
                            <option value="user">Người dùng</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedRole("all");
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Người dùng
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thông tin liên hệ
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vai trò
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ngày tạo
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Thao tác
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        Không tìm thấy người dùng nào
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0">
                                                    <div className={`w-10 h-10 ${user.is_banned ? 'bg-red-200' : 'bg-gray-200'} rounded-full flex items-center justify-center`}>
                                                        <span className={`font-semibold ${user.is_banned ? 'text-red-600' : 'text-gray-600'}`}>
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.name}
                                                        {user.is_banned && (
                                                            <span className="ml-2 text-xs text-red-600">(Đã khóa)</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900">{user.email}</div>
                                            {user.phone.Valid && (
                                                <div className="text-sm text-gray-500">{user.phone.String}</div>
                                            )}
                                            {user.address.Valid && (
                                                <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                                                    {user.address.String}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                                {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.is_banned)}`}>
                                                {getStatusText(user.is_banned)}
                                            </span>
                                            {user.is_banned && user.banned_at && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Từ: {formatDate(user.banned_at)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm text-gray-900">
                                                {formatDate(user.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex space-x-2">
                                                {!user.is_banned ? (
                                                    <button
                                                        onClick={() => handleBanClick(user)}
                                                        className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-medium"
                                                    >
                                                        Khóa tài khoản
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleUnbanClick(user)}
                                                        className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 text-sm font-medium"
                                                    >
                                                        Mở khóa
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>



            {/* Ban Confirmation Modal */}
            {showBanModal && userToAction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Xác nhận khóa tài khoản</h3>
                            <p className="text-gray-600 mb-4 text-center">
                                Bạn có chắc muốn khóa tài khoản người dùng <span className="font-semibold">{userToAction.name}</span> ({userToAction.email})?
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do khóa (tùy chọn)</label>
                                <textarea
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    placeholder="Nhập lý do khóa tài khoản..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                            <p className="text-sm text-yellow-600 mb-4">
                                * Lưu ý: Người dùng bị khóa sẽ không thể đăng nhập vào hệ thống cho đến khi được mở khóa.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowBanModal(false);
                                        setUserToAction(null);
                                        setBanReason("");
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmBan}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                >
                                    Xác nhận khóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Unban Confirmation Modal */}
            {showUnbanModal && userToAction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Xác nhận mở khóa</h3>
                            <p className="text-gray-600 mb-4 text-center">
                                Bạn có chắc muốn mở khóa tài khoản người dùng <span className="font-semibold">{userToAction.name}</span> ({userToAction.email})?
                            </p>
                            <p className="text-sm text-green-600 mb-4 text-center">
                                Người dùng sẽ có thể đăng nhập và sử dụng hệ thống bình thường.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setShowUnbanModal(false);
                                        setUserToAction(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={confirmUnban}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                >
                                    Xác nhận mở khóa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagementAdmin;