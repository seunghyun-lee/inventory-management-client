import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function SignupPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        handler_name: '',
        email: ''
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

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

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!validateEmail(formData.email)) {
            setError('올바른 이메일 형식이 아닙니다.');
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/api/users/signup`, formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setError('회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
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
                    <h1 className="flex-1 text-center text-lg font-medium">회원가입</h1>
                    <div className="w-6"></div>
                </div>
            </nav>

            {/* 메인 컨텐츠 */}
            <div className="flex-1 overflow-auto px-4 py-4">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg shadow-lg">
                        <div className="p-4">
                            {error && (
                                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded text-sm">
                                    회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                        비밀번호
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
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
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    회원가입
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-600 space-y-1">
                        <p>회원가입 후 관리자에게 '직원' 권한 설정을 요청하세요.</p>
                        <p>권한 설정 완료후 사용 가능하십니다.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;