import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function OutboundHistory() {
    const [outboundHistory, setOutboundHistory] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOutboundHistory();
    }, []);

    const fetchOutboundHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/outbound-history`);
            setOutboundHistory(response.data);
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
        <Container className='mt-4'>
            <Row>
               <Col>
                    <Card className='shadow-sm'>
                        <Card.Header as="h2" className='text-center bg-primary text-white py-3'>출고 이력</Card.Header>
                        <Card.Body>
                            <Table striped bordered hover responsive className="text-center">
                                <thead className='bg-light'>
                                    <tr>
                                        <th>출고날짜</th>
                                        <th>납품업체</th>
                                        <th>품목 이름</th>
                                        <th>품목 뒷번호</th>
                                        <th>제조사</th>
                                        <th>수량</th>
                                        <th>담당자</th>
                                        <th>창고</th>
                                        <th>비고</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {outboundHistory.map((item, index) => (
                                        <tr key={index}>
                                        <td>{item.date}</td>
                                        <td>{item.client}</td>
                                        <td>{item.item_name}</td>
                                        <td>{item.item_subname}</td>
                                        <td>{item.manufacturer}</td>
                                        <td>{item.total_quantity}</td>
                                        <td>{item.handler_name}</td>
                                        <td>{item.warehouse_name}</td>
                                        <td>{item.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
               </Col> 
            </Row>
        </Container>
    );
}

export default OutboundHistory;