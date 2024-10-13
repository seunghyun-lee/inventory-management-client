import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, Alert, Navbar } from 'react-bootstrap';

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
        <>
            <Navbar bg="light" expand="lg">
                <Container fluid className="d-flex justify-content-between align-items-center">
                    <Button 
                        variant="link" 
                        onClick={handleGoBack} 
                        className="text-decoration-none text-dark" 
                        style={{ fontSize: '1.5rem' }}
                    >
                        &lt;
                    </Button>
                    <span className="flex-grow-1 text-center" style={{ fontSize: '1.2rem' }}>비밀번호 재설정</span>
                    <div style={{ width: '24px' }}></div>
                </Container>
            </Navbar>
            <Container className="mt-4">
                <Row className="justify-content-md-center">
                    <Col md={6}>
                        <Card>
                            <Card.Body>
                                {message && <Alert variant="success">{message}</Alert>}
                                {error && <Alert variant="danger">{error}</Alert>}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>새 비밀번호</Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>비밀번호 확인</Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit">
                                        비밀번호 재설정
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default ResetPassword;