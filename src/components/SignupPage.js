import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card, Alert, Container, Row, Col, Navbar } from 'react-bootstrap';

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
                    <span className="flex-grow-1 text-center" style={{ fontSize: '1.2rem' }}>회원가입</span>
                    <div style={{ width: '24px' }}></div>
                </Container>
            </Navbar>
            <Container>
                <Row className='justify-content-md-center mt-5'>
                    <Col md={6}>
                        <Card>
                            <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                                {success && <Alert variant="success">회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.</Alert>}
                                <Form onSubmit={handleSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>아이디</Form.Label>
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
                                        <Form.Label>이름</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="handler_name"
                                            value={formData.handler_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>이메일</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="email"
                                            value={formData.email}
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
                <br /><br />
                <div className="text-center mb-3">
                    <span>
                        회원가입 후 관리자에게 '직원' 권한 설정을 요청하세요. 
                        <br />
                        권한 설정 완료후 사용 가능하십니다.
                    </span>
                </div>
            </Container>
        </>        
    );
}

export default SignupPage;