"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession, signOut } from '../../lib/supabase';

// 페이지에 필요한 모든 스타일을 포함하는 컴포넌트입니다.
const GlobalStyles = () => (
  <style>{`
    :root {
      --bg: #f7f8fc;
      --glass: rgba(255, 255, 255, 0.6);
      --stroke: rgba(0, 0, 0, 0.08);
      --shadow: 0 8px 40px rgba(0, 0, 0, 0.08);
      --text: #2c3e50;
      --muted: rgba(44, 62, 80, 0.6);
      --brand1: #fbc2eb;
      --brand2: #a6c1ee;
      --brand3: #e6b3ff;
      --radius: 20px;
      --transition-speed: 0.5s;
    }
    * { box-sizing: border-box; }
    html, body { 
      height: 100vh; 
      margin: 0; 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif; 
      overflow: hidden;
      background: var(--bg);
      color: var(--text);
    }
    #root {
      height: 100vh;
      width: 100vw;
    }
    body::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 70vw;
      height: 70vh;
      min-width: 800px;
      min-height: 800px;
      background: radial-gradient(circle, var(--brand1) 0%, var(--brand2) 50%, var(--brand3) 100%);
      opacity: 0.15;
      filter: blur(120px);
      transform-origin: center;
      animation: backgroundHighlight 25s ease-in-out infinite alternate;
      z-index: -1;
    }
    @keyframes backgroundHighlight {
      0% { transform: translate(-20%, -20%) rotate(0deg) scale(1.2); }
      100% { transform: translate(20%, 20%) rotate(360deg) scale(1.4); }
    }
    .container { display: flex; height: 100vh; width: 100vw; }
    .sidebar {
        width: 300px;
        height: 100%;
        background: var(--glass);
        border-right: 1px solid var(--stroke);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        padding: 20px;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        z-index: 20;
    }
    .sidebar .logo { font-size: 24px; font-weight: 800; margin-bottom: 40px; padding: 10px 0; }
    .sidebar nav a {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-radius: 10px;
        text-decoration: none;
        color: var(--muted);
        font-weight: 500;
        margin-bottom: 8px;
        transition: all 0.2s ease;
    }
    .sidebar nav a:hover, .sidebar nav a.active {
        background: #fff;
        color: var(--text);
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .sidebar nav a svg { width: 20px; height: 20px; }
    .sidebar .profile { margin-top: auto; display: flex; align-items: center; gap: 12px; cursor: pointer; padding: 8px; border-radius: 10px; transition: all 0.2s ease; }
    .sidebar .profile:hover { background: rgba(255,255,255,0.5); }
    .sidebar .profile img { width: 40px; height: 40px; border-radius: 50%; }
    .sidebar .profile .name { font-weight: 600; }
    
    /* 설정 팝업 스타일 */
    .settings-popup {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    }
    .settings-popup.show {
      opacity: 1;
      visibility: visible;
    }
    .settings-content {
      background: var(--glass);
      border: 1px solid var(--stroke);
      border-radius: var(--radius);
      padding: 30px;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: var(--shadow);
      min-width: 300px;
      text-align: center;
    }
    .settings-content h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 600;
    }
    .settings-content p {
      margin: 0 0 25px 0;
      color: var(--muted);
      font-size: 14px;
    }
    .settings-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
    }
    .btn-cancel {
      padding: 10px 20px;
      border: 1px solid var(--stroke);
      background: rgba(255,255,255,0.5);
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .btn-cancel:hover {
      background: rgba(255,255,255,0.8);
    }
    .btn-logout {
      padding: 10px 20px;
      border: none;
      background: linear-gradient(135deg, #ff6b6b, #ee5a52);
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .btn-logout:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255,107,107,0.3);
    }
    .main-content {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px;
        overflow: hidden;
        position: relative;
    }
    .chat-view-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 40px;
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--transition-speed) ease;
    }
    .main-content.chat-active .chat-view-container { opacity: 1; pointer-events: auto; }
    .chat-simulation-container {
        width: 340px;
        height: 700px;
        background-image: linear-gradient(135deg, #2d3436 0%, #000000 74%);
        border-radius: 40px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        padding: 12px;
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        z-index: 15;
        transform: translateY(50px) scale(0.95);
        transition: all var(--transition-speed) cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .main-content.chat-active .chat-simulation-container { transform: translateY(0) scale(1); }
    .phone-screen {
        width: 100%;
        height: 100%;
        background: var(--bg);
        border-radius: 30px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
    }
    .phone-notch {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 130px;
        height: 28px;
        background: #1c1c1e;
        border-bottom-left-radius: 15px;
        border-bottom-right-radius: 15px;
        z-index: 2;
    }
    .phone-header {
        padding: 10px 15px;
        padding-top: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--stroke);
        position: relative;
        z-index: 1;
    }
    .phone-header .back-button {
        background: none;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        font-weight: 500;
        color: var(--muted);
    }
    .phone-header .back-button svg { width: 20px; height: 20px; }
    .phone-header .name { font-weight: 600; }
    .phone-chat-log {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .phone-bubble {
        padding: 8px 12px;
        border-radius: 15px;
        max-width: 80%;
        line-height: 1.5;
        font-size: 14px;
        opacity: 0;
        transform: translateY(10px);
        animation: bubble-in 0.5s forwards;
    }
    @keyframes bubble-in { to { opacity: 1; transform: translateY(0); } }
    .phone-bubble.me { align-self: flex-end; background: var(--brand2); color: #fff; }
    .phone-bubble.ai { align-self: flex-start; background: #fff; border: 1px solid var(--stroke); }
    .phone-footer { padding: 15px 15px 25px 15px; text-align: center; }
    .date-start-button {
        width: 100%;
        padding: 12px;
        border: none;
        border-radius: 15px;
        background: linear-gradient(135deg, var(--brand2), var(--brand1));
        color: #fff;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        opacity: 0;
        transform: scale(0.9);
        transition: all 0.3s ease;
        pointer-events: none;
    }
    .date-start-button.active {
        opacity: 1;
        transform: scale(1);
        pointer-events: auto;
        animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 194, 235, 0.7); }
        70% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(251, 194, 235, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251, 194, 235, 0); }
    }
    .phone-home-indicator {
        width: 130px;
        height: 5px;
        background: rgba(0,0,0,0.3);
        border-radius: 10px;
        position: absolute;
        bottom: 8px;
        left: 50%;
        transform: translateX(-50%);
    }
    .selected-persona-profile {
        transform: translateY(50px) scale(0.95);
        transition: all var(--transition-speed) cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .main-content.chat-active .selected-persona-profile { transform: translateY(0) scale(1); }
    .persona-selection-container {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        transition: opacity var(--transition-speed) ease;
    }
    .main-content.chat-active .persona-selection-container { opacity: 0; pointer-events: none; }
    .persona-selection-container .main-header { text-align: center; margin-bottom: 20px; }
    .persona-selection-container .main-header h1 { font-size: 28px; margin: 0 0 10px 0; }
    .persona-selection-container .main-header p { color: var(--muted); margin: 0; }
    .filter-buttons { display: flex; justify-content: center; gap: 10px; margin-bottom: 30px; }
    .filter-buttons button {
        background: rgba(255,255,255,0.5);
        border: 1px solid var(--stroke);
        padding: 8px 20px;
        border-radius: 15px;
        font-weight: 600;
        color: var(--muted);
        cursor: pointer;
        transition: all 0.3s ease;
    }
    .filter-buttons button.active {
        background: #fff;
        color: var(--text);
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .persona-coverflow {
        flex-grow: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        position: relative;
        user-select: none;
    }
    .persona-track {
        display: flex;
        align-items: center;
        position: absolute;
        left: 0;
        top: 50%;
        will-change: transform;
        transition: transform var(--transition-speed) cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .persona-card {
        width: 340px;
        height: 700px;
        background: var(--glass);
        border: 1px solid var(--stroke);
        border-radius: 40px;
        box-shadow: var(--shadow);
        flex-shrink: 0;
        margin: 0 20px;
        cursor: pointer;
        overflow: hidden;
        position: relative;
        transition: transform var(--transition-speed) ease, opacity var(--transition-speed) ease, filter var(--transition-speed) ease;
        transform: scale(0.85);
        opacity: 0.6;
        filter: blur(2px);
    }
    .persona-card.selected {
        transform: scale(1);
        opacity: 1;
        filter: blur(0);
        z-index: 5;
    }
    .persona-card-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
    }
    .persona-card-content {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        padding: 30px;
        text-align: left;
        z-index: 2;
        color: #fff;
        background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
        text-shadow: 0 2px 5px rgba(0,0,0,0.5);
    }
    .persona-card-name { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .persona-card-info { font-size: 16px; color: rgba(255,255,255,0.9); margin-bottom: 15px; }
    .persona-card-tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-start; }
    .persona-card-tags .tag {
        background: rgba(255,255,255,0.2);
        border-radius: 10px;
        padding: 6px 12px;
        font-size: 14px;
        font-weight: 500;
    }
    .nav-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: var(--glass);
        border: 1px solid var(--stroke);
        border-radius: 50%;
        width: 50px;
        height: 50px;
        cursor: pointer;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    .nav-arrow:hover { background: #fff; transform: translateY(-50%) scale(1.1); }
    .nav-arrow.left { left: 20px; }
    .nav-arrow.right { right: 20px; }
    .nav-arrow svg { width: 24px; height: 24px; fill: var(--text); }
    .selected-persona-profile { display: flex; align-items: center; justify-content: center; }
    .selected-persona-profile .persona-card {
        width: 340px;
        height: 700px;
        transform: none !important;
        filter: none !important;
        opacity: 1 !important;
        box-shadow: var(--shadow);
        margin: 0;
    }
    .nav-arrow:disabled {
        opacity: 0.35;
        pointer-events: none;
        cursor: default;
        filter: grayscale(1);
    }
  `}</style>
);

