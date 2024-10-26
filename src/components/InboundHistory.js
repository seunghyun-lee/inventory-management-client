import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function InboundHistory() {
    const [inboundHistory, setInboundHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(getSixMonthsAgo());
    const [endDate, setEndDate] = useState(getToday());

    const fetchInboundHistory = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/inbound-history`, {
                params: { startDate, endDate }
            });
            setInboundHistory(response.data);
        } catch (error) {
            console.error('입고 이력을 불러오는데 실패했습니다:', error);
            setError('입고 이력을 불러오는데 실패했습니다. 나중에 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchInboundHistory();
    }, [fetchInboundHistory]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInboundHistory();
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
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">입고 이력</h2>
                </div>
                
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            aria-label="시작 날짜"
                            className="w-full sm:w-auto px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            aria-label="마지막 날짜"
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

                <div className="bg-white rounded-lg shadow">
                    <div className="overflow-x-auto">
                        <div className="min-w-[800px] lg:min-w-full">
                            <div className="grid grid-cols-10 bg-gray-100 font-semibold text-center py-2 text-sm">
                                <div className="px-2">입고날짜</div>
                                <div className="px-2">공급업체</div>
                                <div className="px-2">물품명</div>
                                <div className="px-2">수량</div>
                                <div className="px-2">뒷부호</div>
                                <div className="px-2">메이커</div>
                                <div className="px-2">창고</div>
                                <div className="px-2">위치</div>
                                <div className="px-2">메모</div>
                                <div className="px-2">담당자</div>
                            </div>
                            <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
                                {inboundHistory.map((item, index) => (
                                    <div key={index} className="grid grid-cols-10 text-center items-center py-2 border-b text-sm hover:bg-gray-50">
                                        <div className="px-2 truncate">{formatDate(item.date)}</div>
                                        <div className="px-2 truncate">{item.supplier}</div>
                                        <div className="px-2 truncate">{item.item_name}</div>
                                        <div className="px-2 truncate">{item.total_quantity}</div>
                                        <div className="px-2 truncate">{item.item_subname}</div>
                                        <div className="px-2 truncate">{item.manufacturer}</div>
                                        <div className="px-2 truncate">{item.warehouse_name}</div>
                                        <div className="px-2 truncate">{item.warehouse_shelf}</div>
                                        <div className="px-2 truncate">{item.description}</div>
                                        <div className="px-2 truncate">{item.handler_name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InboundHistory;