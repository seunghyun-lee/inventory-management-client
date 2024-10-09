import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import InventoryList from './components/InventoryList';
import InboundForm from './components/InboundForm';
import OutboundForm from './components/OutboundForm';
import InboundHistory from './components/InboundHistory';
import OutboundHistory from './components/OutboundHistory';
import LoginPage from './components/LoginPage';
import UserProfile from './components/UserProfile';
import NavbarContent from './components/NavbarContent';

function PrivateRoute({ children }) {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? children : <Navigate to="/login" />;
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setIsLoggedIn(!!user);
    }, []);

    const handleLogin = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
    };

    return (
        <Router>
            <div>
                {isLoggedIn && <NavbarContent />}
                <Container className="mt-4">
                    <Routes>
                        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                        <Route path="/" element={<PrivateRoute><InventoryList /></PrivateRoute>} />
                        <Route path="/inbound" element={<PrivateRoute><InboundForm /></PrivateRoute>} />
                        <Route path="/outbound/:itemId?" element={<PrivateRoute><OutboundForm /></PrivateRoute>} />
                        <Route path="/inbound-history" element={<PrivateRoute><InboundHistory /></PrivateRoute>} />
                        <Route path="/outbound-history" element={<PrivateRoute><OutboundHistory /></PrivateRoute>} />
                        <Route path="/profile" element={<PrivateRoute><UserProfile onLogout={handleLogout} /></PrivateRoute>} />
                    </Routes>
                </Container>
            </div>
        </Router>
    );
}

export default App;