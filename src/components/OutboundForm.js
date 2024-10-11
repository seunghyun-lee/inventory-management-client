import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Form, Row, Col, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const readonlyStyle = {
    backgroundColor: '#f8f9fa',  // 옅은 회색 배경
    color: '#6c757d'  // 약간 어두운 텍스트 색상
};

function OutboundForm() {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        client: '',
        total_quantity: '',
        handler_name: '',
        description: '',
        warehouse_name: '',
        warehouse_shelf: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchItemDetails = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/inventory/${itemId}`);
            setItem(response.data);
            setFormData(prevData => ({
                ...prevData,
                warehouse_name: response.data.warehouse_name || '',
                warehouse_shelf: response.data.warehouse_shelf || ''
            }));
        } catch (error) {
            console.error('Error fetching item details:', error);
            setError('품목 정보를 불러오는데 실패했습니다. 나중에 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    }, [itemId]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setFormData(prevData => ({
            ...prevData,
            handler_name: user ? user.handler_name : ''
        }));
        fetchItemDetails();
    }, [fetchItemDetails]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await axios.post(`${API_BASE_URL}/api/transactions/outbound`, {
                item_id: parseInt(itemId, 10),
                ...formData,
                total_quantity: parseInt(formData.total_quantity, 10)
            });
            navigate('/');
        } catch (error) {
            console.error('출고 처리 중 오류 발생:', error);
            if (error.response && error.response.data) {
                setError(`출고 처리 중 오류 발생: ${error.response.data.error}`);
            } else {
                setError('출고 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Spinner animation='border' />;
    }

    if (error) {
        return <Alert variant='dnager'>{error}</Alert>
    }

    if (!item) {
        return <Alert variant='warning'>품목을 찾을 수 없습니다.</Alert>
    }

    return (
        <Card>
            <Card.Header as='h2'>출고 등록</Card.Header>
            <Card.Body>
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
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>거래처</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control 
                                type='text' 
                                name='client'
                                value={formData.client}
                                onChange={handleChange}
                                required
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>물품명</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control 
                                type='text' 
                                value={item.item_name} 
                                readOnly
                                style={readonlyStyle}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>재고수량</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control 
                                type='text' 
                                value={item.current_quantity} 
                                readOnly 
                                style={readonlyStyle}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>출고수량</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control 
                                type="number" 
                                name="total_quantity"
                                value={formData.total_quantity} 
                                onChange={handleChange}
                                min="1"
                                max={item.current_quantity}
                                required 
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>뒷부호</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control 
                                type='text' 
                                value={item.item_subname} 
                                readOnly 
                                style={readonlyStyle}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>메이커</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control 
                                type='text' 
                                value={item.manufacturer} 
                                readOnly 
                                style={readonlyStyle}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>창고</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control
                                type="text"
                                name="warehouse_name"
                                value={formData.warehouse_name}
                                readOnly 
                                style={readonlyStyle}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3 align-items-center">
                        <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>위치</Form.Label>
                        <Col xs={9} sm={9} md={10}>
                            <Form.Control
                                type="text"
                                name="warehouse_shelf"
                                value={formData.warehouse_shelf}
                                readOnly 
                                style={readonlyStyle}
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
                            <Button variant='primary' type='submit' disabled={submitting}>
                            {submitting ? '저리 중...' : '출고 등록'}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default OutboundForm;