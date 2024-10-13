import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card, Container, Row, Col, Spinner, Alert, Form, Button } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function InboundHistory() {
    const [inboundHistory, setInboundHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(getSixMonthsAgo());
    const [endDate, setEndDate] = useState(getToday());

    const fetchInboundHistory = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/inbound-history`, {
                params: { startDate, endDate }
            });
            setInboundHistory(response.data);
        } catch (error) {
            console.error('입고 이력을 불러오는데 실패했습니다:', error);
            setError('입고 이력을 불러오는데 실패했습니다. 나중에 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchInboundHistory();
    }, [fetchInboundHistory]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInboundHistory();
    };

    function getToday() {
        return new Date().toISOString().split('T')[0];
    }

    function getSixMonthsAgo() {
        const date = new Date();
        date.setMonth(date.getMonth() - 6);
        return date.toISOString().split('T')[0];
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit'
        }).replace(/\.\s?/g, '-').slice(0, -1);
    }

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
                <Row className="mb-3">
                    <Col>
                        <h2>입고 이력</h2>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Form onSubmit={handleSearch} className="mb-4">
                            <Row className="g-2 align-items-center">
                                <Col xs={5} style={{ paddingRight: '5px' }}>
                                    <Form.Control
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        aria-label="시작 날짜"
                                        style={{ fontSize: '0.9rem', padding: '0.25rem' }}
                                    />
                                </Col>
                                <Col xs={5} style={{ paddingLeft: '5px', paddingRight: '5px' }}>
                                    <Form.Control
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        aria-label="마지막 날짜"
                                        style={{ fontSize: '0.9rem', padding: '0.25rem' }}
                                    />
                                </Col>
                                <Col xs={2} style={{ paddingLeft: '5px' }}>
                                    <Button 
                                        variant="primary" 
                                        type="submit" 
                                        className="w-100"
                                        style={{ fontSize: '0.8rem', padding: '0.25rem' }}
                                    >
                                        검색
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
                <Card className='shadow-sm'>
                    <Card.Body>
                        
                        <div style={{ overflowX: 'auto' }}>
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
                                <div style={{ overflowY: 'auto', overflowX: 'hidden', maxHeight: '400px' }}>
                                    {inboundHistory.map((item, index) => (
                                        <Row key={index} className="text-center align-items-center py-2 border-bottom">
                                            <Col>{formatDate(item.date)}</Col>
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