import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function SignupPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        handler_name: ''
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        try {
            await axios.post(`${API_BASE_URL}/api/users/signup`, formData);
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setError('회원가입 중 오류가 발생했습니다. 다시 시도해 주세요.');
        }
    };

    return (
        <Container>
            <Row className='justify-content-md-center mt-5'>
                <Col md={6}>
                    <Card>
                        <Card.Header as='h2'>회원가입</Card.Header>
                        <Card.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.</Alert>}
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
                                <Form.Group className="mb-3">
                                    <Form.Label>담당자 이름</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="handler_name"
                                        value={formData.handler_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit">
                                    회원가입
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default SignupPage;