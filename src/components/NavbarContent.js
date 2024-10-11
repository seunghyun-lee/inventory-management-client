import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons';

function NavbarContent() {
    const [expanded, setExpanded] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        setExpanded(false);
    }, [location]);

    const handleProfileClick = () => {
        navigate('/profile');
    };

    return (
        <Navbar bg="light" expand="lg" expanded={expanded}>
            <Container>
                <Navbar.Brand as={Link} to="/" onClick={() => setExpanded(false)}>대광 베어링 재고 관리</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)} />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/" onClick={() => setExpanded(false)}>재고 목록</Nav.Link>
                        {/* <Nav.Link as={Link} to="/inbound" onClick={() => setExpanded(false)}>입고 등록</Nav.Link>
                        <Nav.Link as={Link} to="/outbound" onClick={() => setExpanded(false)}>출고 등록</Nav.Link> */}
                        <Nav.Link as={Link} to="/inbound-history" onClick={() => setExpanded(false)}>입고 이력</Nav.Link>
                        <Nav.Link as={Link} to="/outbound-history" onClick={() => setExpanded(false)}>출고 이력</Nav.Link>
                        <Nav.Link as={Link} to="/manufacturers">메이커</Nav.Link>
                        <Nav.Link as={Link} to="/warehouses">창고</Nav.Link>
                        <Nav.Link as={Link} to="/shelfs">위치</Nav.Link>
                        {user.role === '관리자' && (
                            <Nav.Link as={Link} to="/user-management">사용자 관리</Nav.Link>
                        )}
                    </Nav>
                    <Nav>
                        <Nav.Link onClick={handleProfileClick}>
                            <PersonCircle size={30} /> 프로필
                        </Nav.Link>
                  </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavbarContent;