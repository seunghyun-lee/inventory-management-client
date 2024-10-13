import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function InboundHistory() {
    const [inboundHistory, setInboundHistory] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInboundHistory();
    }, []);

    const fetchInboundHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/inbound-history`);
            setInboundHistory(response.data);
        } catch (error) {
            console.log('입고 이력을 불러오는데 실패했습니다.');
            setError('입고 이력을 불러오는데 실패했습니다. 나중에 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className='mt-5 text-center'>
                <Spinner animation='border' role='status'>
                    <span className='visually-hidden'>로딩 중...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className='mt-5'>
                <Alert variant='danger'>{error}</Alert>
            </Container>
        );
    }

    return (
        <div style={{ paddingTop: '30px' }}>
            <Container className='mt-4'>
                <Card className='shadow-sm'>
                    <Card.Header as="h5" className='text-center bg-primary text-white py-1'>입고 이력</Card.Header>
                    <Card.Body>
                        {/* 전체 좌우 스크롤 가능 영역 */}
                        <div style={{ overflowX: 'auto' }}>
                            {/* 고정된 헤더 영역 */}
                            <div style={{ minWidth: '1200px' }}>
                                <Row className="bg-light font-weight-bold text-center py-2">
                                    <Col>입고날짜</Col>
                                    <Col>공급업체</Col>
                                    <Col>물품명</Col>
                                    <Col>수량</Col>
                                    <Col>뒷부호</Col>
                                    <Col>메이커</Col>
                                    <Col>창고</Col>
                                    <Col>위치</Col>
                                    <Col>메모</Col>
                                    <Col>담당자</Col>
                                </Row>
                                {/* 상하 스크롤 가능한 데이터 영역 */}
                                <div style={{ overflowY: 'auto', overflowX: 'hidden', maxHeight: '400px' }}>
                                    {inboundHistory.map((item, index) => (
                                        <Row key={index} className="text-center align-items-center py-2 border-bottom">
                                            <Col>{item.date}</Col>
                                            <Col>{item.supplier}</Col>
                                            <Col>{item.item_name}</Col>
                                            <Col>{item.total_quantity}</Col>
                                            <Col>{item.item_subname}</Col>
                                            <Col>{item.manufacturer}</Col>
                                            <Col>{item.warehouse_name}</Col>
                                            <Col>{item.warehouse_shelf}</Col>
                                            <Col>{item.description}</Col>
                                            <Col>{item.handler_name}</Col>
                                        </Row>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default InboundHistory;