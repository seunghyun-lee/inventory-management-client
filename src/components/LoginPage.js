import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function LoginPage({ onLogin }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/users/login`, formData);
            onLogin(response.data);
            navigate('/');
        } catch (error) {
            if (error.response && error.response.status === 403) {
                setError('권한이 없어서 로그인이 불가능합니다.');
            } else {
                setError('로그인 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }
        }
    };

    return (
        <div className="fixed inset-0 flex flex-col bg-gray-50">
            
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-sm">
                    <h1 className="text-xl sm:text-2xl font-bold text-center mb-4">
                        대광베어링 재고 관리
                    </h1>

                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="px-4 py-2 border-b">
                            <h2 className="text-lg sm:text-xl font-bold text-center">로그인</h2>
                        </div>

                        <div className="p-4">
                            {error && (
                                <div className="mb-3 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="아이디"
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />

                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="비밀번호"
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />

                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    로그인
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="mt-3 space-y-1 text-center text-sm">
                        <Link 
                            to="/signup" 
                            className="block text-blue-500 hover:text-blue-600"
                        >
                            회원가입
                        </Link>
                        <Link 
                            to="/reset-password"
                            className="block text-blue-500 hover:text-blue-600"
                        >
                            비밀번호 재설정
                        </Link>
                    </div>
                </div>
            </div>

            <div className="p-3 text-center">
                <a 
                    href="https://drive.google.com/file/d/137fVRmzp73IHaJA83is7J3pgKkgeNXZa/view?usp=sharing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 text-sm"
                >
                    앱 다운로드
                </a>
            </div>
        </div>
    );
}

export default LoginPage;