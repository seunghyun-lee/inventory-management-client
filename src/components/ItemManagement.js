import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { hasEditPermission } from './roles';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function ItemManagement() {
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const canEdit = hasEditPermission(user?.role);
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [filters, setFilters] = useState({
        item_name: '',
        item_subname: '',
        item_subno: '',
        manufacturer: '',
        price: ''
    });
    const [filteredManufacturers, setFilteredManufacturers] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const manufacturerDropdownRef = useRef(null);
    const [newItem, setNewItem] = useState({
        id: null,
        manufacturer: '',
        item_name: '',
        item_subname: '',
        item_subno: '',
        price: '0'
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchItems();
        fetchManufacturers();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (manufacturerDropdownRef.current && !manufacturerDropdownRef.current.contains(event.target)) {
                setOpenDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filterItems = useCallback(() => {
        let filtered = items;
        
        if (filters.item_name) {
            filtered = filtered.filter(item => 
                item.item_name.toLowerCase().includes(filters.item_name.toLowerCase())
            );
        }
        if (filters.item_subname) {
            filtered = filtered.filter(item => 
                item.item_subname?.toLowerCase().includes(filters.item_subname.toLowerCase())
            );
        }
        if (filters.item_subno) {
            filtered = filtered.filter(item => 
                item.item_subno?.toLowerCase().includes(filters.item_subno.toLowerCase())
            );
        }
        if (filters.manufacturer) {
            filtered = filtered.filter(item => 
                item.manufacturer?.toLowerCase().includes(filters.manufacturer.toLowerCase())
            );
        }
        if (filters.price) {
            filtered = filtered.filter(item => 
                item.price?.toString().includes(filters.price)
            );
        }
        
        setFilteredItems(filtered);
    }, [filters, items]);

    useEffect(() => {
        filterItems();
    }, [filterItems]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/items`);
            const itemData = response.data.data || response.data;
            if (Array.isArray(itemData)) {
                setItems(itemData);
                setFilteredItems(itemData);
            } else {
                console.error('Unexpected data structure:', itemData);
                setError('물품 데이터 구조가 예상과 다릅니다.');
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            setError('물품 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const fetchManufacturers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/manufacturers`);
            const manufacturerData = response.data.data || response.data;
            if (Array.isArray(manufacturerData)) {
                setManufacturers(manufacturerData);
            } else {
                console.error('Unexpected manufacturers data structure:', manufacturerData);
                setError('메이커 데이터를 불러오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('Error fetching manufacturers:', error);
            setError('메이커 목록을 불러오는데 실패했습니다.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'price') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setNewItem(prev => ({
                ...prev,
                [name]: numericValue
            }));
        } else {
            setNewItem(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleManufacturerSelect = (manufacturer) => {
        setNewItem(prev => ({
            ...prev,
            manufacturer: manufacturer
        }));
        setOpenDropdown(false);
    };

    const handleManufacturerChange = (e) => {
        const value = e.target.value;
        setNewItem(prev => ({
            ...prev,
            manufacturer: value
        }));

        if (value.trim()) {
            setFilteredManufacturers(
                manufacturers
                    .map(m => m.manufacturer)
                    .filter(m =>
                        m.toLowerCase().includes(value.toLowerCase())
                    )
            );
            setOpenDropdown(true);
        } else {
            setFilteredManufacturers(manufacturers.map(m => m.manufacturer));
        }
    };

    const handleItemClick = (item) => {
        setNewItem(item);
        setEditMode(true);
    };

    const handleKeyDown = (e) => {
        if (!openDropdown) {
            return;
        }
    
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prevIndex => 
                    prevIndex < filteredManufacturers.length - 1 ? prevIndex + 1 : prevIndex
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prevIndex => 
                    prevIndex > 0 ? prevIndex - 1 : 0
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < filteredManufacturers.length) {
                    handleManufacturerSelect(filteredManufacturers[selectedIndex]);
                }
                break;
            case 'Escape':
                setOpenDropdown(false);
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    };

    const handleBlur = (e) => {
        setTimeout(() => {
            setOpenDropdown(false);
            setSelectedIndex(-1);
        }, 200);
    };

    const resetForm = () => {
        setNewItem({
            id: null,
            manufacturer: '',
            item_name: '',
            item_subname: '',
            item_subno: '',
            price: '0'
        });
        setEditMode(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);
        
        try {
            const submitData = {
                ...newItem,
                price: newItem.price ? parseInt(newItem.price) : 0
            };
    
            if (editMode) {
                const response = await axios.put(`${API_BASE_URL}/api/items/${newItem.id}`, submitData);
                if (response.data.success) {
                    const updatedItemData = response.data.data;
                    setItems(prevItems => 
                        prevItems.map(item => 
                            item.id === newItem.id ? updatedItemData : item
                        )
                    );
                    setSuccess('물품이 수정되었습니다.');
                    resetForm();
                    await fetchItems();
                } else {
                    setError(response.data.error || '물품 수정에 실패했습니다.');
                }
            } else {
                const response = await axios.post(`${API_BASE_URL}/api/items`, submitData);
                const newItemData = response.data;
                setItems(prevItems => [...prevItems, newItemData]);
                setSuccess('물품이 추가되었습니다.');
                resetForm();
                await fetchItems();
            }
        } catch (error) {
            console.error('Error saving item:', error);
            setError(
                error.response?.data?.error || 
                (editMode ? '물품 수정에 실패했습니다.' : '물품 추가에 실패했습니다.')
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteItem = async (id) => {
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/api/items/${id}`);
            await fetchItems(); // 리스트 갱신
            setSuccess('물품이 삭제되었습니다.');
        } catch (error) {
            console.error('Error deleting item:', error);
            setError('물품 삭제에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="mb-4">
                <h2 className="text-lg font-semibold">물품 관리</h2>
            </div>

            {error && (
                <div className="mb-2 bg-red-100 border border-red-400 text-red-700 px-2 py-1 rounded text-xs">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-2 bg-green-100 border border-green-400 text-green-700 px-2 py-1 rounded text-xs">
                    {success}
                </div>
            )}

            {canEdit && (
                <div className="mb-4">
                    <form onSubmit={handleSubmit} className="grid grid-cols-7 gap-2">
                        <input
                            type="text"
                            name="item_name"
                            placeholder="물품명"
                            value={newItem.item_name}
                            onChange={handleInputChange}
                            required
                            className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="item_subname"
                            placeholder="뒷부호"
                            value={newItem.item_subname}
                            onChange={handleInputChange}
                            className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="item_subno"
                            placeholder="추가번호"
                            value={newItem.item_subno}
                            onChange={handleInputChange}
                            className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="relative" ref={manufacturerDropdownRef}>
                            <input
                                type="text"
                                name="manufacturer"
                                placeholder="메이커 선택 또는 입력"
                                value={newItem.manufacturer}
                                onChange={handleManufacturerChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => {
                                    setOpenDropdown(true);
                                    setFilteredManufacturers(manufacturers.map(m => m.manufacturer));
                                    setSelectedIndex(-1);
                                }}
                                onBlur={handleBlur}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                className="w-full px-2 py-1 text-sm border rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            {openDropdown && (
                                <div className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white border rounded-md shadow-lg">
                                    {filteredManufacturers.map((manufacturer, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`block w-full px-2 py-1 text-left text-sm 
                                                ${index === selectedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                            onClick={() => {
                                                handleManufacturerSelect(manufacturer);
                                                setFilteredManufacturers([]);
                                                setSelectedIndex(-1);
                                            }}
                                            // 마우스 오버 시 해당 항목 선택
                                            onMouseEnter={() => setSelectedIndex(index)}
                                        >
                                            {manufacturer}
                                        </button>
                                    ))}
                                    {filteredManufacturers.length === 0 && (
                                        <div className="px-2 py-1 text-sm text-gray-500">
                                            검색 결과가 없습니다
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            name="price"
                            placeholder="가격"
                            value={newItem.price}
                            onChange={handleInputChange}
                            className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                        />
                        <button
                            type="submit"
                            className={`px-2 py-1 text-sm text-white rounded focus:outline-none focus:ring-1 ${
                                editMode ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                            disabled={loading}
                        >
                            {loading ? '처리중...' : editMode ? '수정' : '추가'}
                        </button>
                        {editMode && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-2 py-1 text-sm text-white bg-gray-500 rounded hover:bg-gray-600 focus:outline-none focus:ring-1"
                            >
                                취소
                            </button>
                        )}
                    </form>
                </div>
            )}

            {/* 필터링 입력 필드 */}
            <div className="mb-4 grid grid-cols-5 gap-2">
                <input
                    type="text"
                    name="item_name"
                    placeholder="물품명 필터"
                    value={filters.item_name}
                    onChange={handleFilterChange}
                    className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                    type="text"
                    name="item_subname"
                    placeholder="뒷부호 필터"
                    value={filters.item_subname}
                    onChange={handleFilterChange}
                    className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                    type="text"
                    name="item_subno"
                    placeholder="추가번호 필터"
                    value={filters.item_subno}
                    onChange={handleFilterChange}
                    className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                    type="text"
                    name="manufacturer"
                    placeholder="메이커 필터"
                    value={filters.manufacturer}
                    onChange={handleFilterChange}
                    className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                    type="text"
                    name="price"
                    placeholder="가격 필터"
                    value={filters.price}
                    onChange={handleFilterChange}
                    className="px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                />
            </div>

            <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col relative">
                {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr className="text-xs">
                            <th className="w-[25%] px-3 py-2 text-left font-semibold border-b">물품명</th>
                            <th className="w-[15%] px-3 py-2 text-left font-semibold border-b">뒷부호</th>
                            <th className="w-[15%] px-3 py-2 text-left font-semibold border-b">추가번호</th>
                            <th className="w-[20%] px-3 py-2 text-left font-semibold border-b">메이커</th>
                            <th className="w-[15%] px-3 py-2 text-right font-semibold border-b">가격</th>
                            {canEdit && (
                                <th className="w-[10%] px-3 py-2 text-center font-semibold border-b">작업</th>
                            )}
                        </tr>
                    </thead>
                </table>
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="text-xs bg-white">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td 
                                        className="w-[25%] px-3 py-2 text-left border-b cursor-pointer hover:text-blue-600"
                                        onClick={() => handleItemClick(item)}
                                    >
                                        {item.item_name}
                                    </td>
                                    <td className="w-[15%] px-3 py-2 text-left border-b">{item.item_subname}</td>
                                    <td className="w-[15%] px-3 py-2 text-left border-b">{item.item_subno}</td>
                                    <td className="w-[20%] px-3 py-2 text-left border-b">{item.manufacturer}</td>
                                    <td className="w-[15%] px-3 py-2 text-right border-b">
                                        <span>{item.price ? parseInt(item.price).toLocaleString() : '0'}원</span>
                                    </td>
                                    {canEdit && (
                                        <td className="w-[10%] px-3 py-2 text-center border-b">
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="px-2 py-0.5 text-xs text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-500"
                                                disabled={loading}
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ItemManagement;