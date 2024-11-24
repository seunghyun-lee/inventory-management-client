import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const HOLIDAY_API_KEY = process.env.REACT_APP_HOLIDAY_API_KEY;
const HOLIDAY_API_BASE_URL = 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo';


const CalendarComponent = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState('month');
    const [events, setEvents] = useState([]);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showViewDropdown, setShowViewDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [error, setError] = useState(null); // 에러 메시지를 표시하기 위해 유지
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태를 표시하기 위해 유지
    const [holidays, setHolidays] = useState({});

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowViewDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        let start, end;
        
        switch (view) {
            case 'month':
                // 해당 월의 첫날
                start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                // 다음 달의 첫날
                end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                break;
            case 'week':
                start = new Date(currentDate);
                // 현재 날짜의 요일만큼 빼서 그 주의 첫날(일요일)을 구함
                start.setDate(start.getDate() - start.getDay());
                start.setHours(0, 0, 0, 0);
                
                end = new Date(start);
                // 6일을 더해서 토요일을 구함
                end.setDate(end.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;
            case 'day':
                start = new Date(currentDate);
                start.setHours(0, 0, 0, 0);
                
                end = new Date(currentDate);
                end.setHours(23, 59, 59, 999);
                break;
            default:
        }
        
        // 시작 시간과 종료 시간을 정확한 ISO 문자열로 변환
        const startISO = start.toISOString();
        const endISO = end.toISOString();
        
        console.log('Fetching events for period:', { startISO, endISO });
        fetchEvents(start, end);
    }, [view, currentDate]);

    const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);
    const currentMonth = useMemo(() => currentDate.getMonth() + 1, [currentDate]);  

    const fetchHolidays = useCallback(async (year, month) => {        
        if (!HOLIDAY_API_KEY) {
            console.error('Holiday API Key is not defined');
            return;
        }
        try {
            const paddedMonth = month.toString().padStart(2, '0');
            const response = await axios.get(
                `${HOLIDAY_API_BASE_URL}?serviceKey=${HOLIDAY_API_KEY}&solYear=${year}&solMonth=${paddedMonth}&_type=json`,
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const items = response.data.response.body.items;
            const newHolidays = {};
            
            if (items && items.item) {
                // item이 배열인 경우
                if (Array.isArray(items.item)) {
                    items.item.forEach(item => {
                        if (item.isHoliday === 'Y') {
                            const locdate = item.locdate.toString();
                            // 날짜 형식을 YYYY-MM-DD로 변환
                            const dateKey = `${locdate.slice(0, 4)}-${locdate.slice(4, 6)}-${locdate.slice(6, 8)}`;
                            newHolidays[dateKey] = item.dateName;
                        }
                    });
                } 
                // item이 단일 객체인 경우
                else if (items.item.isHoliday === 'Y') {
                    const locdate = items.item.locdate.toString();
                    // 날짜 형식을 YYYY-MM-DD로 변환
                    const dateKey = `${locdate.slice(0, 4)}-${locdate.slice(4, 6)}-${locdate.slice(6, 8)}`;
                    newHolidays[dateKey] = items.item.dateName;
                }
            }
    
            console.log('Fetched Holidays:', newHolidays); // 디버깅용
            setHolidays(prev => ({...prev, ...newHolidays}));
        } catch (error) {
            console.error('공휴일 데이터 조회 실패:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
            }
        }
    }, []);

    useEffect(() => {
        fetchHolidays(currentYear, currentMonth);
    }, [currentYear, currentMonth, fetchHolidays]); 

    const isHoliday = (date) => {
        // 날짜를 YYYY-MM-DD 형식으로 변환
        const dateKey = format(date, 'yyyy-MM-dd');
        return holidays[dateKey];
    };

    const fetchEvents = async (start, end) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`${API_BASE_URL}/api/events`, {
                params: {
                    start: start.toISOString(),
                    end: end.toISOString()
                }
            });
            
            console.log('Fetched events:', response.data);
            // 응답이 배열이 아니면 빈 배열 사용
            setEvents(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching events:', error);
            // 에러 발생 시 빈 배열로 설정
            setEvents([]);
            // UI에 에러 메시지를 표시하지 않음
        } finally {
            setIsLoading(false);
        }
    };
    
    const createEvent = async (eventData) => {
        try {
            let startTime, endTime;
    
            // 하루종일 일정인 경우
            if (eventData.allDay) {
                startTime = new Date(eventData.startDate);
                startTime.setHours(0, 0, 0, 0);
                
                endTime = new Date(eventData.endDate);
                endTime.setHours(23, 59, 59, 999);
            } else {
                // 시간이 지정된 일정인 경우
                const [startHours, startMinutes] = eventData.startTime.split(':').map(Number);
                const [endHours, endMinutes] = eventData.endTime.split(':').map(Number);
                
                startTime = new Date(eventData.date);
                startTime.setHours(startHours, startMinutes, 0, 0);
                
                endTime = new Date(eventData.date);
                endTime.setHours(endHours, endMinutes, 0, 0);
    
                // 종료 시간이 시작 시간보다 이전인 경우
                if (endTime < startTime) {
                    throw new Error('종료 시간은 시작 시간 이후여야 합니다.');
                }
            }
    
            // 날짜 유효성 검사
            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                throw new Error('잘못된 날짜/시간 형식입니다.');
            }
    
            console.log('Creating event with data:', {
                ...eventData,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
            });
    
            const response = await axios.post(`${API_BASE_URL}/api/events`, {
                title: eventData.title,
                description: eventData.description,
                all_day: eventData.allDay,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                author: eventData.author,
                location: eventData.location || '',
                notification: eventData.notification || false,
                color: eventData.color || '#1a73e8'
            });
    
            console.log('Server response:', response.data);
            
            if (response.data) {
                setEvents(prev => [...prev, response.data]);
                setShowEventModal(false);
                setError(null);
            }
        } catch (error) {
            console.error('Error creating event:', error);
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else if (error.message) {
                setError(error.message);
            } else {
                setError('일정 생성에 실패했습니다.');
            }
            throw error;
        }
    };

    const handleDeleteEvent = async (event) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/events/${event.id}`);
            setEvents(prev => prev.filter(e => e.id !== event.id));
            setSelectedEvent(null);
        } catch (error) {
            console.error('Error deleting event:', error);
            setError('일정 삭제에 실패했습니다.');
        }
    };

    // 이벤트 수정 준비
    const handleEditEvent = () => {
        setIsEditMode(true);
    };

    // 이벤트 클릭 핸들러
    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsEditMode(false);
    };

    // 이벤트 모달 닫기
    const handleCloseModal = () => {
        setSelectedEvent(null);
        setIsEditMode(false);
        setShowEventModal(false);
    };

    // 이벤트 수정 제출
    const handleUpdateEvent = async (updatedData) => {
        try {
            console.log('Updating event data:', updatedData);
            
            // 날짜 객체 생성 및 검증
            const startTime = new Date(updatedData.start_time);
            const endTime = new Date(updatedData.end_time);
    
            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                throw new Error('잘못된 날짜/시간 형식입니다.');
            }
    
            const formattedData = {
                title: updatedData.title,
                description: updatedData.description,
                all_day: updatedData.allDay,
                start_time: startTime.toISOString(),
                end_time: endTime.toISOString(),
                author: updatedData.author,
                location: updatedData.location || '',
                notification: updatedData.notification || false,
                color: updatedData.color || '#1a73e8'
            };
    
            console.log('Sending formatted data:', formattedData);
    
            const response = await axios.put(
                `${API_BASE_URL}/api/events/${selectedEvent.id}`,
                formattedData
            );
    
            console.log('Server response:', response.data);
    
            // 이벤트 목록 업데이트
            setEvents(prev => prev.map(event => 
                event.id === selectedEvent.id ? response.data : event
            ));
    
            // 모달 닫기 및 상태 초기화
            setSelectedEvent(null);
            setIsEditMode(false);
            setError(null);
        } catch (error) {
            console.error('Error updating event:', error);
            setError(error.response?.data?.error || error.message || '일정 수정에 실패했습니다.');
        }
    };

    const handleViewChange = (newView) => {
        setView(newView);
        setShowViewDropdown(false);
    };

    const viewOptions = {
        month: '월',
        week: '주',
        day: '일'
    };

    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 0 || day === 6; // 0은 일요일, 6은 토요일
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const moveNext = () => {
        switch (view) {
            case 'month':
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
                break;
            case 'week':
                const nextWeek = new Date(currentDate);
                nextWeek.setDate(currentDate.getDate() + 7);
                setCurrentDate(nextWeek);
                break;
            case 'day':
                const nextDay = new Date(currentDate);
                nextDay.setDate(currentDate.getDate() + 1);
                setCurrentDate(nextDay);
                break;
            default:
        }
    };

    const movePrev = () => {
        switch (view) {
            case 'month':
                setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
                break;
            case 'week':
                const prevWeek = new Date(currentDate);
                prevWeek.setDate(currentDate.getDate() - 7);
                setCurrentDate(prevWeek);
                break;
            case 'day':
                const prevDay = new Date(currentDate);
                prevDay.setDate(currentDate.getDate() - 1);
                setCurrentDate(prevDay);
                break;
            default:
        }
    };

    const getDaysInMonth = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        
        for (let i = 0; i < firstDay.getDay(); i++) {
            const prevMonthLastDay = new Date(year, month, 0).getDate();
            days.push({
                date: new Date(year, month - 1, prevMonthLastDay - firstDay.getDay() + i + 1),
                currentMonth: false
            });
        }
        
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push({
                date: new Date(year, month, i),
                currentMonth: true
            });
        }
        
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                currentMonth: false
            });
        }
        
        return days;
    };

    const getDaysInWeek = () => {
        // 현재 날짜의 복사본 생성
        const curr = new Date(currentDate);
        // 현재 날짜의 요일(0: 일요일, 1: 월요일, ...)
        const currentDay = curr.getDay();
        // 일요일까지 날짜를 빼서 그 주의 시작일을 구함
        curr.setDate(curr.getDate() - currentDay);
        
        const days = [];
        // 일요일부터 시작해서 7일을 추가
        for (let i = 0; i < 7; i++) {
            const day = new Date(curr);
            day.setDate(curr.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const getTimeSlots = () => {
        const slots = [];
        for (let i = 0; i < 24; i++) {
            slots.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return slots;
    };

    const isEventInDate = (event, date) => {
        const eventStart = new Date(event.start_time);
        const eventEnd = new Date(event.end_time);
        const currentDate = new Date(date);
        
        // 하루종일 일정인 경우 날짜만 비교
        if (event.all_day) {
            // 시간을 00:00:00으로 설정하여 날짜만 비교
            currentDate.setHours(0, 0, 0, 0);
            const startDate = new Date(eventStart);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(eventEnd);
            endDate.setHours(0, 0, 0, 0);
            return currentDate >= startDate && currentDate <= endDate;
        }
        
        // 시간이 지정된 일정인 경우 시간까지 고려하여 비교
        // 현재 날짜의 시작과 끝 시간 설정
        const dateStart = new Date(currentDate.setHours(0, 0, 0, 0));
        const dateEnd = new Date(currentDate.setHours(23, 59, 59, 999));
        
        // 이벤트가 해당 날짜의 시간 범위와 겹치는지 확인
        return eventStart <= dateEnd && eventEnd >= dateStart;
    };

    const renderEvent = (event, day, index) => {
        const eventStart = new Date(event.start_time);
        const eventEnd = new Date(event.end_time);
        const currentDate = new Date(day.date);
        
        currentDate.setHours(0, 0, 0, 0);
        const startDate = new Date(eventStart);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(eventEnd);
        endDate.setHours(0, 0, 0, 0);
    
        const isMultiDay = endDate > startDate;
        const isStartDay = currentDate.getTime() === startDate.getTime();
        const isEndDay = currentDate.getTime() === endDate.getTime();
    
        return (
            <div
                key={`${event.id}-${index}`}
                className={`h-5 px-1.5 flex items-center cursor-pointer transition-all hover:opacity-90
                    ${isMultiDay ? (
                        isStartDay
                            ? 'rounded-l-md rounded-r-none'
                            : isEndDay
                                ? 'rounded-r-md rounded-l-none'
                                : 'rounded-none'
                    ) : 'rounded-md'}
                    ${event.is_completed ? 'opacity-50' : ''}`}
                style={{ 
                    backgroundColor: event.color,
                    color: 'white',
                    marginBottom: '1px',
                    minHeight: '20px',
                }}
                onClick={() => handleEventClick(event)}
                title={`${event.title}\n${event.description}`}
            >
                {(isStartDay || !isMultiDay) ? (
                    <div className="flex items-center w-full">
                        <span className={`text-[11px] font-medium truncate ${
                            event.is_completed ? 'line-through' : ''
                        }`}>
                            {event.title}
                        </span>
                    </div>
                ) : (
                    <div className="w-full h-full">&nbsp;</div>
                )}
            </div>
        );
    };

    const ErrorMessage = () => {
        if (!error) return null;
        
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <span className="block sm:inline">{error}</span>
                <span
                    className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    onClick={() => setError(null)}
                >
                    <svg
                        className="fill-current h-6 w-6 text-red-500"
                        role="button"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                    >
                        <title>Close</title>
                        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                    </svg>
                </span>
            </div>
        );
    };

    const LoadingIndicator = () => {
        if (!isLoading) return null;
        
        return (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    };

    const calculateEventPosition = (event) => {
        const start = new Date(event.start_time);
        const end = new Date(event.end_time);
        
        // 시작 시간을 분으로 변환 (예: 9:30 => 570)
        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const endMinutes = end.getHours() * 60 + end.getMinutes();
        
        // 하루의 전체 높이를 1440분(24시간)으로 나누어 비율 계산
        const top = (startMinutes / 1440) * 100;
        const height = ((endMinutes - startMinutes) / 1440) * 100;
        
        return { top, height };
    };

    const EventDetail = ({ event, onClose, onEdit, onDelete }) => {
        // 날짜 포맷팅 함수
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
            });
        };
    
        // 시간 포맷팅 함수
        const formatDateTime = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        };

        const handleToggleCompletion = async () => {
            try {
                const response = await axios.patch(
                    `${API_BASE_URL}/api/events/${event.id}/toggle-completion`
                );
                if (response.data) {
                    // 이벤트 목록 업데이트
                    setEvents(prev => prev.map(e => 
                        e.id === event.id ? response.data : e
                    ));
                    onClose();
                }
            } catch (error) {
                console.error('Error toggling completion status:', error);
                setError('일정 상태 업데이트에 실패했습니다.');
            }
        };    
    
        return (
            <div className="space-y-6 p-6 bg-white rounded-lg">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">제목</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                        {event.title}
                    </div>
                </div>
    
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">일정</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                        {event.all_day ? (
                            // 하루종일 일정인 경우
                            `${formatDate(event.start_time)} - ${formatDate(event.end_time)}`
                        ) : (
                            // 시간 지정 일정인 경우
                            `${formatDateTime(event.start_time)} - ${formatDateTime(event.end_time)}`
                        )}
                    </div>
                </div>
    
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">내용</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 min-h-[100px] whitespace-pre-wrap">
                        {event.description}
                    </div>
                </div>
    
                {event.location && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">위치</label>
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                            {event.location}
                        </div>
                    </div>
                )}
    
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">작성자</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                        {event.author}
                    </div>
                </div>
    
                <div className="flex justify-between items-center pt-4">

                    <button
                        onClick={handleToggleCompletion}
                        className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            event.is_completed
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500'
                                : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-500'
                        }`}
                    >
                        {event.is_completed ? '완료됨' : '완료하기'}
                    </button>

                    <div className="flex space-x-2">
                        <button
                            onClick={onDelete}
                            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            삭제
                        </button>
                        <button
                            onClick={onEdit}
                            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            수정
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const EventForm = ({ initialData, onSubmit, onCancel }) => {        
        const [eventData, setEventData] = useState(() => {
            if (initialData) {
                const startDate = new Date(initialData.start_time);
                const endDate = new Date(initialData.end_time);
                
                return {
                    title: initialData.title,
                    description: initialData.description,
                    allDay: initialData.all_day,
                    date: startDate.toISOString().split('T')[0],
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    startTime: startDate.toTimeString().slice(0, 5),
                    endTime: endDate.toTimeString().slice(0, 5),
                    author: initialData.author,
                    location: initialData.location || '',
                    notification: initialData.notification || false,
                    color: initialData.color || '#1a73e8'
                };
            }
            
            const now = new Date();
            const later = new Date(now.getTime() + 60 * 60 * 1000); // 1시간 후
            
            return {
                title: '',
                description: '',
                allDay: false,
                date: now.toISOString().split('T')[0],
                startDate: now.toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0],
                startTime: now.toTimeString().slice(0, 5),
                endTime: later.toTimeString().slice(0, 5),
                author: JSON.parse(localStorage.getItem('user'))?.handler_name || '',
                location: '',
                notification: false,
                color: '#1a73e8'
            };
        });
        const [showStartTimeDropdown, setShowStartTimeDropdown] = useState(false);
        const [showEndTimeDropdown, setShowEndTimeDropdown] = useState(false);
        const startTimeRef = useRef(null);
        const endTimeRef = useRef(null);
    
        const timeOptions = useMemo(() => {
            const options = [];
            for (let hour = 0; hour < 24; hour++) {
                for (let minute = 0; minute < 60; minute += 15) {
                    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    options.push(timeString);
                }
            }
            return options;
        }, []);
    
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (startTimeRef.current && !startTimeRef.current.contains(event.target)) {
                    setShowStartTimeDropdown(false);
                }
                if (endTimeRef.current && !endTimeRef.current.contains(event.target)) {
                    setShowEndTimeDropdown(false);
                }
            };
    
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);
    
        const handleSubmit = async (e) => {
            e.preventDefault();
            setError(null);
            
            try {
                // 필수 필드 검증
                const requiredFields = ['title', 'description', 'author'];
                const missingFields = requiredFields.filter(field => !eventData[field]);
        
                if (missingFields.length > 0) {
                    setError(`다음 필드를 입력해주세요: ${missingFields.join(', ')}`);
                    return;
                }
        
                let startDateTime, endDateTime;
        
                if (eventData.allDay) {
                    startDateTime = new Date(eventData.startDate);
                    startDateTime.setHours(0, 0, 0, 0);
                    
                    endDateTime = new Date(eventData.endDate);
                    endDateTime.setHours(23, 59, 59, 999);
                } else {
                    const [startHours, startMinutes] = eventData.startTime.split(':').map(Number);
                    const [endHours, endMinutes] = eventData.endTime.split(':').map(Number);
                    
                    startDateTime = new Date(eventData.date);
                    startDateTime.setHours(startHours, startMinutes, 0, 0);
                    
                    endDateTime = new Date(eventData.date);
                    endDateTime.setHours(endHours, endMinutes, 0, 0);
                }
        
                // 날짜 유효성 검사
                if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                    setError('잘못된 날짜/시간입니다.');
                    return;
                }
        
                if (endDateTime < startDateTime) {
                    setError('종료 시간은 시작 시간 이후여야 합니다.');
                    return;
                }
        
                const formattedData = {
                    ...eventData,
                    allDay: eventData.allDay,
                    start_time: startDateTime.toISOString(),
                    end_time: endDateTime.toISOString(),
                };
        
                await onSubmit(formattedData);
            } catch (error) {
                console.error('Error submitting form:', error);
                setError(error.response?.data?.error || error.message || '일정 처리 중 오류가 발생했습니다.');
            }
        };
    
        return (
            <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg">
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        제목 *
                    </label>
                    <input
                        id="title"
                        type="text"
                        required
                        value={eventData.title}
                        onChange={(e) => setEventData({...eventData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="제목 입력"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center space-x-2 mb-2">
                        <input
                            type="checkbox"
                            id="allDay"
                            checked={eventData.allDay}
                            onChange={(e) => setEventData({...eventData, allDay: e.target.checked})}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="allDay" className="text-sm text-gray-700">
                            하루종일
                        </label>
                    </div>
    
                    {eventData.allDay ? (
                        // 하루종일 선택 시 시작일-종료일 표시
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    시작일
                                </label>
                                <input
                                    type="date"
                                    value={eventData.startDate}
                                    onChange={(e) => {
                                        const newStartDate = e.target.value;
                                        setEventData(prev => ({
                                            ...prev,
                                            startDate: newStartDate,
                                            endDate: newStartDate > prev.endDate ? newStartDate : prev.endDate
                                        }));
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    종료일
                                </label>
                                <input
                                    type="date"
                                    value={eventData.endDate}
                                    min={eventData.startDate}
                                    onChange={(e) => setEventData({...eventData, endDate: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    ) : (
                        // 시간 선택 시 날짜와 시작-종료 시간 표시
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    날짜
                                </label>
                                <input
                                    type="date"
                                    value={eventData.date}
                                    onChange={(e) => setEventData({...eventData, date: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative" ref={startTimeRef}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        시작 시간
                                    </label>
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        onClick={() => setShowStartTimeDropdown(!showStartTimeDropdown)}
                                    >
                                        {eventData.startTime}
                                    </button>
                                    {showStartTimeDropdown && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {timeOptions.map(time => (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
                                                        eventData.startTime === time ? 'bg-blue-50 text-blue-600' : ''
                                                    }`}
                                                    onClick={() => {
                                                        setEventData({...eventData, startTime: time});
                                                        setShowStartTimeDropdown(false);
                                                    }}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="relative" ref={endTimeRef}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        종료 시간
                                    </label>
                                    <button
                                        type="button"
                                        className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        onClick={() => setShowEndTimeDropdown(!showEndTimeDropdown)}
                                    >
                                        {eventData.endTime}
                                    </button>
                                    {showEndTimeDropdown && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                            {timeOptions.map(time => (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    className={`block w-full px-4 py-2 text-left hover:bg-gray-100 ${
                                                        eventData.endTime === time ? 'bg-blue-50 text-blue-600' : ''
                                                    }`}
                                                    onClick={() => {
                                                        setEventData({...eventData, endTime: time});
                                                        setShowEndTimeDropdown(false);
                                                    }}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
    
                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        내용 *
                    </label>
                    <textarea
                        id="description"
                        required
                        value={eventData.description}
                        onChange={(e) => setEventData({...eventData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="일정 설명 입력"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        위치
                    </label>
                    <input
                        id="location"
                        type="text"
                        value={eventData.location}
                        onChange={(e) => setEventData({...eventData, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="위치 입력"
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                            작성자 *
                        </label>
                        <input
                            id="author"
                            type="text"
                            required
                            value={eventData.author}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                        />
                    </div>
                    <div className="w-32">
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                            색상
                        </label>
                        <input
                            id="color"
                            type="color"
                            value={eventData.color}
                            onChange={(e) => setEventData({...eventData, color: e.target.value})}
                            className="w-full h-10 p-1 rounded-md"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {initialData ? '수정' : '추가'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        취소
                    </button>
                </div>
            </form>
        );
    };

    const renderCalendarView = () => {
        switch (view) {
            case 'month':
                return (
                    <div className="grid grid-cols-7 divide-x divide-y divide-gray-200 border border-gray-200 overflow-hidden bg-white">
                        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                            <div key={day} className={`p-2 sm:p-4 text-center font-medium text-sm
                                ${index === 0 || index === 6 ? 'bg-gray-100 text-gray-700' : 'bg-gray-50'}`}>
                                {day}
                            </div>
                        ))}
                        {getDaysInMonth().map((day, index) => (
                            <div
                                key={index}
                                className={`min-h-[100px] sm:min-h-[140px] p-1 relative 
                                    ${day.currentMonth 
                                        ? isWeekend(day.date) || isHoliday(day.date)
                                            ? 'bg-gray-100' 
                                            : 'bg-white'
                                        : 'bg-gray-50'
                                    }
                                    ${isToday(day.date) ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex flex-col space-y-1">
                                    <div className={`text-sm sm:font-medium flex items-center justify-center sm:justify-start
                                        ${day.currentMonth 
                                            ? isWeekend(day.date) || isHoliday(day.date)
                                                ? 'text-red-600'
                                                : 'text-gray-900'
                                            : 'text-gray-400'
                                        }
                                        ${isToday(day.date) ? 'bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}
                                    >
                                        {day.date.getDate()}
                                    </div>
                                    {isHoliday(day.date) && (
                                        <div className="text-xs text-red-600 text-center sm:text-left truncate">
                                            {holidays[format(day.date, 'yyyy-MM-dd')]}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-[1px] mt-1">
                                    {events
                                        .filter(event => isEventInDate(event, day.date))
                                        .map((event, i) => renderEvent(event, day, i))}
                                </div>
                            </div>
                        ))}
                    </div>
                );

            case 'week':
                return (
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full">
                            <div className="grid grid-cols-8 divide-x divide-gray-200 border border-gray-200 bg-white">
                                {/* 요일 헤더 */}
                                <div className="bg-gray-50 p-2 sm:p-4"></div>
                                {getDaysInWeek().map((date, index) => (
                                    <div key={index} 
                                        className={`bg-gray-50 p-2 sm:p-4 text-center ${
                                            isToday(date) ? 'bg-blue-50' : ''
                                        }`}>
                                        <div className="font-medium text-sm">
                                            {['일', '월', '화', '수', '목', '금', '토'][date.getDay()]}
                                        </div>
                                        <div className={`text-sm text-gray-600 ${
                                            isToday(date) ? 'bg-blue-500 text-white rounded-full w-6 h-6 mx-auto flex items-center justify-center' : ''
                                        }`}>
                                            {date.getDate()}
                                        </div>
                                    </div>
                                ))}
            
                                {/* 종일 일정 행 */}
                                <div className="col-span-8 border-b border-gray-200 min-h-[50px] relative">
                                    <div className="absolute inset-0 grid grid-cols-7 divide-x divide-gray-200 ml-[12.5%]">
                                        {getDaysInWeek().map((date, dayIndex) => (
                                            <div key={dayIndex} className="relative">
                                                {events
                                                    .filter(event => event.all_day && isEventInDate(event, date))
                                                    .map((event, eventIndex) => {
                                                        const eventStart = new Date(event.start_time);
                                                        const eventEnd = new Date(event.end_time);
                                                        const isStart = eventStart.toDateString() === date.toDateString();
                                                        const isEnd = eventEnd.toDateString() === date.toDateString();
                                                        const isMiddle = !isStart && !isEnd;
                                                        
                                                        return (
                                                            <div
                                                                key={eventIndex}
                                                                className={`absolute left-0 right-0 mx-1 h-6 px-2 flex items-center text-white text-xs cursor-pointer
                                                                    ${isStart ? 'rounded-l-md' : ''}
                                                                    ${isEnd ? 'rounded-r-md' : ''}
                                                                    ${event.is_completed ? 'opacity-50' : ''}`}
                                                                style={{
                                                                    backgroundColor: event.color,
                                                                    top: `${eventIndex * 28}px`,
                                                                    opacity: isMiddle ? 0.8 : 1
                                                                }}
                                                                onClick={() => handleEventClick(event)}
                                                            >
                                                                {(isStart || (!isStart && dayIndex === 0)) && (
                                                                    <span className={`truncate ${event.is_completed ? 'line-through' : ''}`}>
                                                                        {event.title}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
            
                                {/* 시간별 그리드 */}
                                {getTimeSlots().map((time) => (
                                    <React.Fragment key={time}>
                                        <div className="bg-gray-50 p-2 text-xs text-right text-gray-500">
                                            {time}
                                        </div>
                                        {getDaysInWeek().map((date, dayIndex) => (
                                            <div key={`${time}-${dayIndex}`} 
                                                className="relative h-[48px] bg-white border-b border-gray-100">
                                                {/* 30분 구분선 */}
                                                <div className="absolute w-full h-px bg-gray-100 top-1/2"></div>
                                                
                                                {/* 시간 일정 표시 */}
                                                {events
                                                    .filter(event => {
                                                        if (event.all_day) return false;
            
                                                        const eventStart = new Date(event.start_time);
                                                        const eventEnd = new Date(event.end_time);
                                                        
                                                        // 현재 날짜의 시간 슬롯 범위 계산
                                                        const timeSlotStart = new Date(date);
                                                        const [hours] = time.split(':').map(Number);
                                                        timeSlotStart.setHours(hours, 0, 0, 0);
                                                        const timeSlotEnd = new Date(timeSlotStart);
                                                        timeSlotEnd.setHours(hours + 1, 0, 0, 0);
            
                                                        // 이벤트가 현재 날짜의 시간 슬롯과 겹치는지 확인
                                                        return (
                                                            eventStart.toDateString() === date.toDateString() &&
                                                            eventStart < timeSlotEnd &&
                                                            eventEnd > timeSlotStart
                                                        );
                                                    })
                                                    .map((event, i) => {
                                                        const startTime = new Date(event.start_time);
                                                        const endTime = new Date(event.end_time);
                                                        
                                                        // 시간대 내에서의 상대적 위치 계산
                                                        const slotStartHour = parseInt(time);
                                                        const slotStart = new Date(date).setHours(slotStartHour, 0, 0, 0);
                                                        const slotEnd = new Date(date).setHours(slotStartHour + 1, 0, 0, 0);
                                                        
                                                        const eventStartTime = startTime.getTime();
                                                        const eventEndTime = endTime.getTime();
                                                        
                                                        // 시간 슬롯 내에서의 상대적 위치와 높이 계산
                                                        const top = Math.max(0, (eventStartTime - slotStart) / (slotEnd - slotStart) * 100);
                                                        const bottom = Math.min(100, (eventEndTime - slotStart) / (slotEnd - slotStart) * 100);
                                                        const height = bottom - top;
            
                                                        const timeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
            
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`absolute left-0 right-0 mx-1 rounded-md overflow-hidden cursor-pointer hover:opacity-90
                                                                    ${event.is_completed ? 'opacity-50' : ''}`}
                                                                style={{
                                                                    top: `${top}%`,
                                                                    height: `${height}%`,
                                                                    backgroundColor: event.color,
                                                                    zIndex: 10,
                                                                    minHeight: '25px'
                                                                }}
                                                                onClick={() => handleEventClick(event)}
                                                                title={`${event.title}\n${timeStr}\n${event.description}`}
                                                            >
                                                                <div className="p-1 text-white text-xs">
                                                                    <div className={`font-medium truncate ${event.is_completed ? 'line-through' : ''}`}>
                                                                        {event.title}
                                                                    </div>
                                                                    <div className={`text-[10px] opacity-90 ${event.is_completed ? 'line-through' : ''}`}>
                                                                        {timeStr}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'day':
                return (
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full">
                            <div className="grid grid-cols-[100px_1fr] divide-x divide-gray-200 border border-gray-200 bg-white">
                                {/* 헤더 부분 */}
                                <div className="bg-gray-50 p-2 sm:p-4"></div>
                                <div className={`bg-gray-50 p-2 sm:p-4 text-center ${
                                    isToday(currentDate) ? 'bg-blue-50' : ''
                                }`}>
                                    <div className="font-medium text-sm">
                                        {['일', '월', '화', '수', '목', '금', '토'][currentDate.getDay()]}
                                    </div>
                                    <div className={`text-sm text-gray-600 ${
                                        isToday(currentDate) ? 'bg-blue-500 text-white rounded-full w-6 h-6 mx-auto flex items-center justify-center' : ''
                                    }`}>
                                        {currentDate.getDate()}
                                    </div>
                                </div>
            
                                {/* 종일 일정 행 */}
                                <div className="col-span-2 border-b border-gray-200 min-h-[50px] relative">
                                    <div className="absolute inset-0 ml-[100px]">
                                        {events
                                            .filter(event => event.all_day && isEventInDate(event, currentDate))
                                            .map((event, index) => (
                                                <div
                                                    key={index}
                                                    className="mx-1 h-6 px-2 mb-1 flex items-center text-white text-xs rounded-md"
                                                    style={{
                                                        backgroundColor: event.color,
                                                        marginTop: `${index * 28}px`,
                                                    }}
                                                    onClick={() => handleEventClick(event)}
                                                >
                                                    <span className="truncate">{event.title}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
            
                                {/* 시간별 그리드 */}
                                {getTimeSlots().map((time) => (
                                    <React.Fragment key={time}>
                                        <div className="bg-gray-50 p-2 text-xs text-right text-gray-500">
                                            {time}
                                        </div>
                                        <div className="relative h-[48px] bg-white border-b border-gray-100">
                                            {/* 30분 구분선 */}
                                            <div className="absolute w-full h-px bg-gray-100 top-1/2"></div>
                                            
                                            {/* 시간 일정 표시 */}
                                            {events
                                                .filter(event => {
                                                    if (event.all_day) return false;
                                                    
                                                    const eventStart = new Date(event.start_time);
                                                    const eventEnd = new Date(event.end_time);
                                                    const timeSlotStart = new Date(currentDate);
                                                    const [hours] = time.split(':').map(Number);
                                                    timeSlotStart.setHours(hours, 0, 0, 0);
                                                    const timeSlotEnd = new Date(timeSlotStart);
                                                    timeSlotEnd.setHours(hours + 1, 0, 0, 0);
            
                                                    // 이벤트가 현재 시간 슬롯과 겹치는지 확인
                                                    return eventStart < timeSlotEnd && eventEnd > timeSlotStart;
                                                })
                                                .map((event, i) => {
                                                    const { top, height } = calculateEventPosition(event);
                                                    const startTime = new Date(event.start_time);
                                                    const endTime = new Date(event.end_time);
                                                    const timeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
            
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`absolute left-0 right-0 mx-1 rounded-md overflow-hidden cursor-pointer hover:opacity-90
                                                                ${event.is_completed ? 'opacity-50' : ''}`}
                                                            style={{
                                                                top: `${top}%`,
                                                                height: `${height}%`,
                                                                backgroundColor: event.color,
                                                                zIndex: 10,
                                                                minHeight: '25px'
                                                            }}
                                                            onClick={() => handleEventClick(event)}
                                                            title={`${event.title}\n${timeStr}\n${event.description}`}
                                                        >
                                                            <div className="p-1 text-white text-xs">
                                                                <div className={`font-medium truncate ${event.is_completed ? 'line-through' : ''}`}>
                                                                    {event.title}
                                                                </div>
                                                                <div className={`text-[10px] opacity-90 ${event.is_completed ? 'line-through' : ''}`}>
                                                                    {timeStr}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            default:
                break;
            }
        };

        const getHeaderText = () => {
            switch (view) {
                case 'month':
                    return currentDate.toLocaleString('ko-KR', { year: 'numeric', month: 'long' });
                case 'week': {
                    const weekDays = getDaysInWeek();
                    const firstDay = weekDays[0];
                    const lastDay = weekDays[6];
                    
                    // 같은 월인 경우
                    if (firstDay.getMonth() === lastDay.getMonth()) {
                        return `${firstDay.getFullYear()}년 ${firstDay.getMonth() + 1}월 ${firstDay.getDate()}일 - ${lastDay.getDate()}일`;
                    }
                    // 다른 월인 경우
                    else if (firstDay.getFullYear() === lastDay.getFullYear()) {
                        return `${firstDay.getFullYear()}년 ${firstDay.getMonth() + 1}월 ${firstDay.getDate()}일 - ${lastDay.getMonth() + 1}월 ${lastDay.getDate()}일`;
                    }
                    // 다른 연도인 경우
                    else {
                        return `${firstDay.getFullYear()}년 ${firstDay.getMonth() + 1}월 ${firstDay.getDate()}일 - ${lastDay.getFullYear()}년 ${lastDay.getMonth() + 1}월 ${lastDay.getDate()}일`;
                    }
                }
                case 'day':
                    return currentDate.toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
                default:
                    return '';
            }
        };
    
    return (
        <div className="bg-white relative">
            <ErrorMessage />
            <LoadingIndicator />
            <div className="flex flex-row justify-between items-center p-2 sm:p-4 border-b">
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button
                        onClick={movePrev}
                        className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        ←
                    </button>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 whitespace-nowrap">
                        {getHeaderText()}
                    </h2>
                    <button
                        onClick={moveNext}
                        className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        →
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowViewDropdown(!showViewDropdown)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-1"
                        >
                            <span>{viewOptions[view]}</span>
                            <svg 
                                className={`w-4 h-4 transition-transform ${showViewDropdown ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>
                        
                        {showViewDropdown && (
                            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                {Object.entries(viewOptions).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleViewChange(key)}
                                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                            view === key ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowEventModal(true)}
                        className="whitespace-nowrap px-2 sm:px-4 py-1 sm:py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                        + 일정
                    </button>
                </div>
            </div>

            {renderCalendarView()}

            {(showEventModal || selectedEvent) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">
                                {selectedEvent ? (isEditMode ? '일정 수정' : '일정 상세') : '새 일정 추가'}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        {selectedEvent ? (
                            isEditMode ? (
                                <EventForm 
                                    initialData={selectedEvent}
                                    onSubmit={handleUpdateEvent}
                                    onCancel={handleCloseModal}
                                />
                            ) : (
                                <EventDetail
                                    event={selectedEvent}
                                    onClose={handleCloseModal}
                                    onEdit={handleEditEvent}
                                    onDelete={() => handleDeleteEvent(selectedEvent)}
                                />
                            )
                        ) : (
                            <EventForm onSubmit={createEvent} onCancel={handleCloseModal} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
                
export default CalendarComponent;