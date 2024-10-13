import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Form, Button, Alert, InputGroup, Container, Row, Col } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function ShelfManagement() {
    const [shelfs, setShelfs] = useState([]);
    const [newShelf, setNewShelf] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchShelfs();
    }, []);

    const fetchShelfs = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/shelfs`);
            const shelfData = response.data.data || response.data;
            if (Array.isArray(shelfData)) {
                setShelfs(response.data);
            } else {
                console.error('Unexpected data structure:', shelfData);
                setError('위치 데이터 구조가 예상과 다릅니다.');
            }
        } catch (error) {
            console.error('Error fetching shelfs:', error);
            setError('위치 목록을 불러오는데 실패했습니다.');
        }
    };

    const handleAddShelf = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/shelfs`, { shelf: newShelf });
            const newShelfData = response.data.data || response.data;
            setShelfs(prevShelfs => [...prevShelfs, newShelfData]);
            setNewShelf('');
            setSuccess('위치가 추가되었습니다.');
        } catch (error) {
            console.error('Error adding shelf:', error);
            setError('위치 추가에 실패했습니다.');
        }
    };
    
    const handleDeleteShelf = async (id) => {
        setError(null);
        setSuccess(null);
        try {
            await axios.delete(`${API_BASE_URL}/api/shelfs/${id}`);
            setShelfs(prevShelfs => prevShelfs.filter(m => m.id !== id));
            setSuccess('위치가 삭제되었습니다.');
        } catch (error) {
            console.error('Error deleting shelf:', error);
            setError('위치 삭제에 실패했습니다.');
        }
    };

    return (
        <div style={{ paddingTop: '50px' }}>
            <Container>
                <Row className="mb-3">
                    <Col>
                        <h2>위치 관리</h2>
                    </Col>
                </Row>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Row className="mb-3">
                    <Col>
                        <Form onSubmit={handleAddShelf}>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="새 위치 이름"
                                    value={newShelf}
                                    onChange={(e) => setNewShelf(e.target.value)}
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
                                    <th>위치</th>
                                    <th>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shelfs.map((m) => (
                                    <tr key={m.id}>
                                        <td>{m.shelf}</td>
                                        <td>
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                onClick={() => handleDeleteShelf(m.id)}
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

export default ShelfManagement;