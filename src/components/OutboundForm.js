import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function OutboundForm() {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [formData, setFormData] = useState({
        date: '',
        client: '',
        total_quantity: '',
        handler_name: '',
        warehouse_name: '',
        description: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchItemDetails = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/inventory/${itemId}`);
            setItem(response.data);
        } catch (error) {
            console.error('Error fetching item details:', error);
            setError('품목 정보를 불러오는데 실패했습니다. 나중에 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    }, [itemId]);

    useEffect(() => {
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
                total_quantity: parseInt(formData.total_quantity, 10),
                client: formData.client
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
                    <Form.Group className='mb-3'>
                        <Form.Label>품목 이름</Form.Label>
                        <Form.Control type='text' value={item.item_name} readOnly />
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>품목 뒷부호</Form.Label>
                        <Form.Control type='text' value={item.item_subname} readOnly />
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>제조사</Form.Label>
                        <Form.Control type='text' value={item.manufacturer} readOnly />
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>전체 재고</Form.Label>
                        <Form.Control type='text' value={item.current_quantity} readOnly />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>출고 날짜</Form.Label>
                        <Form.Control type="date" name="date" value={formData.date} onChange={handleChange} required />
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label>거래처</Form.Label>
                        <Form.Control 
                            type='text' 
                            name='client'
                            value={formData.client}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>출고 수량</Form.Label>
                        <Form.Control 
                            type="number" 
                            name="total_quantity"
                            value={formData.total_quantity} 
                            onChange={handleChange}
                            min="1"
                            max={item.current_quantity}
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
                    <Button variant='primary' type='submit' disabled={submitting}>
                        {submitting ? '저리 중...' : '출고 등록'}
                    </Button>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default OutboundForm;