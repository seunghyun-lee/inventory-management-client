import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function OutboundForm() {
    const { itemId } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        client: '',
        total_quantity: '',
        handler_name: '',
        description: '',
        warehouse_name: '',
        warehouse_shelf: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const fetchItemDetails = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/inventory/${itemId}`);
            setItem(response.data);
            setFormData(prevData => ({
                ...prevData,
                warehouse_name: response.data.warehouse_name || '',
                warehouse_shelf: response.data.warehouse_shelf || ''
            }));
        } catch (error) {
            console.error('Error fetching item details:', error);
            setError('품목 정보를 불러오는데 실패했습니다. 나중에 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    }, [itemId]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setFormData(prevData => ({
            ...prevData,
            handler_name: user ? user.handler_name : ''
        }));
        fetchItemDetails();
    }, [fetchItemDetails]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await axios.post(`${API_BASE_URL}/api/transactions/outbound`, {
                item_id: parseInt(itemId, 10),
                ...formData,
                total_quantity: parseInt(formData.total_quantity, 10)
            });
            navigate('/');
        } catch (error) {
            console.error('출고 처리 중 오류 발생:', error);
            if (error.response && error.response.data) {
                setError(`출고 처리 중 오류 발생: ${error.response.data.error}`);
            } else {
                setError('출고 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 sm:p-6 md:p-6 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 sm:p-6 md:p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }
    
    if (!item) {
        return (
            <div className="min-h-screen bg-gray-50 sm:p-6 md:p-6">
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                    품목을 찾을 수 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 sm:p-6 md:p-6">
            <div className="w-full h-full max-w-4xl mx-auto bg-white rounded-none sm:rounded-lg shadow-md">
                <div className="px-4 sm:px-6 py-4 border-b">
                    <h2 className="text-2xl font-bold">출고 등록</h2>
                </div>
                <div className="p-4 sm:p-6">
                    {error && (
                        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">날짜</label>
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
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">거래처</label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="text"
                                    name="client"
                                    value={formData.client}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">물품명</label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="text"
                                    value={item.item_name}
                                    readOnly
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">재고수량</label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="text"
                                    value={item.current_quantity}
                                    readOnly
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">출고수량</label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="number"
                                    name="total_quantity"
                                    value={formData.total_quantity}
                                    onChange={handleChange}
                                    min="1"
                                    max={item.current_quantity}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">뒷부호</label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="text"
                                    value={item.item_subname}
                                    readOnly
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-600"
                                />
                            </div>
                        </div>

                        {/* 메이커 */}
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">메이커</label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="text"
                                    value={item.manufacturer}
                                    readOnly
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">창고</label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="text"
                                    name="warehouse_name"
                                    value={formData.warehouse_name}
                                    readOnly
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">위치</label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="text"
                                    name="warehouse_shelf"
                                    value={formData.warehouse_shelf}
                                    readOnly
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">메모</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* 담당자 */}
                        <div className="grid grid-cols-12 gap-4 items-center">
                            <label className="col-span-3 sm:col-span-3 md:col-span-2 text-sm font-medium text-gray-700">담당자</label>
                            <div className="col-span-9 sm:col-span-9 md:col-span-10">
                                <input
                                    type="text"
                                    name="handler_name"
                                    value={formData.handler_name}
                                    onChange={handleChange}
                                    required
                                    readOnly
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 mt-8">
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`
                                    px-6 py-2 text-white rounded-md
                                    ${submitting 
                                        ? 'bg-blue-400 cursor-not-allowed' 
                                        : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'}
                                `}
                            >
                                {submitting ? (
                                    <div className="flex items-center">
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        처리 중...
                                    </div>
                                ) : '출고 등록'}
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

export default OutboundForm;