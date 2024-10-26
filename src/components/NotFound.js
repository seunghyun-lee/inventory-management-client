import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="fixed inset-0 flex flex-col bg-gray-50">
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-yellow-50 border border-yellow-400 rounded-lg p-6 text-center">
                        <h1 className="text-xl font-bold text-yellow-700 mb-2">
                            404 - 페이지를 찾을 수 없습니다
                        </h1>
                        <p className="text-yellow-600 mb-6">
                            죄송합니다. 요청하신 페이지를 찾을 수 없습니다.
                            <br />
                            URL을 확인하시거나 홈페이지로 돌아가세요.
                        </p>
                        <Link 
                            to="/"
                            className="inline-block px-6 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            홈페이지로 돌아가기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotFound;