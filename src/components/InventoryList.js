import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function InventoryList() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/inventory`);
            setInventory(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setError('재고 목록을 불러오는 데 실패했습니다. 나중에 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleOutbound = (itemId) => {
        navigate(`/outbound/${itemId}`);
    };

    const handleInbound = () => {
        navigate('/inbound');
    };

    if (loading) {
        return (
          <div className="text-center mt-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        );
    }
    
    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div>
            <Row className="align-items-center mb-4">
                <Col>
                    <h2 className="mb-0">재고 목록</h2>
                </Col>
                <Col xs="auto">
                    <Button variant="success" onClick={handleInbound}>
                        입고 등록
                    </Button>
                </Col>
            </Row>
            <Row xs={1} md={2} lg={3} className="g-4">
                {inventory.map((item) => (
                    <Col key={item.id}>
                        <Card className="h-100">
                            <Card.Body>
                                <Card.Title>{item.item_name} <span style={{ fontSize: '0.7em' }}>{item.item_subname}</span></Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">{item.manufacturer}</Card.Subtitle>
                                <Card.Text className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="text-start">
                                        <strong>수량:</strong> {item.current_quantity || 0}
                                    </span>
                                    <span className="text-center">
                                        <strong>창고:</strong> {item.warehouse_name || '모름'}
                                    </span>
                                    <Button variant="primary" size="sm" onClick={() => handleOutbound(item.id)}>
                                        출고
                                    </Button>
                                </Card.Text>
                                <Card.Text>
                                    <strong>비고:</strong> {item.description || '없음'}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default InventoryList;