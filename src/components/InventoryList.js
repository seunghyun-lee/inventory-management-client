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

    const handleDelete = async (itemId) => {
        if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`${API_BASE_URL}/api/inventory/${itemId}`);
                setInventory(inventory.filter(item => item.id !== itemId));
                setError(null); // 성공 시 에러 메시지 초기화
            } catch (error) {
                console.error('Error deleting item:', error);
                setError(error.response?.data?.error || '항목 삭제에 실패했습니다.');
            }
        }
    };

    const handleExcelDownload = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/export-excel`, {
                responseType: 'blob', // 중요: 응답을 blob으로 받습니다.
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'inventory_report.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading Excel file:', error);
            setError('Excel 파일 다운로드에 실패했습니다.');
        }
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
        <div style={{ paddingTop: '60px' }}>
            <Row className="align-items-center mb-4">
                <Col>
                    <h2 className="mb-0">재고 목록</h2>
                </Col>
                <Col xs="auto">
                    <Button variant="info" onClick={handleExcelDownload} className="me-2">
                        Excel 다운로드
                    </Button>
                    <Button variant="success" onClick={handleInbound}>
                        입고 등록
                    </Button>
                </Col>
            </Row>
            <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                <Row xs={1} md={2} lg={3} className="g-4" style={{ margin: 0 }}>
                    {inventory.map((item) => (
                        <Col key={item.id} className="p-2">
                            <Card className="h-100">
                                <Card.Body>
                                    <Card.Title><strong>물품명:</strong> {item.item_name} <span style={{ fontSize: '0.7em' }}>{item.item_subname}</span></Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted"><strong>메이커:</strong> {item.manufacturer}</Card.Subtitle>
                                    <Card.Text className="d-flex justify-content-between align-items-center mb-3">
                                        <span className="text-start">
                                            <strong>수량:</strong> {item.current_quantity || 0}
                                        </span>
                                        <span className="text-center">
                                            <strong>창고:</strong> {item.warehouse_name || '모름'}
                                        </span>
                                        <span className="text-center">
                                            <strong>위치:</strong> {item.warehouse_shelf || '모름'}
                                        </span>
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>비고:</strong> {item.description || '없음'}
                                    </Card.Text>
                                    <div className="d-flex justify-content-between mt-3">
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                                            삭제
                                        </Button>
                                        <Button variant="primary" size="sm" onClick={() => handleOutbound(item.id)}>
                                            출고
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>            
        </div>
    );
}

export default InventoryList;