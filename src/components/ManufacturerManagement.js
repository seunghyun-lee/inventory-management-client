import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Form, Button, Alert, InputGroup, Container, Row, Col } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function ManufacturerManagement() {
    const [manufacturers, setManufacturers] = useState([]);
    const [newManufacturer, setNewManufacturer] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchManufacturers();
    }, []);

    const fetchManufacturers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/manufacturers`);
            console.log('Server response:', response.data); // 디버깅을 위한 로그
            const manufacturersData = response.data.data || response.data;
            if (Array.isArray(manufacturersData)) {
                setManufacturers(manufacturersData);
            } else {
                console.error('Unexpected data structure:', manufacturersData);
                setError('제조사 데이터 구조가 예상과 다릅니다.');
                setManufacturers([]); // 빈 배열로 설정
            }
        } catch (error) {
            console.error('Error fetching manufacturers:', error);
            setError('제조사 목록을 불러오는데 실패했습니다.');
            setManufacturers([]); // 빈 배열로 설정
        }
    };

    const handleAddManufacturer = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/manufacturers`, { manufacturer: newManufacturer });
            console.log('Add manufacturer response:', response.data); // 디버깅을 위한 로그
            const newManufacturerData = response.data.data || response.data;
            setManufacturers(prevManufacturers => [...prevManufacturers, newManufacturerData]);
            setNewManufacturer('');
            setSuccess('제조사가 추가되었습니다.');
        } catch (error) {
            console.error('Error adding manufacturer:', error);
            setError('제조사 추가에 실패했습니다.');
        }
    };
    
    const handleDeleteManufacturer = async (id) => {
        setError(null);
        setSuccess(null);
        try {
            await axios.delete(`${API_BASE_URL}/api/manufacturers/${id}`);
            setManufacturers(prevManufacturers => prevManufacturers.filter(m => m.id !== id));
            setSuccess('제조사가 삭제되었습니다.');
        } catch (error) {
            console.error('Error deleting manufacturer:', error);
            setError('제조사 삭제에 실패했습니다.');
        }
    };

    return (
        <div style={{ paddingTop: '50px' }}>
            <Container>
                <Row className="mb-3">
                    <Col>
                        <h2>메이커 관리</h2>
                    </Col>
                </Row>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Row className="mb-3">
                    <Col>
                        <Form onSubmit={handleAddManufacturer}>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="새 제조사 이름"
                                    value={newManufacturer}
                                    onChange={(e) => setNewManufacturer(e.target.value)}
                                    required
                                />
                                <Button variant="primary" type="submit">
                                    추가
                                </Button>
                            </InputGroup>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Table striped bordered hover className="text-center">
                            <thead>
                                <tr>
                                    <th>제조사</th>
                                    <th>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {manufacturers.map((m) => (
                                    <tr key={m.id}>
                                        <td>{m.manufacturer}</td>
                                        <td>
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                onClick={() => handleDeleteManufacturer(m.id)}
                                            >
                                                삭제
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default ManufacturerManagement;