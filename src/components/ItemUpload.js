import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function ItemUpload() {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);
        setSuccess(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('파일을 선택해주세요.');
            return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
        
        setLoading(true);
        setError(null);
        setSuccess(null);
    
        try {
            // const response = await axios.post(`${API_BASE_URL}/api/items/upload/inbound`, formData, {
            const response = await axios.post(`${API_BASE_URL}/api/items/upload/outbound?skipCheck=true`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            if (response.data.success) {
                setSuccess(`${response.data.processed}개의 아이템이 성공적으로 업로드되었습니다.`);
                if (response.data.errors && response.data.errors.length > 0) {
                    setError(`일부 데이터 처리 중 오류가 발생했습니다: ${response.data.errors.map(e => e.error).join(', ')}`);
                }
            } else {
                setError(response.data.error || '업로드 중 오류가 발생했습니다.');
            }
    
            setFile(null);
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = '';
        } catch (error) {
            console.error('Error uploading file:', error);
            setError(error.response?.data?.error || '파일 업로드 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            <div className="mb-4">
                <h2 className="text-lg font-semibold">아이템 CSV 업로드</h2>
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

            <form onSubmit={handleUpload} className="flex flex-col gap-4">
                <div className="flex gap-2 items-center">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".csv"
                        className="flex-1 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={loading || !file}
                        className={`px-4 py-1 text-sm text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500 
                            ${loading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                    >
                        {loading ? '업로드 중...' : '업로드'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ItemUpload;