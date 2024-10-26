import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const roleOptions = ['관리자', '직원', '퇴사', '대기'];

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);

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
        } catch (error) {
            console.error('Error updating user:', error);
            setError('사용자 정보 업데이트에 실패했습니다.');
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
        <div className="max-w-full">
            <div className="px-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">사용자 권한 관리</h2>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-6 py-3 text-center font-semibold border-b">아이디</th>
                                    <th className="px-6 py-3 text-center font-semibold border-b">이름</th>
                                    <th className="px-6 py-3 text-center font-semibold border-b">역할</th>
                                    <th className="px-6 py-3 text-center font-semibold border-b">작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-center border-b">{user.username}</td>
                                        <td className="px-6 py-3 text-center border-b">{user.handler_name}</td>
                                        <td className="px-6 py-3 text-center border-b">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    type="button"
                                                    className="inline-flex justify-center items-center px-4 py-2 border rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                                                >
                                                    {user.role}
                                                    <svg className="ml-2 -mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                                {openDropdown === user.id && (
                                                    <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                        <div className="py-1">
                                                            {roleOptions.map(role => (
                                                                <button
                                                                    key={role}
                                                                    className={`
                                                                        ${user.role === role ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} 
                                                                        w-full text-left px-4 py-2 text-sm hover:bg-gray-100
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
                                        <td className="px-6 py-3 text-center border-b">
                                            <button 
                                                onClick={() => handleUpdate(user)}
                                                disabled={!user.isModified}
                                                className={`
                                                    px-3 py-1 rounded text-sm
                                                    ${user.isModified 
                                                        ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-2 focus:ring-blue-500' 
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
                </div>
            </div>
        </div>
    );
}

export default UserManagement;