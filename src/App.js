import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
// import { Container } from 'react-bootstrap';
import InventoryList from './components/InventoryList';
import InboundForm from './components/InboundForm';
import OutboundForm from './components/OutboundForm';
import InboundHistory from './components/InboundHistory';
import OutboundHistory from './components/OutboundHistory';
import UserManagement from './components/UserManagement';
import ManufacturerManagement from './components/ManufacturerManagement';
import WarehouseManagement from './components/WarehouseManagement';
import ShelfManagement from './components/ShelfManagement';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import UserProfile from './components/UserProfile';
import NavbarContent from './components/NavbarContent';
import PasswordReset from './components/PasswordReset';
import ResetPassword from './components/ResetPassword';
import NotFound from './components/NotFound';
import CalendarComponent from './components/CalendarComponent';

function PrivateRoute({ children }) {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? children : <Navigate to="/login" replace />;
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setIsLoggedIn(!!user);

        // 뒤로 가기 이벤트 리스너
        const handlePopState = (event) => {
            const privateRoutes = [
                '/', '/inbound', '/outbound', '/inbound-history', '/outbound-history',
                '/manufacturers', '/warehouses', '/shelfs', '/user-management', '/profile'
            ];

            if (!user && privateRoutes.includes(location.pathname)) {
                // 로그인하지 않은 상태에서 PrivateRoute 페이지로 이동하려는 경우 로그인 페이지로 리디렉션
                navigate('/login', { replace: true });
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [location, navigate]);

    const handleLogin = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoggedIn(true);
        navigate('/', { replace: true });
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setIsLoggedIn(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {isLoggedIn && <NavbarContent />}
            <div className="w-full px-4 pt-20 pb-8">
                <div className="max-w-screen-2xl mx-auto">
                    <Routes>
                        <Route 
                            path="/login" 
                            element={
                                isLoggedIn ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
                            } 
                        />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route path="/reset-password" element={<PasswordReset />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route path="/" element={<PrivateRoute><InventoryList /></PrivateRoute>} />
                        <Route path="/inbound" element={<PrivateRoute><InboundForm /></PrivateRoute>} />
                        <Route path="/outbound/:itemId?" element={<PrivateRoute><OutboundForm /></PrivateRoute>} />
                        <Route path="/inbound-history" element={<PrivateRoute><InboundHistory /></PrivateRoute>} />
                        <Route path="/outbound-history" element={<PrivateRoute><OutboundHistory /></PrivateRoute>} />
                        <Route path="/calendar" element={<PrivateRoute><CalendarComponent /></PrivateRoute>} />
                        <Route path="/manufacturers" element={<PrivateRoute><ManufacturerManagement /></PrivateRoute>} />
                        <Route path="/warehouses" element={<PrivateRoute><WarehouseManagement /></PrivateRoute>} />
                        <Route path="/shelfs" element={<PrivateRoute><ShelfManagement /></PrivateRoute>} />
                        <Route path="/user-management" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
                        <Route path="/profile" element={<PrivateRoute><UserProfile onLogout={handleLogout} /></PrivateRoute>} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

function AppContainer() {
    return (
        <Router>
            <App />
        </Router>
    );
}

export default AppContainer;