// 페르소나 데이터
const allPersonas = [
    { gender: 'female', name: '김세아', age: 28, mbti: 'ENFP', job: '마케터', personality: ['활발함', '긍정적'], image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'female', name: '박서진', age: 25, mbti: 'ESFJ', job: '대학생', personality: ['사교적', '다정함'], image: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'female', name: '최유나', age: 34, mbti: 'INFJ', job: '상담사', personality: ['통찰력', '따뜻함'], image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'female', name: '이지은', age: 29, mbti: 'ISFP', job: '디자이너', personality: ['예술적', '온화함'], image: 'https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'female', name: '한소희', age: 26, mbti: 'ESTP', job: '필라테스 강사', personality: ['에너제틱', '모험적'], image: 'https://images.pexels.com/photos/1310522/pexels-photo-1310522.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'male', name: '이준영', age: 31, mbti: 'ISTJ', job: '개발자', personality: ['논리적', '신중함'], image: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'male', name: '정현우', age: 29, mbti: 'ENTP', job: '스타트업 대표', personality: ['도전적', '창의적'], image: 'https://images.pexels.com/photos/846741/pexels-photo-846741.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'male', name: '박도윤', age: 32, mbti: 'INTP', job: '연구원', personality: ['분석적', '지적 호기심'], image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'male', name: '강태오', age: 27, mbti: 'ESFP', job: '배우 지망생', personality: ['자유로운 영혼', '즉흥적'], image: 'https://images.pexels.com/photos/837358/pexels-photo-837358.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
    { gender: 'male', name: '서지훈', age: 30, mbti: 'ISFJ', job: '수의사', personality: ['헌신적', '차분함'], image: 'https://images.pexels.com/photos/819530/pexels-photo-819530.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
];

// 페르소나 카드 컴포넌트
const PersonaCard = ({ persona, isSelected, onClick, isProfileCard = false }) => {
    const tagsHtml = persona.personality.map(tag => <div key={tag} className="tag">#{tag}</div>);
    const cardClasses = `persona-card ${isSelected && !isProfileCard ? 'selected' : ''}`;

    return (
        <div className={cardClasses} onClick={onClick}>
            <img src={persona.image} alt={persona.name} className="persona-card-image" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x500/e0e8ff/7d7d7d?text=Image'; }} />
            <div className="persona-card-content">
                <div className="persona-card-name">{persona.name}</div>
                <div className="persona-card-info">{persona.age}세 · {persona.mbti} · {persona.job}</div>
                <div className="persona-card-tags">{tagsHtml}</div>
            </div>
        </div>
    );
};

// 메인 앱 컴포넌트
function PersonaPage() {
    const [currentPersonas, setCurrentPersonas] = useState(allPersonas);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isChatActive, setIsChatActive] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [trackStyle, setTrackStyle] = useState({});
    const [user, setUser] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    
    const trackRef = useRef(null);
    const coverflowRef = useRef(null);
    const isAnimating = useRef(false);
    const chatTimeoutRef = useRef(null);
    const router = useRouter();

    const updateSlider = (index) => {
        if (!trackRef.current || !coverflowRef.current) return;
        
        const newIndex = Math.max(0, Math.min(index, currentPersonas.length - 1));
        setSelectedIndex(newIndex);

        const cards = trackRef.current.children;
        if (!cards.length || !cards[newIndex]) return;

        const container = coverflowRef.current;
        const selectedCard = cards[newIndex];
        
        const containerWidth = container.offsetWidth;
        const cardWidth = selectedCard.offsetWidth;
        const cardLeft = selectedCard.offsetLeft;

        const translateX = (containerWidth / 2) - cardLeft - (cardWidth / 2);
        setTrackStyle({ transform: `translate3d(${translateX}px, -50%, 0)` });
    };

    useEffect(() => {
        updateSlider(0);
    }, [currentPersonas]);

    useEffect(() => {
        const handleResize = () => updateSlider(selectedIndex);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedIndex]);

    // 사용자 세션 확인
    useEffect(() => {
        const checkUser = async () => {
            try {
                if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                    // 환경변수가 설정되지 않은 경우 더미 사용자로 설정
                    setUser({
                        user_metadata: {
                            full_name: '김민준',
                            avatar_url: 'https://placehold.co/100x100/e0e8ff/7d7d7d?text=Me'
                        }
                    });
                    return;
                }
                
                const session = await getCurrentSession();
                if (session?.user) {
                    setUser(session.user);
                } else {
                    // 로그인되지 않은 경우 로그인 페이지로 이동
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error checking user session:', error);
                router.push('/login');
            }
        };
        
        checkUser();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const handleFilterClick = (filter) => {
        if (isAnimating.current || activeFilter === filter) return;
        
        setActiveFilter(filter);
        setIsChatActive(false);

        const filtered = filter === 'all' 
            ? allPersonas 
            : allPersonas.filter(p => p.gender === filter);
        
        setCurrentPersonas(filtered);
    };

    const handleCardClick = (index) => {
        if (index === selectedIndex) {
            startChatView(index);
        } else {
            updateSlider(index);
        }
    };

    const startChatView = (index) => {
        if (isAnimating.current) return;
        isAnimating.current = true;
        
        setIsChatActive(true);
        createNewChat(currentPersonas[index]);

        setTimeout(() => { isAnimating.current = false; }, 500);
    };

    const createNewChat = (persona) => {
        clearTimeout(chatTimeoutRef.current);
        setChatMessages([]);

        const messages = [
            { role: 'me', text: `안녕하세요. 김민준이라고 합니다.` },
            { role: 'ai', text: `네, 안녕하세요. 저는 ${persona.name}이라고 합니다.` },
            { role: 'me', text: '혹시 이번 주말 시간이 괜찮으실까요?' },
            { role: 'ai', text: '이번 주말이요? 네, 가능할 것 같습니다.' },
        ];

        let delay = 100;
        messages.forEach((msg) => {
            delay += 1200;
            chatTimeoutRef.current = setTimeout(() => {
                setChatMessages(prev => [...prev, msg]);
            }, delay);
        });
    };

    const selectedPersona = currentPersonas[selectedIndex];

    return (
        <>
            <GlobalStyles />
            <div className="container">
                <aside className="sidebar">
                    <div className="logo">STUDIO</div>
                    <nav>
                        <a href="#" className="active">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.783 2.826L12 1l8.217 1.826a1 1 0 0 1 .783.976v9.987a6 6 0 0 1-2.672 4.992L12 23l-6.328-4.219A6 6 0 0 1 3 13.79V3.802a1 1 0 0 1 .783-.976zM5 4.604v9.185a4 4 0 0 0 1.781 3.328L12 20.597l5.219-3.48A4 4 0 0 0 19 13.79V4.604L12 3.05 5 4.604z"></path></svg>
                            <span>데이트 상대 선택</span>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setShowSettings(true); }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l3.09 6.26L22 7.27l-5 4.87 1.18 6.88L12 17.77l-6.18 1.25L7 12.14 2 7.27l6.91-1.01L12 1z"></path></svg>
                            <span>설정</span>
                        </a>
                    </nav>
                    <div className="profile" onClick={() => setShowSettings(true)}>
                        <img src={user?.user_metadata?.avatar_url || "https://placehold.co/100x100/e0e8ff/7d7d7d?text=Me"} alt="Profile" />
                        <div className="name">{user?.user_metadata?.full_name || "김민준"}</div>
                    </div>
                </aside>

                <main className={`main-content ${isChatActive ? 'chat-active' : ''}`}>
                    {selectedPersona && (
                        <div className="chat-view-container">
                            <div className="chat-simulation-container">
                                <div className="phone-screen">
                                    <div className="phone-notch"></div>
                                    <div className="phone-header">
                                        <button className="back-button" onClick={() => setIsChatActive(false)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z"></path></svg>
                                            다른 상대 찾기
                                        </button>
                                        <span className="name">{selectedPersona.name}</span>
                                    </div>
                                    <div className="phone-chat-log">
                                        {chatMessages.map((msg, index) => (
                                            <div key={index} className={`phone-bubble ${msg.role}`}>{msg.text}</div>
                                        ))}
                                    </div>
                                    <div className="phone-footer">
                                        <button className={`date-start-button ${chatMessages.length >= 4 ? 'active' : ''}`}>데이트 시작하기</button>
                                    </div>
                                    <div className="phone-home-indicator"></div>
                                </div>
                            </div>
                            <div className="selected-persona-profile">
                               <PersonaCard persona={selectedPersona} isSelected={true} isProfileCard={true} />
                            </div>
                        </div>
                    )}

                    <div className="persona-selection-container">
                        <header className="main-header">
                            <div>
                                <h1>오늘, 누구와 대화해볼까요?</h1>
                                <p>마음에 드는 상대를 선택하고 대화를 시작해보세요.</p>
                            </div>
                        </header>
                        <div className="filter-buttons">
                            <button className={activeFilter === 'all' ? 'active' : ''} onClick={() => handleFilterClick('all')}>전체</button>
                            <button className={activeFilter === 'female' ? 'active' : ''} onClick={() => handleFilterClick('female')}>Female</button>
                            <button className={activeFilter === 'male' ? 'active' : ''} onClick={() => handleFilterClick('male')}>Male</button>
                        </div>
                        <div className="persona-coverflow" ref={coverflowRef}>
                            <div className="persona-track" ref={trackRef} style={trackStyle}>
                                {currentPersonas.map((persona, index) => (
                                    <PersonaCard 
                                        key={persona.name} 
                                        persona={persona} 
                                        isSelected={index === selectedIndex}
                                        onClick={() => handleCardClick(index)}
                                    />
                                ))}
                            </div>
                            <button className="nav-arrow left" onClick={() => updateSlider(selectedIndex - 1)} disabled={selectedIndex <= 0}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z"/></svg>
                            </button>
                            <button className="nav-arrow right" onClick={() => updateSlider(selectedIndex + 1)} disabled={selectedIndex >= currentPersonas.length - 1}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z"/></svg>
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* 설정 팝업 */}
            <div className={`settings-popup ${showSettings ? 'show' : ''}`} onClick={() => setShowSettings(false)}>
                <div className="settings-content" onClick={(e) => e.stopPropagation()}>
                    <h3>설정</h3>
                    <p>계정 설정을 관리하세요</p>
                    <div className="settings-buttons">
                        <button className="btn-cancel" onClick={() => setShowSettings(false)}>
                            취소
                        </button>
                        <button className="btn-logout" onClick={handleLogout}>
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PersonaPage;
