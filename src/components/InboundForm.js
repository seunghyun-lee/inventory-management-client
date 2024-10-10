import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Row, Col, Button, Card, Alert, Dropdown } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const readonlyStyle = {
    backgroundColor: '#f8f9fa',  // 옅은 회색 배경
    color: '#6c757d'  // 약간 어두운 텍스트 색상
};

function InboundForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        manufacturer: '',
        item_name: '',
        item_subname: '',
        date: '',
        supplier: '',        
        total_quantity: '',
        handler_name: '',
        warehouse_name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [manufacturers, setManufacturers] = useState([]);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const user = JSON.parse(localStorage.getItem('user'));
        setFormData(prevData => ({
            ...prevData,
            date: today,
            handler_name: user ? user.handler_name : ''
        }));
        fetchManufacturers();
    }, []);

    const fetchManufacturers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/manufacturers`);
            setManufacturers(response.data);
        } catch (error) {
            console.error('Error fetching manufacturers:', error);
            setError('제조사 목록을 불러오는데 실패했습니다.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleManufacturerSelect = (manufacturer) => {
        setFormData(prevData => ({
            ...prevData,
            manufacturer: manufacturer
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post(`${API_BASE_URL}/api/transactions/inbound`, formData);
            navigate('/');
        } catch (error) {
            console.error('입고 처리 중 오류 발생:', error.response ? error.response.data : error.message);
            setError('입고 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <Card.Header as="h2">입고 등록</Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>날짜</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>공급업체</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control
                                type="text"
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleChange}
                                required
                            />
                        </Col>                        
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>물품명</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control
                                type="text"
                                name="item_name"
                                value={formData.item_name}
                                onChange={handleChange}
                                required
                            />
                        </Col>                        
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>수량</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control
                                type="number"
                                name="total_quantity"
                                value={formData.total_quantity}
                                onChange={handleChange}
                                required
                            />
                        </Col>                        
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>뒷부호</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control
                                type="text"
                                name="item_subname"
                                value={formData.item_subname}
                                onChange={handleChange}
                            />
                        </Col>                        
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>메이커</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Dropdown>
                                <Dropdown.Toggle variant="outline-secondary" id="dropdown-manufacturer">
                                    {formData.manufacturer || "선택해주세요"}
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    {manufacturers.map((m) => (
                                        <Dropdown.Item 
                                            key={m.id} 
                                            onClick={() => handleManufacturerSelect(m.manufacturer)}
                                        >
                                            {m.manufacturer}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>                        
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>창고명</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control
                                type="text"
                                name="warehouse_name"
                                value={formData.warehouse_name}
                                onChange={handleChange}
                                required
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>메모</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>담당자</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control
                                type="text"
                                name="handler_name"
                                value={formData.handler_name}
                                onChange={handleChange}
                                required
                                readOnly
                                style={readonlyStyle}
                            />
                        </Col>
                    </Form.Group>
                    <Row className="justify-content-center mt-4">
                        <Col xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
                            <Button variant="primary" type="submit"  disabled={loading}>
                            {loading ? '처리 중...' : '입고 등록'}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default InboundForm;