import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Row, Col, Button, Card, Alert, Dropdown } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const readonlyStyle = {
    backgroundColor: '#f8f9fa',  // 옅은 회색 배경
    color: '#6c757d'  // 약간 어두운 텍스트 색상
};

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
        warehouse_shelf: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [manufacturers, setManufacturers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [shelfs, setShelfs] = useState([]);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const user = JSON.parse(localStorage.getItem('user'));
        setFormData(prevData => ({
            ...prevData,
            date: today,
            handler_name: user ? user.handler_name : ''
        }));
        fetchManufacturers();
        fetchWarehouses();
        fetchShelfs();
    }, []);

    const fetchManufacturers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/manufacturers`);
            const manufacturersData = response.data.data || response.data;
            if (Array.isArray(manufacturersData)) {
                setManufacturers(manufacturersData);
            } else {
                console.error('Unexpected manufacturers data structure:', manufacturersData);
                setError('제조사 데이터 구조가 예상과 다릅니다.');
                setManufacturers([]);
            }
        } catch (error) {
            console.error('Error fetching manufacturers:', error);
            setError('제조사 목록을 불러오는데 실패했습니다.');
            setManufacturers([]);
        }
    };

    const fetchWarehouses = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/warehouses`);
            const warehousesData = response.data.data || response.data;
            if (Array.isArray(warehousesData)) {
                setWarehouses(warehousesData);
            } else {
                console.error('Unexpected warehouses data structure:', warehousesData);
                setError('창고 데이터 구조가 예상과 다릅니다.');
                setWarehouses([]);
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            setError('창고 목록을 불러오는데 실패했습니다.');
            setWarehouses([]);
        }
    };

    const fetchShelfs = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/shelfs`);
            const shelfsData = response.data.data || response.data;
            if (Array.isArray(shelfsData)) {
                setShelfs(shelfsData);
            } else {
                console.error('Unexpected shelfs data structure:', shelfsData);
                setError('위치 데이터 구조가 예상과 다릅니다.');
                setShelfs([]);
            }
        } catch (error) {
            console.error('Error fetching shelfs:', error);
            setError('위치 목록을 불러오는데 실패했습니다.');
            setShelfs([]);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleManufacturerSelect = (manufacturer) => {
        setFormData(prevData => ({
            ...prevData,
            manufacturer: manufacturer
        }));
    };

    const handleWarehouseSelect = (warehouse) => {
        setFormData(prevData => ({
            ...prevData,
            warehouse_name: warehouse
        }));
    };

    const handleShelfSelect = (shelf) => {
        setFormData(prevData => ({
            ...prevData,
            warehouse_shelf: shelf
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const requiredFields = ['date', 'supplier', 'item_name', 'total_quantity', 'manufacturer', 'warehouse_name', 'handler_name'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            setError(`다음 필드를 입력해주세요: ${missingFields.join(', ')}`);
            setLoading(false);
            return;
        }

        const dataToSend = {
            ...formData,
            item_subname: formData.item_subname || '',
            warehouse_shelf: formData.warehouse_shelf || '',
        };

        console.log('Sending data to server:', dataToSend); // 디버깅을 위한 로그

        try {
            const response = await axios.post(`${API_BASE_URL}/api/transactions/inbound`, dataToSend);
            console.log('Server response:', response.data); // 디버깅을 위한 로그
            navigate('/');
        } catch (error) {
            console.error('입고 처리 중 오류 발생:', error.response ? error.response.data : error.message);
            setError('입고 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ paddingTop: '60px' }}>
            <Card>
                <Card.Header as="h2">입고 등록</Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group as={Row} className="mb-3 align-items-center">
                            <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>날짜</Form.Label>
                            <Col xs={9} sm={9} md={10}>
                                <Form.Control
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3 align-items-center">
                            <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>공급업체</Form.Label>
                            <Col xs={9} sm={9} md={10}>
                                <Form.Control
                                    type="text"
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleChange}
                                    required
                                />
                            </Col>                        
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3 align-items-center">
                            <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>물품명</Form.Label>
                            <Col xs={9} sm={9} md={10}>
                                <Form.Control
                                    type="text"
                                    name="item_name"
                                    value={formData.item_name}
                                    onChange={handleChange}
                                    required
                                />
                            </Col>                        
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3 align-items-center">
                            <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>수량</Form.Label>
                            <Col xs={9} sm={9} md={10}>
                                <Form.Control
                                    type="number"
                                    name="total_quantity"
                                    value={formData.total_quantity}
                                    onChange={handleChange}
                                    required
                                />
                            </Col>                        
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3 align-items-center">
                            <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>뒷부호</Form.Label>
                            <Col xs={9} sm={9} md={10}>
                                <Form.Control
                                    type="text"
                                    name="item_subname"
                                    value={formData.item_subname}
                                    onChange={handleChange}
                                />
                            </Col>                        
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3 align-items-center">
                            <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>메이커</Form.Label>
                            <Col xs={9} sm={9} md={10}>
                                <Dropdown>
                                    <Dropdown.Toggle variant="outline-secondary" id="dropdown-manufacturer">
                                        {formData.manufacturer || "선택해주세요"}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        {manufacturers.map((m) => (
                                            <Dropdown.Item 
                                                key={m.id} 
                                                onClick={() => handleManufacturerSelect(m.manufacturer)}
                                            >
                                                {m.manufacturer}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>                        
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3 align-items-center">
                            <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>창고</Form.Label>
                            <Col xs={9} sm={9} md={10}>
                                <Dropdown>
                                    <Dropdown.Toggle variant="outline-secondary" id="dropdown-warehouse">
                                        {formData.warehouse_name || "선택해주세요"}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        {Array.isArray(warehouses) && warehouses.map((m) => (
                                            <Dropdown.Item 
                                                key={m.id} 
                                                onClick={() => handleWarehouseSelect(m.warehouse)}
                                            >
                                                {m.warehouse}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3 align-items-center">
                            <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>위치</Form.Label>
                            <Col xs={9} sm={9} md={10}>
                                <Dropdown>
                                    <Dropdown.Toggle variant="outline-secondary" id="dropdown-shelf">
                                        {formData.warehouse_shelf || "선택해주세요"}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        {Array.isArray(shelfs) && shelfs.map((m) => (
                                            <Dropdown.Item 
                                                key={m.id} 
                                                onClick={() => handleShelfSelect(m.shelf)}
                                            >
                                                {m.shelf}
                                            </Dropdown.Item>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </Col>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>메모</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3 align-items-center">
                            <Form.Label column xs={3} sm={3} md={2} className="mb-2 mb-sm-0" style={{ textAlign: 'left' }}>담당자</Form.Label>
                            <Col xs={9} sm={9} md={10}>
                                <Form.Control
                                    type="text"
                                    name="handler_name"
                                    value={formData.handler_name}
                                    onChange={handleChange}
                                    required
                                    readOnly
                                    style={readonlyStyle}
                                />
                            </Col>
                        </Form.Group>
                        <Row className="justify-content-center mt-4">
                            <Col xs={12} sm={6} md={4} lg={3} className="d-flex justify-content-center">
                                <Button variant="primary" type="submit"  disabled={loading}>
                                {loading ? '처리 중...' : '입고 등록'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
        </div>        
    );
}

export default InboundForm;