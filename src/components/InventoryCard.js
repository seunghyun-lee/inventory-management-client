import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const InventoryCard = ({ item }) => {
    const navigate = useNavigate();

    const handleOutbound = () => {
        navigate('/outbound', { state: {item} });
    };
    
    return (
        <Card className='mb-3'>
            <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Card.Text>
                    제조사: {item.manufacturer}<br />
                    수량: {item.quantiry}<br />
                    박스: {item.boxes}
                </Card.Text>
                <Button
                    variant='primary'
                    className='position-absolute buttom-0 end-0 m-3'
                    onClick={handleOutbound}
                    >
                    출고
                </Button>
            </Card.Body>
        </Card>
    );
};

export default InventoryCard;