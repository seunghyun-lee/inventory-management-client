import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function InboundForm({ editMode = false }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        manufacturer: '',
        item_name: '',
        item_subname: '',
        item_subno: '',
        date: '',
        supplier: '',        
        total_quantity: '',
        handler_name: '',
        warehouse_name: '',
        warehouse_shelf: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(editMode);
    const [error, setError] = useState(null);
    const [manufacturers, setManufacturers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [shelfs, setShelfs] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState({
        manufacturer: -1,
        warehouse_name: -1,
        warehouse_shelf: -1
    });
    const [filteredLists, setFilteredLists] = useState({
        manufacturers: [],
        warehouses: [],
        shelfs: []
    });
    const manufacturerDropdownRef = useRef(null);
    const warehouseDropdownRef = useRef(null);
    const shelfDropdownRef = useRef(null);
    const [initialData, setInitialData] = useState(null);
    const [isFormChanged, setIsFormChanged] = useState(false);

    useEffect(() => {
        if (editMode && id) {
            fetchInboundData(id);
        }
    }, [editMode, id]);

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
    }, [editMode]);

    const handleCancel = () => {
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (manufacturerDropdownRef.current && !manufacturerDropdownRef.current.contains(event.target) &&
                warehouseDropdownRef.current && !warehouseDropdownRef.current.contains(event.target) &&
                shelfDropdownRef.current && !shelfDropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (editMode && initialData) {
            const hasChanges = Object.keys(formData).some(key => {
                return formData[key] !== initialData[key];
            })
            setIsFormChanged(hasChanges);
        }
    }, [formData, initialData, editMode]);

    const fetchManufacturers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/manufacturers`);
            const manufacturersData = response.data.data || response.data;
            if (Array.isArray(manufacturersData)) {
                setManufacturers(manufacturersData);
            } else {
                console.error('Unexpected manufacturers data structure:', manufacturersData);
                setError('메이커 데이터 구조가 예상과 다릅니다.');
                setManufacturers([]);
            }
        } catch (error) {
            console.error('Error fetching manufacturers:', error);
            setError('메이커 목록을 불러오는데 실패했습니다.');
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

    const fetchInboundData = async (inboundId) => {
        try {
            setLoadingData(true);
            const response = await axios.get(`${API_BASE_URL}/api/inventory/inbound/${inboundId}`);
            const data = response.data;

            if (data.date) {
                const date = new Date(data.date);
                data.date = date.toISOString().split('T')[0];
            }
            setFormData(data);
            setInitialData(data);
        } catch (error) {
            console.error('Error fetching inbound data:', error);
            setError('데이터 로드에 실패했습니다.');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
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
                const selectedElement = document.querySelector(`[data-index="${nextIndex}"]`);
                selectedElement?.scrollIntoView({ block: 'nearest' });
                break;
            case 'ArrowUp':
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
                setSelectedIndex(prev => ({
                    ...prev,
                    [type]: prevIndex
                }));
                const prevElement = document.querySelector(`[data-index="${prevIndex}"]`);
                prevElement?.scrollIntoView({ block: 'nearest' });
                break;
            case 'Enter':
            case 'Tab':
                if (currentIndex >= 0 && currentIndex < list.length) {
                    const value = type === 'manufacturer' ? list[currentIndex].manufacturer :
                                type === 'warehouse_name' ? list[currentIndex].warehouse :
                                type === 'warehouse_shelf' ? list[currentIndex].shelf :
                                '';
                    handleSelect(type, value);
                    setOpenDropdown(null);
                    if (e.key === 'Tab') {
                        return;
                    }
                    e.preventDefault();
                }
                break;
            case 'Escape':
                e.preventDefault();
                setOpenDropdown(null);
                setSelectedIndex(prev => ({ ...prev, [type]: -1 }));
                break;
            default:
                break;
        }
    };

    const handleInputChange = (e, type) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, [type]: value }));
    
        let filteredItems = [];
        if (type === 'manufacturer') {
            filteredItems = manufacturers.filter(m => 
                m.manufacturer.toLowerCase().includes(value.toLowerCase())
            );
        } else if (type === 'warehouse_name') {
            filteredItems = warehouses.filter(w => 
                w.warehouse.toLowerCase().includes(value.toLowerCase())
            );
        } else if (type === 'warehouse_shelf') {
            filteredItems = shelfs.filter(s => 
                s.shelf.toLowerCase().includes(value.toLowerCase())
            );
        }
    
        setFilteredLists(prev => ({
            ...prev,
            [`${type}s`]: filteredItems
        }));
        setOpenDropdown(value.trim() ? type : null);
    };

    const handleSelect = (type, value) => {
        setFormData(prev => ({
            ...prev,
            [type]: value
        }));
        setOpenDropdown(null);
        setSelectedIndex(prev => ({ ...prev, [type]: -1 }));
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
    
        try {
            if (editMode) {
                await axios.put(`${API_BASE_URL}/api/inventory/inbound/${id}`, dataToSend);
            } else {
                await axios.post(`${API_BASE_URL}/api/transactions/inbound`, dataToSend);
            }
            navigate('/');
        } catch (error) {
            console.error('입고 처리 중 오류 발생:', error.response ? error.response.data : error.message);
            setError(editMode ? '수정 중 오류가 발생했습니다.' : '입고 처리 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const renderCombobox = (type, label, placeholder, list) => (
        <div className="grid grid-cols-12 gap-4 items-center">
            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                <div className="relative" ref={type === 'manufacturer' ? manufacturerDropdownRef : 
                                           type === 'warehouse_name' ? warehouseDropdownRef : shelfDropdownRef}>
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={formData[type]}
                        onChange={(e) => handleInputChange(e, type)}
                        onKeyDown={(e) => handleKeyDown(e, type)}
                        onFocus={() => {                            
                            setOpenDropdown(type);
                            setFilteredLists(prev => ({
                                ...prev,
                                [`${type}s`]: list
                            }));                            
                        }}
                        onBlur={(e) => {
                            const relatedTarget = e.relatedTarget;
                            const isDropdownClick = relatedTarget && 
                                (relatedTarget.classList.contains('dropdown-item') ||
                                 relatedTarget.closest('.dropdown-content'));
    
                            if (!isDropdownClick) {                                
                                if (!e.relatedTarget || !e.relatedTarget.classList.contains('combobox-input')) {
                                    setTimeout(() => {
                                        const currentIndex = selectedIndex[type];
                                        const list = filteredLists[`${type}s`];
                                        if (currentIndex >= 0 && currentIndex < list.length) {
                                            const value = type === 'manufacturer' ? list[currentIndex].manufacturer :
                                                        type === 'warehouse_name' ? list[currentIndex].warehouse :
                                                        type === 'warehouse_shelf' ? list[currentIndex].shelf :
                                                        '';
                                            handleSelect(type, value);
                                        }
                                    }, 200);
                                }
                            }
                        }}
                        className="combobox-input w-full px-3 py-2 text-left border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoComplete="off"
                    />
                    {openDropdown === type && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredLists[`${type}s`].map((item, index) => {
                                const value = type === 'manufacturer' ? item.manufacturer :
                                            type === 'warehouse_name' ? item.warehouse :
                                            type === 'warehouse_shelf' ? item.shelf :
                                            '';
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        data-index={index}
                                        className={`block w-full px-4 py-2 text-left text-sm ${
                                            index === selectedIndex[type] 
                                                ? 'bg-blue-500 text-white' 
                                                : 'hover:bg-gray-100'
                                        }`}
                                        onClick={() => {
                                            handleSelect(type, value);
                                            setOpenDropdown(null);
                                        }}
                                        onMouseEnter={() => setSelectedIndex(prev => ({ ...prev, [type]: index }))}
                                    >
                                        {value}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 sm:p-6 md:p-6">
                <div className="w-full h-full max-w-4xl mx-auto bg-white rounded-none sm:rounded-lg shadow-md">
                    <div className="px-4 sm:px-6 py-4 border-b">
                        <h2 className="text-2xl font-bold">{editMode ? '입고 수정' : '입고 등록'}</h2>
                    </div>
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col items-center justify-center space-y-4 min-h-[400px]">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <p className="text-gray-600">데이터를 불러오는 중입니다...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 sm:p-6 md:p-6">
            <div className="w-full h-full max-w-4xl mx-auto bg-white rounded-none sm:rounded-lg shadow-md">
                <div className="px-4 sm:px-6 py-4 border-b">
                    <h2 className="text-2xl font-bold">{editMode ? '입고 수정' : '입고 등록'}</h2>
                </div>
                <div className="p-4 sm:p-6">
                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">
                                날짜
                            </label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">
                                공급업체
                            </label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="text"
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">
                                물품명
                            </label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="text"
                                    name="item_name"
                                    value={formData.item_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">
                                뒷부호
                            </label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="text"
                                    name="item_subname"
                                    value={formData.item_subname}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">
                                추가번호
                            </label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="text"
                                    name="item_subno"
                                    value={formData.item_subno}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">
                                수량
                            </label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="number"
                                    name="total_quantity"
                                    value={formData.total_quantity}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {renderCombobox('manufacturer', '메이커', '메이커 선택 또는 입력', manufacturers)}
                        {renderCombobox('warehouse_name', '창고', '창고 선택 또는 입력', warehouses)}
                        {renderCombobox('warehouse_shelf', '위치', '위치 선택 또는 입력', shelfs)}

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                메모
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">
                                담당자
                            </label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="text"
                                    name="handler_name"
                                    value={formData.handler_name}
                                    onChange={handleChange}
                                    required
                                    readOnly
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-600 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 mt-8">
                        <button
                            type="submit"
                            disabled={loading || (editMode && !isFormChanged)}
                            className={`
                                px-6 py-2 text-white rounded-md
                                ${loading || (editMode && !isFormChanged)
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'}
                            `}
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    처리 중...
                                </div>
                            ) : editMode ? '수정하기' : '입고 등록'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            취소
                        </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default InboundForm;