import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';

function NotFound() {
    return (
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={6} className="text-center">
              <Alert variant="warning">
                <Alert.Heading>404 - 페이지를 찾을 수 없습니다</Alert.Heading>
                <p>
                  죄송합니다. 요청하신 페이지를 찾을 수 없습니다.
                  URL을 확인하시거나 홈페이지로 돌아가세요.
                </p>
              </Alert>
              <Link to="/">
                <Button variant="primary">홈페이지로 돌아가기</Button>
              </Link>
            </Col>
          </Row>
        </Container>
    );
}

export default NotFound;