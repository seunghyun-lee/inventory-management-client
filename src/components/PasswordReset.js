import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, Alert, Navbar } from 'react-bootstrap';
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
                                        <Form.Label>이메일</Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="가입시 등록한 이메일을 입력하세요"
                                        />
                                    </Form.Group>
                                    <Button variant="primary" type="submit">
                                        비밀번호 재설정 링크 받기
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

export default PasswordReset;