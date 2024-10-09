import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
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
                    <Form.Group className="mb-3">
                        <Form.Label>제조사</Form.Label>
                        <Form.Control
                            type="text"
                            name="manufacturer"
                            value={formData.manufacturer}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>품목 이름</Form.Label>
                        <Form.Control
                            type="text"
                            name="item_name"
                            value={formData.item_name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>품목 뒷부호</Form.Label>
                        <Form.Control
                            type="text"
                            name="item_subname"
                            value={formData.item_subname}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>날짜</Form.Label>
                        <Form.Control
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>공급업체</Form.Label>
                        <Form.Control
                            type="text"
                            name="supplier"
                            value={formData.supplier}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>총 수량</Form.Label>
                        <Form.Control
                            type="number"
                            name="total_quantity"
                            value={formData.total_quantity}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>담당자</Form.Label>
                        <Form.Control
                            type="text"
                            name="handler_name"
                            value={formData.handler_name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>창고명</Form.Label>
                        <Form.Control
                            type="text"
                            name="warehouse_name"
                            value={formData.warehouse_name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>설명</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? '처리 중...' : '입고 등록'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default InboundForm;