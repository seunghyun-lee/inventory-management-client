import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function InventoryHistory() {
    // 기존 상태 유지
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(getSixMonthsAgo());
    const [endDate, setEndDate] = useState(getToday());
    const navigate = useNavigate();

    // 입고 관련 상태
    const [selectedInboundRecord, setSelectedInboundRecord] = useState(null);
    const [isEditInboundModalOpen, setIsEditInboundModalOpen] = useState(false);
    const [showInboundEditResult, setShowInboundEditResult] = useState(false);
    const [inboundEditResult, setInboundEditResult] = useState(null);
    const [showInboundCancelConfirm, setShowInboundCancelConfirm] = useState(false);
    const [showInboundCancelResult, setShowInboundCancelResult] = useState(false);
    const [inboundCancelResult, setInboundCancelResult] = useState(null);

    // 출고 관련 상태
    const [selectedOutboundRecord, setSelectedOutboundRecord] = useState(null);
    const [isEditOutboundModalOpen, setIsEditOutboundModalOpen] = useState(false);
    const [showOutboundEditResult, setShowOutboundEditResult] = useState(false);
    const [outboundEditResult, setOutboundEditResult] = useState(null);
    const [deleteOutboundItemId, setDeleteOutboundItemId] = useState(null);
    const [showOutboundDeleteConfirm, setShowOutboundDeleteConfirm] = useState(false);
    const [showOutboundDeleteResult, setShowOutboundDeleteResult] = useState(false);
    const [outboundDeleteResult, setOutboundDeleteResult] = useState(null);

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const [filters, setFilters] = useState({
        type: '',
        company: '',
        item_name: '',
        item_subname: '',
        manufacturer: '',
        warehouse_name: '',
        warehouse_shelf: ''
    });

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/inventory-history`, {
                params: { startDate, endDate }
            });
            setHistory(response.data);
            setFilteredHistory(response.data);
        } catch (error) {
            console.error('재고 이력을 불러오는데 실패했습니다:', error);
            setError('재고 이력을 불러오는데 실패했습니다. 나중에 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    useEffect(() => {
        let result = history;
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                result = result.filter(item => {
                    if (key === 'type') {
                        const typeText = item.type === 'inbound' ? '입고' : '출고';
                        return typeText.toLowerCase().includes(value.toLowerCase());
                    }
                    return String(item[key]).toLowerCase().includes(value.toLowerCase());
                });
            }
        });
        setFilteredHistory(result);
    }, [filters, history]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchHistory();
    };

    function getToday() {
        return new Date().toISOString().split('T')[0];
    }

    function getSixMonthsAgo() {
        const date = new Date();
        date.setMonth(date.getMonth() - 6);
        return date.toISOString().split('T')[0];
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit'
        }).replace(/\.\s?/g, '-').slice(0, -1);
    }

    const handleInbound = () => {
        navigate('/inbound');
    };

    const handleExcelDownload = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/export-excel`, {
                params: { startDate, endDate },
                responseType: 'blob'
            });
            const blob = response.data;
    
            if (window.Android) {
                const reader = new FileReader();
                reader.onloadend = function() {
                    const base64data = reader.result.split(',')[1];
                    window.Android.saveBase64AsFile(base64data, 'inventory_report.xlsx');
                };
                reader.readAsDataURL(blob);
            } else {
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

    const ErrorModal = ({ isOpen, onClose, message }) => {
        if (!isOpen) return null;
    
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                    <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-red-100">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="ml-3 text-lg font-semibold text-red-600">오류 발생</h3>
                    </div>
                    <p className="mb-6 text-gray-600">{message}</p>
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    //입고 관련
    const isInboundCancelled = (record) => {
        return record.description?.includes('[취소됨]');
    };
    
    const canModifyInbound = (record) => {
        return !isInboundCancelled(record);
    };

    // 입고 수정 핸들러
    const handleEditInbound = (record) => {
        if (isInboundCancelled(record)) {
            setError('취소된 입고 건은 수정할 수 없습니다.');
            return;
        }
        setSelectedInboundRecord(record);
        setIsEditInboundModalOpen(true);
    };

    // 입고 취소 핸들러
    const handleInboundCancel = (record) => {
        if (isInboundCancelled(record)) {
            setError('이미 취소된 입고 건입니다.');
            return;
        }
        setSelectedInboundRecord(record);
        setShowInboundCancelConfirm(true);
    };

    // 입고 취소 수행
    const performInboundCancel = async () => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/inventory-history/inbound/${selectedInboundRecord.id}/cancel`
            );
            
            if (response.data.success) {
                setInboundCancelResult(response.data.data);
                setShowInboundCancelResult(true);
                setShowInboundCancelConfirm(false);
                await fetchHistory();
            }
        } catch (error) {
            console.error('Error cancelling inbound:', error);
            const errorMsg = error.response?.data?.details || 
                            error.response?.data?.error || 
                            '입고 취소 중 오류가 발생했습니다.';
            setErrorMessage(errorMsg);
            setShowErrorModal(true);
            setShowInboundCancelConfirm(false);
        }
    };

    // 입고 수정 모달
    const EditInboundModal = ({ isOpen, onClose, record, onUpdate }) => {
        const [quantity, setQuantity] = useState(record?.total_quantity || 0);
        const [description, setDescription] = useState(record?.description || '');
        const [warehouseName, setWarehouseName] = useState(record?.warehouse_name || '');
        const [warehouseShelf, setWarehouseShelf] = useState(record?.warehouse_shelf || '');
        const [modalError, setModalError] = useState('');
        const [warehouses, setWarehouses] = useState([]);
        const [shelfs, setShelfs] = useState([]);
        const [openDropdown, setOpenDropdown] = useState(null);
        const [selectedIndex, setSelectedIndex] = useState({
            warehouse_name: -1,
            warehouse_shelf: -1
        });
        const [filteredLists, setFilteredLists] = useState({
            warehouses: [],
            shelfs: []
        });
        const warehouseDropdownRef = useRef(null);
        const shelfDropdownRef = useRef(null);

        useEffect(() => {
            fetchWarehouses();
            fetchShelfs();
        }, []);

        const fetchWarehouses = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/warehouses`);
                const warehousesData = response.data.data || response.data;
                if (Array.isArray(warehousesData)) {
                    setWarehouses(warehousesData);
                }
            } catch (error) {
                console.error('Error fetching warehouses:', error);
                setModalError('창고 목록을 불러오는데 실패했습니다.');
            }
        };
    
        const handleKeyDown = (e, type) => {
            const list = filteredLists[`${type}s`];
            const currentIndex = selectedIndex[type];
        
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    const nextIndex = currentIndex === -1 ? 0 : 
                                    currentIndex < list.length - 1 ? currentIndex + 1 : currentIndex;
                    setSelectedIndex(prev => ({
                        ...prev,
                        [type]: nextIndex
                    }));
                    setOpenDropdown(type);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
                    setSelectedIndex(prev => ({
                        ...prev,
                        [type]: prevIndex
                    }));
                    break;
                case 'Enter':
                    if (currentIndex >= 0 && currentIndex < list.length) {
                        const value = type === 'warehouse_name' ? list[currentIndex].warehouse :
                                    type === 'warehouse_shelf' ? list[currentIndex].shelf : '';
                        handleSelect(type, value);
                        setOpenDropdown(null);
                        e.preventDefault();
                    }
                    break;
                case 'Escape':
                    setOpenDropdown(null);
                    setSelectedIndex(prev => ({ ...prev, [type]: -1 }));
                    break;
                default:
                    break;
            }
        };

        const handleInputChange = (e, type) => {
            const { value } = e.target;
            if (type === 'warehouse_name') {
                setWarehouseName(value);
                const filtered = warehouses.filter(w => 
                    w.warehouse.toLowerCase().includes(value.toLowerCase())
                );
                setFilteredLists(prev => ({ ...prev, warehouses: filtered }));
            } else if (type === 'warehouse_shelf') {
                setWarehouseShelf(value);
                const filtered = shelfs.filter(s => 
                    s.shelf.toLowerCase().includes(value.toLowerCase())
                );
                setFilteredLists(prev => ({ ...prev, shelfs: filtered }));
            }
            setOpenDropdown(value.trim() ? type : null);
        };

        const handleSelect = (type, value) => {
            if (type === 'warehouse_name') {
                setWarehouseName(value);
            } else if (type === 'warehouse_shelf') {
                setWarehouseShelf(value);
            }
            setOpenDropdown(null);
            setSelectedIndex(prev => ({ ...prev, [type]: -1 }));
        };

        const fetchShelfs = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/shelfs`);
                const shelfsData = response.data.data || response.data;
                if (Array.isArray(shelfsData)) {
                    setShelfs(shelfsData);
                }
            } catch (error) {
                console.error('Error fetching shelfs:', error);
                setModalError('위치 목록을 불러오는데 실패했습니다.');
            }
        };
    
        useEffect(() => {
            if (record) {
                setQuantity(record.total_quantity);
                setDescription(record.description || '');
                setWarehouseName(record.warehouse_name || '');
                setWarehouseShelf(record.warehouse_shelf || '');
            }
        }, [record]);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setModalError('');
        
            try {
                const newQuantity = parseInt(quantity, 10);
                if (isNaN(newQuantity) || newQuantity <= 0) {
                    setModalError('유효한 수량을 입력해주세요.');
                    return;
                }

                const response = await axios.patch(
                    `${API_BASE_URL}/api/inventory-history/inbound/${record.id}`,
                    {
                        total_quantity: newQuantity,
                        description: description.trim(),
                        warehouse_name: warehouseName.trim(),
                        warehouse_shelf: warehouseShelf.trim()
                    }
                );
    
                if (response.data.success) {
                    await onUpdate();
                    setInboundEditResult(response.data.data);
                    setShowInboundEditResult(true);
                    onClose();
                }
            } catch (error) {
                console.error('Error updating inbound:', error);
                const errorMsg = error.response?.data?.details || 
                               error.response?.data?.error || 
                               '수정 중 오류가 발생했습니다.';
                setModalError(errorMsg);
            }
        };
    
        const handleQuantityChange = (e) => {
            const value = e.target.value;
            // 숫자만 허용하고 음수 입력 방지
            const sanitizedValue = value.replace(/[^0-9]/g, '');
            if (sanitizedValue === '' || parseInt(sanitizedValue, 10) >= 0) {
                setQuantity(sanitizedValue);
            }
        };

        if (!isOpen || !record) return null;
    
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">입고 정보 수정</h3>
                    {modalError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-600">{modalError}</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    입고 수량 (현재: {record.total_quantity})
                                </label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={handleQuantityChange}
                                    onKeyDown={(e) => {
                                        if (e.key === '-') {
                                            e.preventDefault();
                                        }
                                    }}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    pattern="[0-9]*"  // 숫자만 허용
                                    required
                                />
                            </div>
                            <div className="relative" ref={warehouseDropdownRef}>
                                <label className="block text-sm font-medium mb-1">창고</label>
                                <input
                                    type="text"
                                    value={warehouseName}
                                    onChange={(e) => handleInputChange(e, 'warehouse_name')}
                                    onKeyDown={(e) => handleKeyDown(e, 'warehouse_name')}
                                    onFocus={() => {
                                        setOpenDropdown('warehouse_name');
                                        setFilteredLists(prev => ({
                                            ...prev,
                                            warehouses: warehouses
                                        }));
                                    }}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {openDropdown === 'warehouse_name' && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                        {filteredLists.warehouses.map((item, index) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
                                                    index === selectedIndex.warehouse_name ? 'bg-blue-50' : ''
                                                }`}
                                                onClick={() => handleSelect('warehouse_name', item.warehouse)}
                                            >
                                                {item.warehouse}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="relative" ref={shelfDropdownRef}>
                                <label className="block text-sm font-medium mb-1">위치</label>
                                <input
                                    type="text"
                                    value={warehouseShelf}
                                    onChange={(e) => handleInputChange(e, 'warehouse_shelf')}
                                    onKeyDown={(e) => handleKeyDown(e, 'warehouse_shelf')}
                                    onFocus={() => {
                                        setOpenDropdown('warehouse_shelf');
                                        setFilteredLists(prev => ({
                                            ...prev,
                                            shelfs: shelfs
                                        }));
                                    }}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {openDropdown === 'warehouse_shelf' && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                        {filteredLists.shelfs.map((item, index) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
                                                    index === selectedIndex.warehouse_shelf ? 'bg-blue-50' : ''
                                                }`}
                                                onClick={() => handleSelect('warehouse_shelf', item.shelf)}
                                            >
                                                {item.shelf}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    메모
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="수정 사유나 기타 메모를 입력해주세요"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                            >
                                수정
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // 입고 취소 확인 모달
    const InboundCancelConfirmModal = ({ isOpen, onClose, onConfirm }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                    <h3 className="text-lg font-semibold mb-4">입고 취소 확인</h3>
                    <p className="mb-6">이 입고 기록을 취소하시겠습니까?</p>
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
                            확인
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // 입고 결과 모달 (수정/취소 공통)
    const InboundResultModal = ({ isOpen, onClose, result, title, message }) => {
        if (!isOpen || !result) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">{title}</h3>
                    <div className="space-y-3 mb-6">
                        <p className="text-lg font-medium text-green-600 mb-4">
                            {message}
                        </p>
                        <div className="space-y-2 text-sm">
                            <table className="w-full">
                                <tbody>
                                    <tr>
                                        <td className="py-1 w-24 font-semibold">물품명:</td>
                                        <td>{result.item_name}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-semibold">뒷부호:</td>
                                        <td>{result.item_subname}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-semibold">추가번호:</td>
                                        <td>{result.item_subno}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-semibold">메이커:</td>
                                        <td>{result.manufacturer}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-semibold">창고:</td>
                                        <td>{result.warehouse_name}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-semibold">위치:</td>
                                        <td>{result.warehouse_shelf}</td>
                                    </tr>
                                    {result.description && (
                                        <tr>
                                            <td className="py-1 font-semibold">메모:</td>
                                            <td>{result.description}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // 출고 관련
    const handleOutboundDelete = async (id) => {
        console.log('Deleting outbound record:', id);
        try {
            const response = await axios.delete(`${API_BASE_URL}/api/inventory-history/outbound/${id}`);
            
            if (response.data.success) {
                setOutboundDeleteResult(response.data.data);
                setShowOutboundDeleteResult(true);
                await fetchHistory();
                return true;
            } else {
                setError(response.data.message || '삭제 중 오류가 발생했습니다.');
                return false;
            }
        } catch (error) {
            console.error('Delete error:', error.response || error);
            setError(
                error.response?.data?.details || 
                error.response?.data?.error || 
                '출고 기록 삭제 중 오류가 발생했습니다.'
            );
            return false;
        }
    };

    const OutboundDeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
        if (!isOpen) return null;
    
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                    <h3 className="text-lg font-semibold mb-4">삭제 확인</h3>
                    <p className="mb-6">출고 기록을 삭제하시겠습니까?</p>
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

    const OutboundDeleteResultModal = ({ isOpen, onClose, result }) => {
        if (!isOpen || !result) return null;
    
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">재고 반영 완료</h3>
                    <div className="space-y-3 mb-6">
                        <p className="text-lg font-medium text-green-600 mb-4">
                            {result.message}
                        </p>
                        <div className="space-y-2 text-sm">
                            <p><span className="font-semibold">물품명:</span> {result.deletedRecord.item_name}</p>
                            <p><span className="font-semibold">뒷부호:</span> {result.deletedRecord.item_subname}</p>
                            <p><span className="font-semibold">추가번호:</span> {result.deletedRecord.item_subno}</p>
                            <p><span className="font-semibold">메이커:</span> {result.deletedRecord.manufacturer}</p>
                            <p><span className="font-semibold">이전 재고량:</span> {result.previousQuantity}</p>
                            <p><span className="font-semibold">현재 재고량:</span> {result.newQuantity}</p>
                        </div>
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                                ⚠️ 반환된 물품을 지정된 창고 위치에 올바르게 보관해주세요.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const performOutboundDelete = async () => {
        try {
            const success = await handleOutboundDelete(deleteOutboundItemId);
            if (success) {
                setShowOutboundDeleteConfirm(false);
                setDeleteOutboundItemId(null);
                setError(null);
            }
        } catch (error) {
            console.error('Error during delete:', error);
            setError(error.response?.data?.error || '출고 기록 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteOutboundClick = (id) => {
        setDeleteOutboundItemId(id);
        setShowOutboundDeleteConfirm(true);
    };
    
    const handleEditOutbound = (record) => {
        setSelectedOutboundRecord(record);
        setIsEditOutboundModalOpen(true);
    };

    const EditOutboundModal = ({ isOpen, onClose, record, onUpdate }) => {
        const [quantity, setQuantity] = useState(record?.total_quantity || 0);
        const [description, setDescription] = useState(record?.description || '');
        const [error, setError] = useState('');
        
        useEffect(() => {
            if (record) {
                setQuantity(record.total_quantity);
                setDescription(record.description || '');
            }
        }, [record]);
    
        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
        
            if (parseInt(quantity) === record.total_quantity) {
                setError('현재 수량과 다른 수량을 입력해주세요.');
                return;
            }
        
            if (parseInt(quantity) > record.total_quantity) {
                setError('현재 출고된 수량보다 많은 수량으로 수정할 수 없습니다.');
                return;
            }
        
            try {
                const response = await axios.patch(`${API_BASE_URL}/api/inventory-history/outbound/${record.id}`, {
                    total_quantity: parseInt(quantity),
                    description
                });
                
                if (response.data.success) {
                    await onUpdate();
                    const updatedData = {
                        ...record,
                        total_quantity: parseInt(quantity),
                        description,
                        returnedQuantity: record.total_quantity - parseInt(quantity),
                        previous_quantity: record.total_quantity
                    };
                    setOutboundEditResult(updatedData);
                    setShowOutboundEditResult(true);
                    onClose();
                } else {
                    setError(response.data.message || '수정 중 오류가 발생했습니다.');
                }
            } catch (error) {
                console.error('Error updating quantity:', error);
                setError(
                    error.response?.data?.details || 
                    error.response?.data?.error || 
                    '수정 중 오류가 발생했습니다.'
                );
            }
        };
    
        if (!isOpen) return null;
    
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">출고 수량 수정</h3>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    출고 수량 (현재: {record?.total_quantity})
                                </label>
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="1"
                                    max={record?.total_quantity}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    메모
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="수정 사유나 기타 메모를 입력해주세요"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                            >
                                수정
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const OutboundEditResultModal = ({ isOpen, onClose, result }) => {
        if (!isOpen || !result) return null;
    
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">재고 반영 완료</h3>
                    <div className="space-y-3 mb-6">
                        <p className="text-lg font-medium text-green-600 mb-4">
                            {result.returnedQuantity}개가 재고로 반환되었습니다.
                        </p>
                        <div className="space-y-2 text-sm">
                            <table className="w-full">
                                <tbody>
                                    <tr>
                                        <td className="py-1 w-24 font-semibold">물품명:</td>
                                        <td>{result.item_name}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-semibold">뒷부호:</td>
                                        <td>{result.item_subname}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-semibold">추가번호:</td>
                                        <td>{result.item_subno}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-semibold">메이커:</td>
                                        <td>{result.manufacturer}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-semibold">이전 출고 수량:</td>
                                        <td>{result.previous_quantity}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-semibold">변경 출고 수량:</td>
                                        <td>{result.total_quantity}</td>
                                    </tr>
                                    {/* <tr>
                                        <td className="py-1 font-semibold">현재 재고량:</td>
                                        <td>{result.current_quantity}</td>
                                    </tr> */}
                                    <tr>
                                        <td className="py-1 font-semibold">창고:</td>
                                        <td>{result.warehouse_name}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 font-semibold">위치:</td>
                                        <td>{result.warehouse_shelf}</td>
                                    </tr>
                                    {result.description && (
                                        <tr>
                                            <td className="py-1 font-semibold">수정 메모:</td>
                                            <td>{result.description}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                                ⚠️ 반환된 물품을 지정된 창고 위치에 올바르게 보관해주세요.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center mt-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }
    
    return (
        <div className="max-w-full">
            <div className="px-4">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">재고 이력</h2>
                    
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
                
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full sm:w-auto px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full sm:w-auto px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            type="submit" 
                            className="w-full sm:w-auto px-4 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            검색
                        </button>
                    </div>
                </form>
    
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                    <input
                        type="text"
                        name="type"
                        placeholder="구분"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="company"
                        placeholder="회사"
                        value={filters.company}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="item_name"
                        placeholder="물품명"
                        value={filters.item_name}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="item_subname"
                        placeholder="뒷부호"
                        value={filters.item_subname}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="manufacturer"
                        placeholder="메이커"
                        value={filters.manufacturer}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="warehouse_name"
                        placeholder="창고"
                        value={filters.warehouse_name}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                        type="text"
                        name="warehouse_shelf"
                        placeholder="위치"
                        value={filters.warehouse_shelf}
                        onChange={handleFilterChange}
                        className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
    
                <ErrorModal 
                    isOpen={showErrorModal}
                    onClose={() => {
                        setShowErrorModal(false);
                        setErrorMessage('');
                    }}
                    message={errorMessage}
                />

                <OutboundDeleteConfirmModal 
                    isOpen={showOutboundDeleteConfirm}
                    onClose={() => {
                        setShowOutboundDeleteConfirm(false);
                        setDeleteOutboundItemId(null);
                    }}
                    onConfirm={performOutboundDelete}
                />
    
                <OutboundDeleteResultModal 
                    isOpen={showOutboundDeleteResult}
                    onClose={() => {
                        setShowOutboundDeleteResult(false);
                        setOutboundDeleteResult(null);
                    }}
                    result={outboundDeleteResult}
                />
                
                <EditOutboundModal
                    isOpen={isEditOutboundModalOpen}
                    onClose={() => setIsEditOutboundModalOpen(false)}
                    record={selectedOutboundRecord}
                    onUpdate={fetchHistory}
                />
                
                <OutboundEditResultModal 
                    isOpen={showOutboundEditResult}
                    onClose={() => {
                        setShowOutboundEditResult(false);
                        setOutboundEditResult(null);
                    }}
                    result={outboundEditResult}
                />
    
                {/* 입고 관련 모달들 */}
                <EditInboundModal
                    isOpen={isEditInboundModalOpen}
                    onClose={() => setIsEditInboundModalOpen(false)}
                    record={selectedInboundRecord}
                    onUpdate={fetchHistory}
                />

                <InboundCancelConfirmModal 
                    isOpen={showInboundCancelConfirm}
                    onClose={() => {
                        setShowInboundCancelConfirm(false);
                        setSelectedInboundRecord(null);
                    }}
                    onConfirm={performInboundCancel}
                />

                <InboundResultModal 
                    isOpen={showInboundEditResult}
                    onClose={() => {
                        setShowInboundEditResult(false);
                        setInboundEditResult(null);
                    }}
                    result={inboundEditResult}
                    title="입고 수정 완료"
                    message="입고 정보가 수정되었습니다."
                />

                <InboundResultModal 
                    isOpen={showInboundCancelResult}
                    onClose={() => {
                        setShowInboundCancelResult(false);
                        setInboundCancelResult(null);
                    }}
                    result={inboundCancelResult}
                    title="입고 취소 완료"
                    message="입고가 취소되었습니다."
                />

                <div className="bg-white rounded-lg shadow">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[1200px]">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-sm font-semibold text-center whitespace-nowrap">날짜</th>
                                    <th className="px-4 py-2 text-sm font-semibold text-center whitespace-nowrap">구분</th>
                                    <th className="px-4 py-2 text-sm font-semibold text-left whitespace-nowrap">회사</th>
                                    <th className="px-4 py-2 text-sm font-semibold text-left whitespace-nowrap">물품명</th>
                                    <th className="px-4 py-2 text-sm font-semibold text-right whitespace-nowrap">수량</th>
                                    <th className="px-4 py-2 text-sm font-semibold text-left whitespace-nowrap">뒷부호</th>
                                    <th className="px-4 py-2 text-sm font-semibold text-left whitespace-nowrap">추가번호</th>
                                    <th className="px-4 py-2 text-sm font-semibold text-left whitespace-nowrap">메이커</th>
                                    <th className="px-4 py-2 text-sm font-semibold text-left whitespace-nowrap">창고</th>
                                    <th className="px-4 py-2 text-sm font-semibold text-left whitespace-nowrap">위치</th>
                                    <th className="px-4 py-2 text-sm font-semibold text-left whitespace-nowrap">메모</th>
                                    <th className="px-4 py-2 text-sm font-semibold text-center whitespace-nowrap">담당자</th>
                                    <th className="px-4 py-2 text-sm font-semibold text-center whitespace-nowrap">작업</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredHistory.map((item, index) => (
                                    <tr 
                                        key={index}
                                        className={`hover:bg-gray-50 ${item.type === 'inbound' ? 'bg-blue-50' : 'bg-red-50'}`}
                                    >
                                        <td className="px-4 py-2 text-sm text-center whitespace-nowrap">{formatDate(item.date)}</td>
                                        <td className="px-4 py-2 text-sm text-center whitespace-nowrap">
                                            <span className={item.type === 'inbound' ? 'text-blue-600' : 'text-red-600'}>
                                                {item.type === 'inbound' ? '입고' : '출고'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-left">{item.company}</td>
                                        <td className="px-4 py-2 text-sm text-left">{item.item_name}</td>
                                        <td className="px-4 py-2 text-sm text-right whitespace-nowrap">{item.total_quantity}</td>
                                        <td className="px-4 py-2 text-sm text-left">{item.item_subname}</td>
                                        <td className="px-4 py-2 text-sm text-left">{item.item_subno}</td>
                                        <td className="px-4 py-2 text-sm text-left">{item.manufacturer}</td>
                                        <td className="px-4 py-2 text-sm text-left">{item.warehouse_name}</td>
                                        <td className="px-4 py-2 text-sm text-left">{item.warehouse_shelf}</td>
                                        <td className="px-4 py-2 text-sm text-left">{item.description}</td>
                                        <td className="px-4 py-2 text-sm text-center whitespace-nowrap">{item.handler_name}</td>
                                        <td className="px-4 py-2 text-sm text-center whitespace-nowrap">
                                            {item.type === 'outbound' ? (
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEditOutbound(item)}
                                                        className="px-2 py-1 text-xs text-white bg-yellow-500 rounded hover:bg-yellow-600"
                                                    >
                                                        수정
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOutboundClick(item.id)}
                                                        className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            ) : canModifyInbound(item) && (
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleEditInbound(item)}
                                                        className="px-2 py-1 text-xs text-white bg-yellow-500 rounded hover:bg-yellow-600"
                                                    >
                                                        수정
                                                    </button>
                                                    <button
                                                        onClick={() => handleInboundCancel(item)}
                                                        className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                                                    >
                                                        취소
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}


export default InventoryHistory;