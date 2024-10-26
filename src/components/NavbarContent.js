import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

    const menuItems = [
        { path: '/', label: '재고 목록' },
        { path: '/calendar', label: '달력' },
        { path: '/inbound-history', label: '입고 이력' },
        { path: '/outbound-history', label: '출고 이력' },
        { path: '/manufacturers', label: '메이커' },
        { path: '/warehouses', label: '창고' },
        { path: '/shelfs', label: '위치' },
    ];

    if (user.role === '관리자') {
        menuItems.push({ path: '/user-management', label: '사용자 관리' });
    }

    return (
        <nav className="bg-white shadow-md fixed top-0 w-full z-50">
            <div className="w-full px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" 
                              className="text-gray-800 hover:text-gray-600 px-3 py-2 text-base lg:text-xl font-bold no-underline truncate max-w-[200px]" 
                              onClick={() => setExpanded(false)}>
                            대광베어링 재고관리
                        </Link>
                    </div>

                    {/* 모바일 메뉴 버튼 - lg 크기 이하에서 표시 */}
                    <div className="lg:hidden">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
                            aria-expanded={expanded}
                        >
                            <span className="sr-only">메뉴 열기</span>
                            <svg
                                className="h-6 w-6"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d={expanded ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                                />
                            </svg>
                        </button>
                    </div>

                    {/* 데스크탑 메뉴 - lg 크기 이상에서 표시 */}
                    <div className="hidden lg:flex lg:items-center">
                        <div className="flex items-center space-x-4">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        text-gray-800 hover:text-gray-600 hover:bg-gray-50 
                                        px-3 py-2 
                                        text-sm
                                        font-medium no-underline
                                        rounded-md
                                        ${location.pathname === item.path ? 'bg-gray-100' : ''}
                                    `}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={handleProfileClick}
                                className="flex items-center text-gray-800 hover:text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium no-underline"
                            >
                                <PersonCircle className="h-5 w-5 mr-2" />
                                프로필
                            </button>
                        </div>
                    </div>

                    {/* 모바일 메뉴 - lg 크기 이하에서 expanded 상태일 때 표시 */}
                    <div className={`
                        ${expanded ? 'block' : 'hidden'} 
                        lg:hidden
                        fixed 
                        top-16 
                        left-0 
                        w-full 
                        h-[calc(100vh-4rem)]
                        bg-white 
                        shadow-lg 
                        overflow-y-auto
                        z-40
                    `}>
                        <div className="flex flex-col">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        text-gray-800 hover:text-gray-600 hover:bg-gray-50 
                                        px-4 py-3
                                        text-base
                                        font-medium no-underline
                                        border-b
                                        ${location.pathname === item.path ? 'bg-gray-100' : ''}
                                    `}
                                    onClick={() => setExpanded(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={() => {
                                    handleProfileClick();
                                    setExpanded(false);
                                }}
                                className="
                                    flex items-center 
                                    text-gray-800 hover:text-gray-600 hover:bg-gray-50 
                                    px-4 py-3
                                    text-base
                                    font-medium 
                                    no-underline
                                    border-b
                                "
                            >
                                <PersonCircle className="h-5 w-5 mr-2" />
                                프로필
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default NavbarContent;