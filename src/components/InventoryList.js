import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function InventoryList() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        item_name: '',
        manufacturer: '',
        warehouse_name: '',
        warehouse_shelf: ''
    });
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState(null);

    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/inventory`);
            const processed = processInventoryData(response.data.inventory, response.data.summary);
            setInventory(processed);
            setError(null);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            setError('재고 목록을 불러오는 데 실패했습니다. 나중에 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const filtered = inventory.filter(item => {
            if (item.type !== 'item') return false;
            
            return (!filters.item_name || item.item_name.toLowerCase().includes(filters.item_name.toLowerCase())) &&
                   (!filters.manufacturer || item.manufacturer.toLowerCase().includes(filters.manufacturer.toLowerCase())) &&
                   (!filters.warehouse_name || item.warehouse_name.toLowerCase().includes(filters.warehouse_name.toLowerCase())) &&
                   (!filters.warehouse_shelf || item.warehouse_shelf.toLowerCase().includes(filters.warehouse_shelf.toLowerCase()));
        });
    
        // 필터링된 데이터로 소계와 합계 재계산
        const processed = processInventoryData(filtered);
        setFilteredInventory(processed);
    }, [filters, inventory]);

    const processInventoryData = (data) => {
        if (!data.length) return [];
    
        // 동일한 항목을 병합하여 하나의 레코드로 만듦
        const mergedData = Object.values(data.reduce((acc, item) => {
            // 고유 식별키 생성 (모든 구분 필드 조합)
            const key = `${item.item_name}|${item.item_subname}|${item.item_subno}|${item.manufacturer}|${item.warehouse_name}|${item.warehouse_shelf}`;
            
            if (!acc[key]) {
                // 새로운 항목 생성
                acc[key] = {
                    ...item,
                    type: 'item',
                    current_quantity: parseInt(item.current_quantity) || 0
                };
            } else {
                // 기존 항목의 수량을 합산
                acc[key].current_quantity += parseInt(item.current_quantity) || 0;
            }
            return acc;
        }, {}));

        const processedData = [];
        let grandTotal = 0;

        // 물품명과 뒷부호로 그룹화하여 소계 계산
        const groupedByName = mergedData.reduce((acc, item) => {
            const key = `${item.item_name}|${item.item_subname || ''}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {});

        // 그룹별로 처리하고 소계/총계 추가
        Object.entries(groupedByName).forEach(([key, items]) => {
            const [itemName, itemSubname] = key.split('|');
            const groupTotal = items.reduce((sum, item) => sum + (parseInt(item.current_quantity) || 0), 0);
            
            // 개별 항목 추가
            items.forEach(item => {
                processedData.push(item);
            });

            // 소계 추가
            processedData.push({
                type: 'subtotal',
                item_name: itemName,
                item_subname: itemSubname,
                current_quantity: groupTotal,
                quantity: groupTotal
            });
            grandTotal += groupTotal;
        });

        // 총계 추가
        if (processedData.length > 0) {
            processedData.push({
                type: 'total',
                current_quantity: grandTotal,
                quantity: grandTotal
            });
        }
    
        return processedData;
    };   

    const handleOutbound = (itemId) => {
        navigate(`/outbound/${itemId}`);
    };

    const handleInbound = () => {
        navigate('/inbound');
    };

    const handleEdit = (row) => {
        if (row.inbound_id) {
            navigate(`/inbound/edit/${row.inbound_id}`);
        } else {
            console.error('입고 ID를 찾을 수 없습니다.');
        }
    };

    const handleDelete = async (itemId, hasOutboundHistory) => {
        if (hasOutboundHistory) {
            return;
        }
        setDeleteItemId(itemId);
        setShowDeleteConfirm(true);
    };

    const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
        if (!isOpen) return null;
    
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                    <h3 className="text-lg font-semibold mb-4">삭제 확인</h3>
                    <p className="mb-6">정말로 이 항목을 삭제하시겠습니까?</p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border rounded"
                        >
                            취소
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                        >
                            삭제
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const performDelete = async () => {
        try {
            await axios.delete(`${API_BASE_URL}/api/inventory/${deleteItemId}`);
            setShowDeleteConfirm(false);
            setDeleteItemId(null);
            // 삭제 후 목록 새로고침
            await fetchInventory();
            setError(null);
        } catch (error) {
            console.error('Error deleting item:', error);
            setError(error.response?.data?.error || '항목 삭제에 실패했습니다.');
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
            <div className="mb-2 bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs">
                {error}
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-semibold">재고 목록</h2>
                <div className="space-x-2">
                    <button 
                        onClick={handleExcelDownload}
                        className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        Excel 다운로드
                    </button>
                    <button 
                        onClick={handleInbound}
                        className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                        입고 등록
                    </button>
                </div>
            </div>

            <div className="mb-4 grid grid-cols-4 gap-4">
                <input
                    type="text"
                    name="item_name"
                    placeholder="물품명으로 필터"
                    value={filters.item_name}
                    onChange={handleFilterChange}
                    className="px-3 py-1 text-sm border rounded"
                />
                <input
                    type="text"
                    name="manufacturer"
                    placeholder="메이커로 필터"
                    value={filters.manufacturer}
                    onChange={handleFilterChange}
                    className="px-3 py-1 text-sm border rounded"
                />
                <input
                    type="text"
                    name="warehouse_name"
                    placeholder="창고로 필터"
                    value={filters.warehouse_name}
                    onChange={handleFilterChange}
                    className="px-3 py-1 text-sm border rounded"
                />
                <input
                    type="text"
                    name="warehouse_shelf"
                    placeholder="위치로 필터"
                    value={filters.warehouse_shelf}
                    onChange={handleFilterChange}
                    className="px-3 py-1 text-sm border rounded"
                />
            </div>

            <DeleteConfirmModal 
                isOpen={showDeleteConfirm}
                onClose={() => {
                    setShowDeleteConfirm(false);
                    setDeleteItemId(null);
                }}
                onConfirm={performDelete}
            />

            <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr className="text-xs">
                            <th className="w-[18%] px-3 py-2 text-left font-semibold border-b">물품명</th>
                            <th className="w-[12%] px-3 py-2 text-left font-semibold border-b">뒷부호</th>
                            <th className="w-[12%] px-3 py-2 text-left font-semibold border-b">추가번호</th>
                            <th className="w-[12%] px-3 py-2 text-left font-semibold border-b">메이커</th>
                            <th className="w-[12%] px-3 py-2 text-left font-semibold border-b">창고</th>
                            <th className="w-[12%] px-3 py-2 text-left font-semibold border-b">위치</th>
                            <th className="w-[10%] px-3 py-2 text-right font-semibold border-b">수량</th>
                            <th className="w-[12%] px-3 py-2 text-center font-semibold border-b">작업</th>
                        </tr>
                    </thead>
                </table>
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="text-xs bg-white">
                            {filteredInventory.map((row, index) => {
                                if (row.type === 'item') {
                                    return (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="w-[18%] px-3 py-2 whitespace-nowrap border-b">{row.item_name}</td>
                                            <td className="w-[12%] px-3 py-2 whitespace-nowrap border-b">{row.item_subname}</td>
                                            <td className="w-[12%] px-3 py-2 whitespace-nowrap border-b">{row.item_subno}</td>
                                            <td className="w-[12%] px-3 py-2 whitespace-nowrap border-b">{row.manufacturer}</td>
                                            <td className="w-[12%] px-3 py-2 whitespace-nowrap border-b">{row.warehouse_name}</td>
                                            <td className="w-[12%] px-3 py-2 whitespace-nowrap border-b">{row.warehouse_shelf}</td>
                                            <td className="w-[10%] px-3 py-2 text-right whitespace-nowrap border-b">
                                                {row.current_quantity?.toLocaleString() || '0'}  {/* 수량 표시 수정 */}
                                            </td>
                                            <td className="w-[12%] px-3 py-2 whitespace-nowrap border-b">
                                                <div className="flex justify-center space-x-1">
                                                    <button
                                                        onClick={() => handleOutbound(row.id)}
                                                        className="px-2 py-0.5 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
                                                    >
                                                        출고
                                                    </button>
                                                    {/* <button
                                                        onClick={() => handleEdit(row)}
                                                        className="px-2 py-0.5 text-xs text-white bg-yellow-500 rounded hover:bg-yellow-600"
                                                    >
                                                        수정
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(row.inbound_id)}
                                                        disabled={row.has_outbound_history}
                                                        className={`px-2 py-0.5 text-xs text-white rounded ${
                                                            row.has_outbound_history 
                                                            ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                                                            : 'bg-red-500 hover:bg-red-600'
                                                        }`}
                                                        title={row.has_outbound_history ? '출고 이력이 있는 물품은 삭제할 수 없습니다' : ''}
                                                    >
                                                        삭제
                                                    </button> */}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                } else if (row.type === 'subtotal') {
                                    return (
                                        <tr key={index} className="bg-gray-50 text-xs font-semibold">
                                            <td colSpan="6" className="px-3 py-2 text-right border-b">
                                                {row.item_name}{row.item_subname ? ` (${row.item_subname})` : ''} 소계:
                                            </td>
                                            <td className="px-3 py-2 text-right whitespace-nowrap border-b">
                                                {row.quantity.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 border-b"></td>
                                        </tr>
                                    );
                                } else if (row.type === 'total') {
                                    return (
                                        <tr key={index} className="bg-gray-200 text-xs font-bold">
                                            <td colSpan="6" className="px-3 py-2 text-right border-b">총계:</td>
                                            <td className="px-3 py-2 text-right whitespace-nowrap border-b">
                                                {row.quantity.toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 border-b"></td>
                                        </tr>
                                    );
                                }
                                return null;
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default InventoryList;