import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { hasEditPermission } from './roles';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function ShelfManagement() {
    const [user] = useState(JSON.parse(localStorage.getItem('user')));
    const canEdit = hasEditPermission(user?.role);
    const [shelfs, setShelfs] = useState([]);
    const [newShelf, setNewShelf] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchShelfs();
    }, []);

    const fetchShelfs = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/shelfs`);
            const shelfData = response.data.data || response.data;
            if (Array.isArray(shelfData)) {
                setShelfs(response.data);
            } else {
                console.error('Unexpected data structure:', shelfData);
                setError('위치 데이터 구조가 예상과 다릅니다.');
            }
        } catch (error) {
            console.error('Error fetching shelfs:', error);
            setError('위치 목록을 불러오는데 실패했습니다.');
        }
    };

    const handleAddShelf = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/shelfs`, { shelf: newShelf });
            const newShelfData = response.data.data || response.data;
            setShelfs(prevShelfs => [...prevShelfs, newShelfData]);
            setNewShelf('');
            setSuccess('위치가 추가되었습니다.');
        } catch (error) {
            console.error('Error adding shelf:', error);
            setError('위치 추가에 실패했습니다.');
        }
    };
    
    const handleDeleteShelf = async (id) => {
        setError(null);
        setSuccess(null);
        try {
            await axios.delete(`${API_BASE_URL}/api/shelfs/${id}`);
            setShelfs(prevShelfs => prevShelfs.filter(m => m.id !== id));
            setSuccess('위치가 삭제되었습니다.');
        } catch (error) {
            console.error('Error deleting shelf:', error);
            setError('위치 삭제에 실패했습니다.');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="mb-4">
                <h2 className="text-lg font-semibold">위치 관리</h2>
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
                    <form onSubmit={handleAddShelf} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="새 위치 이름"
                            value={newShelf}
                            onChange={(e) => setNewShelf(e.target.value)}
                            required
                            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            추가
                        </button>
                    </form>
                </div>
            )}

            <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
                {/* 고정 헤더 테이블 */}
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr className="text-xs">
                            <th className="w-[90%] px-3 py-2 text-center font-semibold border-b">위치</th>
                            {canEdit && (
                                <th className="w-[10%] px-3 py-2 text-center font-semibold border-b">작업</th>
                            )}
                        </tr>
                    </thead>
                </table>

                {/* 스크롤 가능한 바디 테이블 */}
                <div className="flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="text-xs bg-white">
                            {shelfs.map((m) => (
                                <tr key={m.id} className="hover:bg-gray-50">
                                    <td className="w-[90%] px-3 py-2 text-center border-b">
                                        {m.shelf}
                                    </td>
                                    {canEdit && (
                                        <td className="w-[10%] px-3 py-2 text-center border-b">
                                            <button 
                                                onClick={() => handleDeleteShelf(m.id)}
                                                className="px-2 py-0.5 text-xs text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-500"
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

export default ShelfManagement;