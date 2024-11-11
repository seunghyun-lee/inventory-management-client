import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, X } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const roleOptions = ['관리자', '직원', '조회자', '퇴사', '대기'];

function AddUserModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        username: '',
        handler_name: '',
        email: '',
        role: '대기'
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateEmail(formData.email)) {
            setError('올바른 이메일 형식이 아닙니다.');
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/api/users/add`, formData);
            onSuccess();
            onClose();
        } catch (error) {
            setError(error.response?.data?.message || '사용자 추가 중 오류가 발생했습니다.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">신규 사용자 추가</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    {error && (
                        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                아이디
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                이름
                            </label>
                            <input
                                type="text"
                                name="handler_name"
                                value={formData.handler_name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                이메일
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                역할
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                {roleOptions.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            사용자 추가
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/users`);
            setUsers(response.data.map(user => ({ ...user, isModified: false })));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('사용자 목록을 불러오는데 실패했습니다.');
            setLoading(false);
        }
    };

    const handleRoleChange = (userId, newRole) => {
        setUsers(users.map(user => 
            user.id === userId 
            ? { ...user, role: newRole, isModified: user.role !== newRole } 
            : user
        ));
        setOpenDropdown(null);
    };

    const handleUpdate = async (user) => {
        try {
            await axios.put(`${API_BASE_URL}/api/users/${user.id}/role`, { role: user.role });
            setUsers(users.map(u => u.id === user.id ? { ...u, isModified: false } : u));
            setError(null); // 성공 시 에러 메시지 초기화
        } catch (error) {
            console.error('Error updating user:', error);
            const errorMessage = error.response?.data?.error || '사용자 정보 업데이트에 실패했습니다.';
            setError(errorMessage);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center mt-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">사용자 권한 관리</h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                    사용자 추가
                </button>
            </div>

            {error && (
                <div className="mb-2 bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs">
                    {error}
                </div>
            )}

            <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr className="text-xs">
                            <th className="w-[30%] px-3 py-2 text-center font-semibold border-b">아이디</th>
                            <th className="w-[25%] px-3 py-2 text-center font-semibold border-b">이름</th>
                            <th className="w-[25%] px-3 py-2 text-center font-semibold border-b">역할</th>
                            <th className="w-[20%] px-3 py-2 text-center font-semibold border-b">작업</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs bg-white">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                                <td className="w-[30%] px-3 py-2 text-center border-b">{user.username}</td>
                                <td className="w-[25%] px-3 py-2 text-center border-b">{user.handler_name}</td>
                                <td className="w-[25%] px-3 py-2 text-center border-b">
                                    <div className="relative inline-block text-left">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center items-center px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                                        >
                                            {user.role}
                                            <svg className="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        {openDropdown === user.id && (
                                            <div className="absolute right-0 mt-1 w-32 rounded shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                <div className="py-1">
                                                    {roleOptions.map(role => (
                                                        <button
                                                            key={role}
                                                            className={`
                                                                ${user.role === role ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} 
                                                                w-full text-left px-2 py-1 text-xs hover:bg-gray-100
                                                            `}
                                                            onClick={() => handleRoleChange(user.id, role)}
                                                        >
                                                            {role}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="w-[20%] px-3 py-2 text-center border-b">
                                    <button 
                                        onClick={() => handleUpdate(user)}
                                        disabled={!user.isModified}
                                        className={`
                                            px-2 py-0.5 rounded text-xs
                                            ${user.isModified 
                                                ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-1 focus:ring-blue-500' 
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                                            focus:outline-none
                                        `}
                                    >
                                        수정
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AddUserModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchUsers}
            />
        </div>
    );
}

export default UserManagement;