import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Form, Button, Dropdown } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const roleOptions = ['관리자', '직원', '퇴사', '대기'];

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>{error}</div>;
    
    return (
        <Table striped bordered hover className="text-center">
            <thead>
                <tr>
                <th>아이디</th>
                <th>이름</th>
                <th>역할</th>
                <th>작업</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.handler_name}</td>
                    <td>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary" id={`dropdown-${user.id}`}>
                                {user.role}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                {roleOptions.map(role => (
                                <Dropdown.Item 
                                    key={role} 
                                    onClick={() => handleRoleChange(user.id, role)}
                                    active={user.role === role}
                                >
                                    {role}
                                </Dropdown.Item>
                                ))}
                            </Dropdown.Menu>
                        </Dropdown>
                    </td>
                    <td>
                        <Button
                            variant={user.isModified ? "primary" : "secondary"}
                            onClick={() => handleUpdate(user)}
                            disabled={!user.isModified}
                        >
                        수정
                        </Button>
                    </td>
                </tr>
                ))}
            </tbody>
        </Table>
    );
}

export default UserManagement;