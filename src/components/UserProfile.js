import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const readonlyStyle = {
    backgroundColor: '#f8f9fa',  // 옅은 회색 배경
    color: '#6c757d'  // 약간 어두운 텍스트 색상
};

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
        <Card>
            <Card.Header as="h2">사용자 정보</Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>사용자 ID</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={user.username} 
                            readOnly 
                            style={readonlyStyle}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>이름</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={user.handler_name} 
                            onChange={(e) => setUser({...user, handler_name: e.target.value})}
                            readOnly={!editMode}
                            style={readonlyStyle}
                        />
                    </Form.Group>
                    {editMode && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>현재 비밀번호</Form.Label>
                                <Form.Control 
                                    type="password" 
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>새 비밀번호</Form.Label>
                                <Form.Control 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="변경하지 않으려면 비워두세요"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>새 비밀번호 확인</Form.Label>
                                <Form.Control 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </Form.Group>
                        </>
                    )}
                    {editMode ? (
                        <Button variant="primary" onClick={handleSave}>저장</Button>
                      ) : (
                        <Button variant="secondary" onClick={handleEdit}>수정</Button>
                    )}
                </Form>
                <Button variant="danger" className="mt-3" onClick={handleLogout}>로그아웃</Button>
            </Card.Body>
        </Card>
      );
}

export default UserProfile;