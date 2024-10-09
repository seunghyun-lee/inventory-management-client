import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';

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
        <Card className='mt-5'>
            <Card.Header as='h2'>로그인</Card.Header>
            <Card.Body>
                {error && <Alert variant='danger'>{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>사용자명</Form.Label>
                        <Form.Control
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>비밀번호</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        로그인
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default LoginPage;