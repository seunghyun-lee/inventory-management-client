import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function UserProfile({ onLogout }) {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
    }, []);

    const handleEdit = () => {
        setEditMode(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    const handleSave = async () => {
        setError(null);
        setSuccess(null);

        if (newPassword && newPassword !== confirmPassword) {
            setError('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await axios.put(`${API_BASE_URL}/api/users/${user.id}/profile`, {
                username: user.username,
                handler_name: user.handler_name,
                email: user.email,
                currentPassword: currentPassword,
                newPassword: newPassword || undefined
            });
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            setEditMode(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setSuccess('사용자 정보가 성공적으로 업데이트 되었습니다.');
        } catch (error) {
            setError(error.response?.data?.error || '사용자 정보 업데이트 중 오류가 발생했습니다.');
        }
    };

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="max-w-full">
            <div className="px-4">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b">
                        <h2 className="text-2xl font-bold">사용자 정보</h2>
                    </div>
                    
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                                {success}
                            </div>
                        )}

                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    사용자 ID
                                </label>
                                <input
                                    type="text"
                                    value={user.username}
                                    readOnly
                                    className="w-full px-3 py-2 bg-gray-50 text-gray-600 border rounded focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    이름
                                </label>
                                <input
                                    type="text"
                                    value={user.handler_name}
                                    onChange={(e) => setUser({...user, handler_name: e.target.value})}
                                    readOnly
                                    className="w-full px-3 py-2 bg-gray-50 text-gray-600 border rounded focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    이메일
                                </label>
                                <input
                                    type="email"
                                    value={user.email}
                                    onChange={(e) => setUser({...user, email: e.target.value})}
                                    readOnly={!editMode}
                                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${!editMode ? 'bg-gray-50 text-gray-600' : 'bg-white'}`}
                                />
                            </div>

                            {editMode && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            현재 비밀번호
                                        </label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            새 비밀번호
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="변경하지 않으려면 비워두세요"
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            새 비밀번호 확인
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-2">
                                {editMode ? (
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        패스워드 저장
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleEdit}
                                        className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                    >
                                        패스워드 수정
                                    </button>
                                )}
                                
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    로그아웃
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfile;