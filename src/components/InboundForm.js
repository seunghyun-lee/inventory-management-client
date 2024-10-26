import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function InboundForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        manufacturer: '',
        item_name: '',
        item_subname: '',
        date: '',
        supplier: '',        
        total_quantity: '',
        handler_name: '',
        warehouse_name: '',
        warehouse_shelf: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [manufacturers, setManufacturers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [shelfs, setShelfs] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const dropdownRef = useRef(null);

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
    }, []);

    const handleCancel = () => {
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchManufacturers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/manufacturers`);
            const manufacturersData = response.data.data || response.data;
            if (Array.isArray(manufacturersData)) {
                setManufacturers(manufacturersData);
            } else {
                console.error('Unexpected manufacturers data structure:', manufacturersData);
                setError('제조사 데이터 구조가 예상과 다릅니다.');
                setManufacturers([]);
            }
        } catch (error) {
            console.error('Error fetching manufacturers:', error);
            setError('제조사 목록을 불러오는데 실패했습니다.');
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleManufacturerSelect = (manufacturer) => {
        setFormData(prevData => ({
            ...prevData,
            manufacturer: manufacturer
        }));
    };

    const handleWarehouseSelect = (warehouse) => {
        setFormData(prevData => ({
            ...prevData,
            warehouse_name: warehouse
        }));
    };

    const handleShelfSelect = (shelf) => {
        setFormData(prevData => ({
            ...prevData,
            warehouse_shelf: shelf
        }));
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
            await axios.post(`${API_BASE_URL}/api/transactions/inbound`, dataToSend);
            navigate('/');
        } catch (error) {
            console.error('입고 처리 중 오류 발생:', error.response ? error.response.data : error.message);
            setError('입고 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md">
                <div className="px-4 sm:px-6 py-4 border-b">
                    <h2 className="text-2xl font-bold">입고 등록</h2>
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
                                메이커
                            </label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2 text-left border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 inline-flex justify-between items-center"
                                        onClick={() => setOpenDropdown(openDropdown === 'manufacturer' ? null : 'manufacturer')}
                                    >
                                        {formData.manufacturer || "선택해주세요"}
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {openDropdown === 'manufacturer' && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                                            {manufacturers.map((m) => (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                                    onClick={() => {
                                                        handleManufacturerSelect(m.manufacturer);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    {m.manufacturer}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">
                                창고
                            </label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2 text-left border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 inline-flex justify-between items-center"
                                        onClick={() => setOpenDropdown(openDropdown === 'warehouse' ? null : 'warehouse')}
                                    >
                                        {formData.warehouse_name || "선택해주세요"}
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {openDropdown === 'warehouse' && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                                            {warehouses.map((w) => (
                                                <button
                                                    key={w.id}
                                                    type="button"
                                                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                                    onClick={() => {
                                                        handleWarehouseSelect(w.warehouse);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    {w.warehouse}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">
                                위치
                            </label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2 text-left border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 inline-flex justify-between items-center"
                                        onClick={() => setOpenDropdown(openDropdown === 'shelf' ? null : 'shelf')}
                                    >
                                        {formData.warehouse_shelf || "선택해주세요"}
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    {openDropdown === 'shelf' && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                                            {shelfs.map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                                    onClick={() => {
                                                        handleShelfSelect(s.shelf);
                                                        setOpenDropdown(null);
                                                    }}
                                                >
                                                    {s.shelf}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

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
                                disabled={loading}
                                className={`
                                    px-6 py-2 text-white rounded-md
                                    ${loading 
                                        ? 'bg-blue-400 cursor-not-allowed' 
                                        : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'}
                                `}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        처리 중...
                                    </div>
                                ) : '입고 등록'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
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