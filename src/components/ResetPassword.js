import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }
        try {
            const response = await axios.post(`${API_BASE_URL}/api/users/reset-password/${token}`, { password });
            setMessage(response.data.message);
            setError('');
            // 비밀번호 재설정 성공 후 3초 뒤 로그인 페이지로 리다이렉트
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setError(error.response?.data?.message || '비밀번호 재설정 중 오류가 발생했습니다.');
            setMessage('');
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="fixed inset-0 flex flex-col bg-gray-50">
            {/* 헤더 */}
            <nav className="bg-white shadow-sm">
                <div className="h-16 flex items-center px-4">
                    <button
                        onClick={handleGoBack}
                        className="text-2xl text-gray-600 hover:text-gray-800 focus:outline-none"
                    >
                        &lt;
                    </button>
                    <h1 className="flex-1 text-center text-lg font-medium">비밀번호 재설정</h1>
                    <div className="w-6"></div>
                </div>
            </nav>

            {/* 메인 컨텐츠 */}
            <div className="flex-1 overflow-auto px-4 py-4">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="p-4">
                            {message && (
                                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
                                    {message}
                                </div>
                            )}
                            {error && (
                                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        새 비밀번호
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        비밀번호 확인
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    비밀번호 재설정
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;