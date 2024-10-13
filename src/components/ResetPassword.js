import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function ResetPassword() {
    const { token } = useParams();
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
        } catch (error) {
            setError(error.response?.data?.message || '비밀번호 재설정 중 오류가 발생했습니다.');
            setMessage('');
        }
    };

    return (
        <div>
            <h2>비밀번호 재설정</h2>
            {message && <p style={{color: 'green'}}>{message}</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>새 비밀번호:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>비밀번호 확인:</label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit">비밀번호 재설정</button>
            </form>
        </div>
    );
}

export default ResetPassword;