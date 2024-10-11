import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Form, Button, Alert, InputGroup, Container, Row, Col } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function WarehouseManagement() {
    const [warehouses, setWarehouses] = useState([]);
    const [newWarehouse, setNewWarehouse] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/warehouses`);
            setWarehouses(response.data);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            setError('창고 목록을 불러오는데 실패했습니다.');
        }
    };

    const handleAddWarehouse = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/warehouses`, { warehouse: newWarehouse });
            setWarehouses([...warehouses, response.data]);
            setNewWarehouse('');
            setSuccess('창고가 추가되었습니다.');
        } catch (error) {
            console.error('Error adding warehouse:', error);
            setError('창고 추가에 실패했습니다.');
        }
    };
    
    const handleDeleteWarehouse = async (id) => {
        setError(null);
        setSuccess(null);
        try {
            await axios.delete(`${API_BASE_URL}/api/warehouses/${id}`);
            setWarehouses(warehouses.filter(m => m.id !== id));
            setSuccess('창고가 삭제되었습니다.');
        } catch (error) {
            console.error('Error deleting warehouse:', error);
            setError('창고 삭제에 실패했습니다.');
        }
    };

    return (
        <Container>
            <Row className="mb-3">
                <Col>
                    <h2>창고 관리</h2>
                </Col>
            </Row>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Row className="mb-3">
                <Col>
                    <Form onSubmit={handleAddWarehouse}>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="새 창고 이름"
                                value={newWarehouse}
                                onChange={(e) => setNewWarehouse(e.target.value)}
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
                                <th>창고</th>
                                <th>작업</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.map((m) => (
                                <tr key={m.id}>
                                    <td>{m.warehouse}</td>
                                    <td>
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => handleDeleteWarehouse(m.id)}
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
    );
}

export default WarehouseManagement;