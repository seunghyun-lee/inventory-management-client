import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function WarehouseManagement() {
    const [warehouses, setWarehouses] = useState([]);
    const [newWarehouse, setNewWarehouse] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/warehouses`);
            const warehousesData = response.data.data || response.data;
            if (Array.isArray(warehousesData)) {
                setWarehouses(warehousesData);
            } else {
                console.error('Unexpected data structure:', warehousesData);
                setError('창고 데이터 구조가 예상과 다릅니다.');
            }
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            setError('창고 목록을 불러오는데 실패했습니다.');
        }
    };

    const handleAddWarehouse = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/warehouses`, { warehouse: newWarehouse });
            const newWarehouseData = response.data.data || response.data;
            setWarehouses(prevWarehouses => [...prevWarehouses, newWarehouseData]);
            setNewWarehouse('');
            setSuccess('창고가 추가되었습니다.');
        } catch (error) {
            console.error('Error adding warehouse:', error);
            setError('창고 추가에 실패했습니다.');
        }
    };
    
    const handleDeleteWarehouse = async (id) => {
        setError(null);
        setSuccess(null);
        try {
            await axios.delete(`${API_BASE_URL}/api/warehouses/${id}`);
            setWarehouses(prevWarehouses => prevWarehouses.filter(m => m.id !== id));
            setSuccess('창고가 삭제되었습니다.');
        } catch (error) {
            console.error('Error deleting warehouse:', error);
            setError('창고 삭제에 실패했습니다.');
        }
    };

    return (
        <div className="max-w-full">
            <div className="px-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">창고 관리</h2>
                </div>

                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {success}
                    </div>
                )}

                <div className="mb-6">
                    <form onSubmit={handleAddWarehouse} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="새 창고 이름"
                            value={newWarehouse}
                            onChange={(e) => setNewWarehouse(e.target.value)}
                            required
                            className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            추가
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-6 py-3 text-center font-semibold border-b">창고</th>
                                    <th className="px-6 py-3 text-center font-semibold border-b">작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {warehouses.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-center border-b">{m.warehouse}</td>
                                        <td className="px-6 py-3 text-center border-b">
                                            <button 
                                                onClick={() => handleDeleteWarehouse(m.id)}
                                                className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                삭제
                                            </button>
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

export default WarehouseManagement;