import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function UserProfile({ onLogout }) {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
  }, []);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/users/${user.id}`, {
        username: user.username,
        handler_name: user.handler_name,
        password: newPassword || undefined
      });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      setEditMode(false);
      setNewPassword('');
    } catch (error) {
      setError('사용자 정보 업데이트 중 오류가 발생했습니다.');
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
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>사용자 ID</Form.Label>
            <Form.Control type="text" value={user.username} readOnly />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>이름</Form.Label>
            <Form.Control 
              type="text" 
              value={user.handler_name} 
              onChange={(e) => setUser({...user, handler_name: e.target.value})}
              readOnly={!editMode}
            />
          </Form.Group>
          {editMode && (
            <Form.Group className="mb-3">
              <Form.Label>새 비밀번호</Form.Label>
              <Form.Control 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="변경하지 않으려면 비워두세요"
              />
            </Form.Group>
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