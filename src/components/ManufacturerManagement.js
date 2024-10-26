import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function ManufacturerManagement() {
    const [manufacturers, setManufacturers] = useState([]);
    const [newManufacturer, setNewManufacturer] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchManufacturers();
    }, []);

    const fetchManufacturers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/manufacturers`);
            console.log('Server response:', response.data);
            const manufacturersData = response.data.data || response.data;
            if (Array.isArray(manufacturersData)) {
                setManufacturers(manufacturersData);
            } else {
                console.error('Unexpected data structure:', manufacturersData);
                setError('제조사 데이터 구조가 예상과 다릅니다.');
                setManufacturers([]);
            }
        } catch (error) {
            console.error('Error fetching manufacturers:', error);
            setError('제조사 목록을 불러오는데 실패했습니다.');
            setManufacturers([]);
        }
    };

    const handleAddManufacturer = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/manufacturers`, { manufacturer: newManufacturer });
            console.log('Add manufacturer response:', response.data);
            const newManufacturerData = response.data.data || response.data;
            setManufacturers(prevManufacturers => [...prevManufacturers, newManufacturerData]);
            setNewManufacturer('');
            setSuccess('제조사가 추가되었습니다.');
        } catch (error) {
            console.error('Error adding manufacturer:', error);
            setError('제조사 추가에 실패했습니다.');
        }
    };
    
    const handleDeleteManufacturer = async (id) => {
        setError(null);
        setSuccess(null);
        try {
            await axios.delete(`${API_BASE_URL}/api/manufacturers/${id}`);
            setManufacturers(prevManufacturers => prevManufacturers.filter(m => m.id !== id));
            setSuccess('제조사가 삭제되었습니다.');
        } catch (error) {
            console.error('Error deleting manufacturer:', error);
            setError('제조사 삭제에 실패했습니다.');
        }
    };

    return (
        <div className="max-w-full">
            <div className="px-4">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold">메이커 관리</h2>
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
                    <form onSubmit={handleAddManufacturer} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="새 제조사 이름"
                            value={newManufacturer}
                            onChange={(e) => setNewManufacturer(e.target.value)}
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
                                    <th className="px-6 py-3 text-center font-semibold border-b">제조사</th>
                                    <th className="px-6 py-3 text-center font-semibold border-b">작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {manufacturers.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-center border-b">{m.manufacturer}</td>
                                        <td className="px-6 py-3 text-center border-b">
                                            <button 
                                                onClick={() => handleDeleteManufacturer(m.id)}
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

export default ManufacturerManagement;