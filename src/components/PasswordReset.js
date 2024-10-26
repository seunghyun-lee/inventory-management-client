import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function PasswordReset() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_BASE_URL}/api/users/reset-password`, { email });
            setMessage(response.data.message);
            setError('');
        } catch (error) {
            setError(error.response?.data?.message || '오류가 발생했습니다.');
            setMessage('');
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="fixed inset-0 flex flex-col bg-gray-50">
            
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
                                        이메일
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="가입시 등록한 이메일을 입력하세요"
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    비밀번호 재설정 링크 받기
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PasswordReset;