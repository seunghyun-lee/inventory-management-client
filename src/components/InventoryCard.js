import React from 'react';
import { useNavigate } from 'react-router-dom';

const InventoryCard = ({ item }) => {
    const navigate = useNavigate();

    const handleOutbound = () => {
        navigate('/outbound', { state: {item} });
    };
    
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 p-4 relative">
            <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
            <div className="text-gray-600">
                <p className="mb-1">메이커: {item.manufacturer}</p>
                <p className="mb-1">수량: {item.quantiry}</p>
                <p className="mb-1">박스: {item.boxes}</p>
            </div>
            <button
                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors"
                onClick={handleOutbound}
            >
                출고
            </button>
        </div>
    );
};

export default InventoryCard;