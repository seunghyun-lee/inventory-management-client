import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';

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
        <Container>
            <Row className="justify-content-md-center mt-5">
                <Col md={6} className="text-center">
                    <h1 className="mb-5">대광베어링 재고 관리</h1>
                    <Card>
                        <Card.Header as='h2'>로그인</Card.Header>
                        <Card.Body>
                            {error && <Alert variant='danger'>{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="아이디"
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="비밀번호"
                                        required
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    로그인
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    <div className="mt-3">
                        <Link to="/signup">회원가입</Link>
                        <br />
                        <Link to="/reset-password">비밀번호 재설정</Link>
                    </div>
                </Col>
            </Row>
        </Container>
        
    );
}

export default LoginPage;