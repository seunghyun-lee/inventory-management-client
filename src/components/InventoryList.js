import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function InventoryList() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/inventory`);
            setInventory(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setError('재고 목록을 불러오는 데 실패했습니다. 나중에 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleOutbound = (itemId) => {
        navigate(`/outbound/${itemId}`);
    };

    const handleInbound = () => {
        navigate('/inbound');
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('정말로 이 항목을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`${API_BASE_URL}/api/inventory/${itemId}`);
                setInventory(inventory.filter(item => item.id !== itemId));
                setError(null); // 성공 시 에러 메시지 초기화
            } catch (error) {
                console.error('Error deleting item:', error);
                setError(error.response?.data?.error || '항목 삭제에 실패했습니다.');
            }
        }
    };

    const handleExcelDownload = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/export-excel`, {
                responseType: 'blob', // 중요: 응답을 blob으로 받습니다.
            });
            const blob = response.data;

            if (window.Android) {
                const reader = new FileReader();
                reader.onloadend = function() {
                    const base64data = reader.result.split(',')[1];  // base64 데이터 추출
                    window.Android.saveBase64AsFile(base64data, 'inventory_report.xlsx');  // Android로 전달
                };
                reader.readAsDataURL(blob);  // Blob을 Base64로 변환
            } else {
                // 브라우저에서 실행되는 경우
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'inventory_report.xlsx');
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } catch (error) {
            console.error('Error downloading Excel file:', error);
            setError('Excel 파일 다운로드에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center mt-5">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div className="fixed inset-0 pt-16">
            <div className="fixed top-16 left-0 right-0 bg-white z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <h2 className="text-2xl font-bold">재고 목록</h2>
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={handleExcelDownload}
                                className="flex-1 md:flex-none bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm whitespace-nowrap"
                            >
                                Excel 다운로드
                            </button>
                            <button 
                                onClick={handleInbound}
                                className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm whitespace-nowrap"
                            >
                                입고 등록
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute inset-x-0 top-[185px] md:top-[140px] bottom-0 overflow-auto"> {/* 헤더 높이에 맞춰 top 값 조정 */}
                <div className="container mx-auto p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {inventory.map((item) => (
                            <div key={item.id} 
                                className="bg-gray-100 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 
                                        border-l-4 border-blue-400 hover:border-blue-500 
                                        hover:-translate-y-0.5">
                                <div className="mb-3">
                                    <h3 className="text-lg font-semibold">
                                        물품명: {item.item_name} 
                                        <span className="text-sm ml-1 text-gray-600">{item.item_subname}</span>
                                    </h3>
                                    <p className="text-gray-600 font-medium">메이커: {item.manufacturer}</p>
                                </div>
                                
                                <div className="flex justify-between items-center mb-3">
                                    <span>수량: {item.current_quantity || 0}</span>
                                    <span>창고: {item.warehouse_name || '모름'}</span>
                                    <span>위치: {item.warehouse_shelf || '모름'}</span>
                                </div>
                                
                                <p className="mb-4">
                                    <span className="font-medium">비고:</span> {item.description || '없음'}
                                </p>
                                
                                <div className="flex justify-between mt-4">
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                                    >
                                        삭제
                                    </button>
                                    <button 
                                        onClick={() => handleOutbound(item.id)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                                    >
                                        출고
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>            
            </div>
        </div>
    );
}

export default InventoryList;