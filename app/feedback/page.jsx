"use client";

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import personas from "../../data/personas.json";
import { getCurrentSession, supabase, signOut } from "../../lib/supabase";

export default function FeedbackPage() {
  const calendarBodyRef = useRef(null);
  const currentMonthRef = useRef(null);
  const sessionListRef = useRef(null);
  const sessionListTitleRef = useRef(null);
  const reportContentRef = useRef(null);
  const totalScoreRef = useRef(null);
  const aiSummaryRef = useRef(null);
  const finalCoachingRef = useRef(null);
  const radarCanvasRef = useRef(null);
  const speechBubbleContainerRef = useRef(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [userSettings, setUserSettings] = useState(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [userPlan, setUserPlan] = useState('basic');
  const [isClient, setIsClient] = useState(false);
  const radarChartRef = useRef(null);
  const dropdownRef = useRef(null);

  // 공통 persona 데이터 사용
  const aiPartners = personas;

  const generateRandomReport = () => ({
    totalScore: 70 + Math.floor(Math.random() * 25),
    radar: {
      // "속도" 제거 → 5축
      labels: ["시선", "표정", "자세", "목소리", "대화"],
      score: Array.from({ length: 5 }, () => 60 + Math.floor(Math.random() * 40))
    },
    posture: {
      gaze: 60 + Math.floor(Math.random() * 40),
      expression: 60 + Math.floor(Math.random() * 40),
      stability: 60 + Math.floor(Math.random() * 40),
      smileDuration: (1.5 + Math.random() * 2).toFixed(1)
    },
    voice: {
      confidence: 60 + Math.floor(Math.random() * 40),
      // speed 제거
      talkRatio: "N/A",
      questionRatio: 10 + Math.floor(Math.random() * 20)
    },
    voiceSegments: Array.from({ length: 6 }, (_, i) => ({
      time: i * 20 + Math.floor(Math.random() * 5),
      duration: 4 + Math.floor(Math.random() * 8),
      energy: 50 + Math.floor(Math.random() * 50)
    }))
  });

  const coachingHistory = [
    // 8월 15일 - 1개 세션
    { date: "2025-08-15", partnerId: 1, report: generateRandomReport() },
    
    // 8월 16일 - 2개 세션
    { date: "2025-08-16", partnerId: 2, report: generateRandomReport() },
    { date: "2025-08-16", partnerId: 3, report: generateRandomReport() },
    
    // 8월 17일 - 1개 세션
    { date: "2025-08-17", partnerId: 4, report: generateRandomReport() },
    
    // 8월 18일 - 3개 세션
    { date: "2025-08-18", partnerId: 5, report: generateRandomReport() },
    { date: "2025-08-18", partnerId: 6, report: generateRandomReport() },
    { date: "2025-08-18", partnerId: 7, report: generateRandomReport() },
    
    // 8월 19일 - 0개 세션 (빈 날)
    
    // 8월 20일 - 2개 세션
    { date: "2025-08-20", partnerId: 8, report: generateRandomReport() },
    { date: "2025-08-20", partnerId: 9, report: generateRandomReport() },
    
    // 8월 21일 - 4개 세션 (오늘)
    { date: "2025-08-21", partnerId: 1, report: generateRandomReport() },
    { date: "2025-08-21", partnerId: 2, report: generateRandomReport() },
    { date: "2025-08-21", partnerId: 3, report: generateRandomReport() },
    { date: "2025-08-21", partnerId: 4, report: generateRandomReport() }
  ];

  useEffect(() => {
    setIsClient(true);
    // 사용자 정보 가져오기
    const fetchUser = async () => {
      const session = await getCurrentSession();
      if (session?.user) {
        setUser(session.user);
        setUserPlan(getUserPlan(session.user));
        // 세팅 동기화: 세션 로드 직후 DB 설정도 불러와 플랜 배지를 정확히 반영
        fetchUserSettings(session.user.id);
      }
    };
    fetchUser();

    renderCalendar(currentDate);
    // 초기 진입 시 오늘 날짜 선택
    const today = new Date();
    setCurrentDate(today);
    renderCalendar(today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 사용자 플랜 확인 함수 (auth 메타데이터 기준, 기본값 basic)
  const getUserPlan = (user) => {
    if (!user) return 'basic';
    return user.user_metadata?.subscription_plan || 'basic';
  };

  // 실제 사용자 플랜 가져오기 (설정의 member_tier 우선, 그 다음 auth 메타데이터)
  const getActualUserPlan = () => {
    if (userSettings?.member_tier) return userSettings.member_tier;
    if (user?.user_metadata?.subscription_plan) return user.user_metadata.subscription_plan;
    return 'basic';
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  // 사용자 설정 가져오기 (명시적 사용자 ID 허용)
  const fetchUserSettings = async (userId) => {
    if (!userId) return;
    
    setIsLoadingSettings(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, mbti, member_tier, cam_calibration')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserSettings(data);
      
      // member_tier가 있으면 userPlan도 업데이트
      if (data?.member_tier) {
        setUserPlan(data.member_tier);
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // MBTI 업데이트
  const updateMBTI = async (newMBTI) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ mbti: newMBTI })
        .eq('id', user.id);

      if (error) throw error;
      
      // 로컬 상태 업데이트
      setUserSettings(prev => prev ? { ...prev, mbti: newMBTI } : null);
    } catch (error) {
      console.error('MBTI 업데이트 오류:', error);
    }
  };

  // 캠 캘리브레이션 삭제
  const deleteCamCalibration = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ cam_calibration: false })
        .eq('id', user.id);

      if (error) throw error;
      
      // 로컬 상태 업데이트
      setUserSettings(prev => prev ? { ...prev, cam_calibration: false } : null);
    } catch (error) {
      console.error('캠 캘리브레이션 삭제 오류:', error);
    }
  };

  // 설정 모달이 열릴 때 사용자 설정 가져오기
  useEffect(() => {
    if (showSettingsModal && user) {
      fetchUserSettings(user.id);
    }
  }, [showSettingsModal, user]);

  // 사용자 정보가 로드되면 설정도 미리 로드
  useEffect(() => {
    if (user && !userSettings) {
      fetchUserSettings(user.id);
    }
  }, [user]);

  const renderCalendar = (dateObj) => {
    if (!calendarBodyRef.current || !currentMonthRef.current) return;

    const calendarBody = calendarBodyRef.current;
    calendarBody.innerHTML = "";
    currentMonthRef.current.textContent = `${dateObj.getFullYear()}년 ${dateObj.getMonth() + 1}월`;

    const firstDay = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1);
    const lastDay = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0);

    const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
    daysOfWeek.forEach((day) => {
      const dayNameEl = document.createElement("div");
      dayNameEl.className = "calendar-day-name";
      dayNameEl.textContent = day;
      calendarBody.appendChild(dayNameEl);
    });

    for (let i = 0; i < firstDay.getDay(); i++) {
      calendarBody.appendChild(document.createElement("div"));
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dayEl = document.createElement("div");
      dayEl.className = "calendar-day";
      dayEl.textContent = String(day);
      const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      dayEl.dataset.date = dateStr;

      const today = new Date();
      if (
        day === today.getDate() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getFullYear() === today.getFullYear()
      ) {
        dayEl.classList.add("today");
      }

      const sessionsOnDay = coachingHistory.filter((s) => s.date === dateStr);
      if (sessionsOnDay.length > 0) {
        const markers = document.createElement("div");
        markers.className = "session-markers";
        const count = Math.min(sessionsOnDay.length, 3);
        for (let i = 0; i < count; i++) {
          const m = document.createElement("div");
          m.className = "session-marker";
          markers.appendChild(m);
        }
        dayEl.appendChild(markers);
        dayEl.addEventListener("click", () => selectDate(dayEl));
      }

      calendarBody.appendChild(dayEl);
    }
  };

  const prevMonth = () => {
    const dt = new Date(currentDate);
    dt.setMonth(dt.getMonth() - 1);
    setCurrentDate(dt);
    renderCalendar(dt);
  };

  const nextMonth = () => {
    const dt = new Date(currentDate);
    dt.setMonth(dt.getMonth() + 1);
    setCurrentDate(dt);
    renderCalendar(dt);
  };

  const selectDate = (dayEl) => {
    // 이전 선택 제거
    calendarBodyRef.current?.querySelectorAll(".calendar-day.selected").forEach((el) => el.classList.remove("selected"));
    // 새 선택 추가
    dayEl.classList.add("selected");
    renderSessionList(dayEl.dataset.date);
  };

  const renderSessionList = (dateStr) => {
    if (!sessionListRef.current || !sessionListTitleRef.current) return;
    const container = sessionListRef.current;
    container.innerHTML = "";

    const dateObj = new Date(dateStr);
    sessionListTitleRef.current.textContent = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 세션 목록`;

    const sessionsOnDay = coachingHistory.filter((s) => s.date === dateStr);
    const byPartner = sessionsOnDay.reduce((acc, s) => {
      if (!acc[s.partnerId]) acc[s.partnerId] = [];
      acc[s.partnerId].push(s);
      return acc;
    }, {});

    if (sessionsOnDay.length === 0) {
      container.innerHTML = '<p style="text-align:center; color: var(--muted); padding: 20px;">선택한 날짜에 기록이 없습니다.</p>';
      if (reportContentRef.current) reportContentRef.current.style.display = "none";
      return;
    }

    Object.values(byPartner).flat().forEach((session, index) => {
      const partner = aiPartners.find((p) => p.id === session.partnerId);
      const itemEl = document.createElement("div");
      itemEl.className = "session-item";
      itemEl.innerHTML = `
        <img src="${partner.image}" alt="${partner.name}" />
        <div class="session-info">
          <h4>${partner.name}</h4>
          <p>${partner.mbti}</p>
        </div>
        <div class="session-status">
          <span class="session-time">오후 2:30</span>
        </div>
      `;
      itemEl.addEventListener("click", () => {
        // 이전 선택 제거
        container.querySelectorAll(".session-item.active").forEach((el) => el.classList.remove("active"));
        // 새 선택 추가
        itemEl.classList.add("active");
        updateReport(session.report);
      });
      container.appendChild(itemEl);
    });

    // 첫 번째 세션 자동 선택
    container.firstChild?.click();
  };

  const animateValue = (element, start, end, duration, isFloat = false) => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentValue = progress * (end - start) + start;
      if (isFloat) {
        element.innerHTML = `${currentValue.toFixed(1)}<span class="unit">${element.querySelector('.unit').innerHTML}</span>`;
      } else {
        element.innerHTML = `${Math.floor(currentValue)}<span class="unit">${element.querySelector('.unit')?.innerHTML || ''}</span>`;
      }
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  };

  const renderRadarChart = (radarData) => {
    const ctx = radarCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (radarChartRef.current) radarChartRef.current.destroy();
    radarChartRef.current = new Chart(ctx, {
      type: "radar",
      data: {
        labels: radarData.labels,
        datasets: [
          {
            label: "매력 지수",
            data: radarData.score,
            backgroundColor: "rgba(166, 193, 238, 0.2)",
            borderColor: "rgba(166, 193, 238, 1)",
            borderWidth: 2.5,
            pointBackgroundColor: "#fff",
            pointBorderColor: "rgba(166, 193, 238, 1)",
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            angleLines: { color: "rgba(0,0,0,0.08)" },
            grid: { color: "rgba(0,0,0,0.08)" },
            pointLabels: { font: { size: 15, weight: "600" }, color: "rgba(44,62,80,0.65)" },
            suggestedMin: 0,
            suggestedMax: 100,
            ticks: { display: false, stepSize: 25 },
          },
        },
        plugins: { legend: { display: false } },
      },
    });
  };

  const renderSpeechBubbleChart = (segments) => {
    if (!speechBubbleContainerRef.current) return;
    const container = speechBubbleContainerRef.current;
    container.querySelectorAll(".speech-bubble").forEach((el) => el.remove());
    const totalDuration = 150;
    const containerWidth = container.offsetWidth - 40; // 패딩 20px * 2 고려
    segments.forEach((seg) => {
      const bubble = document.createElement("div");
      bubble.className = "speech-bubble";
      const size = 20 + seg.duration * 3;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      
      // 회색박스 안에서만 배치되도록 계산 (패딩 고려)
      const position = (seg.time / totalDuration) * containerWidth;
      bubble.style.left = `${Math.max(20, Math.min(position + 20, containerWidth - size + 20))}px`;
      bubble.style.opacity = String(0.5 + (seg.energy - 50) / 100);

      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.innerHTML = `자신감: ${seg.energy}점<br/>길이: ${seg.duration}초`;
      bubble.appendChild(tooltip);
      container.appendChild(bubble);
    });
  };

  const updateReport = (reportData) => {
    if (!reportContentRef.current) return;
    reportContentRef.current.style.display = "flex";
    reportContentRef.current.style.flexDirection = "column";
    reportContentRef.current.style.gap = "32px";

    // 상단 요약
    if (totalScoreRef.current) {
      const scoreValue = reportData.totalScore;
      totalScoreRef.current.style.height = `${scoreValue}%`;
      
      // 점수 텍스트 애니메이션
      const scoreTextEl = totalScoreRef.current.parentElement.querySelector('.score-value');
      if (scoreTextEl) {
        animateValue(scoreTextEl, 0, scoreValue, 2000);
      }
    }
    if (aiSummaryRef.current) {
      aiSummaryRef.current.textContent = "자연스러운 미소와 적극적인 대화 참여로 긍정적인 분위기를 조성했습니다.";
    }
    if (finalCoachingRef.current) {
      finalCoachingRef.current.innerHTML = `이번 코칭도 정말 수고 많으셨습니다! <strong>목소리 자신감</strong> 포인트를 기준으로 다음 세션을 계획해보세요.`;
    }

    // 메트릭 값 업데이트 (발표 속도 제거)
    const metricValues = {
      "시선 안정성": reportData.posture.gaze,
      "긍정적 표정": reportData.posture.expression,
      "자세 안정성": reportData.posture.stability,
      "평균 미소 유지": reportData.posture.smileDuration,
      "목소리 자신감": reportData.voice.confidence,
      "대화 참여도": 85, // 새로운 메트릭
    };

    document.querySelectorAll(".metric-item").forEach((item) => {
      const label = item.querySelector(".label")?.textContent || "";
      const valueEl = item.querySelector(".value");
      const bar = item.querySelector(".progress-bar-inner");
      if (!valueEl || !bar) return;
      const value = metricValues[label];
      valueEl.dataset.value = String(value);
      bar.dataset.value = label === "평균 미소 유지" ? String(Number(value) * 25) : String(value);
      animateValue(valueEl, 0, Number(value), 1500, label === "평균 미소 유지");
      bar.style.width = `${bar.dataset.value}%`;
    });

    renderRadarChart(reportData.radar);
    renderSpeechBubbleChart(reportData.voiceSegments);
  };

  return (
    <>
      <header className="main-header">
        <div className="container">
          <div className="header-left">
            <a href="/" className="logo">
              <img src="/dys_logo.png" alt="데연소 로고" />
              데연소
            </a>
            <nav>
              <a href="/#problem">공감</a>
              <a href="/#preview">미리보기</a>
              <a href="/#science">과학적 분석</a>
              <a href="/#features">핵심 기능</a>
              <a href="/price">가격</a>
            </nav>
          </div>
                     <div className="header-right" suppressHydrationWarning>
             {isClient && user ? (
               <div className="user-dropdown" ref={dropdownRef}>
                 <div className="plan-badge-header">
                   {userSettings ? (
                     <span className={`plan-type ${getActualUserPlan()}`}>
                       {getActualUserPlan() === 'premium' ? 'Premium' : 'Basic'}
                     </span>
                   ) : (
                     <span className="plan-type basic" style={{ opacity: 0.6 }}>로딩중...</span>
                   )}
                 </div>
                 <div
                   className={`user-dropdown-toggle ${isDropdownOpen ? 'open' : ''}`}
                   role="button"
                   aria-haspopup="menu"
                   aria-expanded={isDropdownOpen}
                   aria-controls="user-menu"
                   onClick={() => setIsDropdownOpen(o => !o)}
                 >
                   <img
                     src={user.user_metadata?.avatar_url || 'https://placehold.co/32x32/e0e8ff/7d7d7d?text=U'}
                     alt="프로필"
                     className="user-avatar"
                   />
                   <span className="user-name">{user.user_metadata?.full_name || user.email}</span>
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                     <polyline points="6,9 12,15 18,9"></polyline>
                   </svg>
                 </div>
                 <div id="user-menu" className={`user-dropdown-menu ${isDropdownOpen ? 'open' : ''}`} role="menu">
                   <a href="/persona" className="user-dropdown-item" role="menuitem">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <path d="M5 12h14"/>
                       <path d="m12 5 7 7-7 7"/>
                     </svg>
                     시작하기
                   </a>
                   <button onClick={() => {
                     setShowSettingsModal(true);
                     fetchUserSettings(user.id);
                   }} className="user-dropdown-item" role="menuitem">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <circle cx="12" cy="12" r="3"/>
                       <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                     </svg>
                     설정
                   </button>
                   <button onClick={handleLogout} className="user-dropdown-item logout" role="menuitem">
                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                       <polyline points="16,17 21,12 16,7"></polyline>
                       <line x1="21" y1="12" x2="9" y2="12"></line>
                     </svg>
                     로그아웃
                   </button>
                 </div>
               </div>
             ) : (
               <a href="/login" className="btn btn-login">로그인</a>
             )}
           </div>
        </div>
      </header>

      <div className="persona-container">
        <aside className="sidebar">
          <nav>
            <a href="/persona">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              데이트 상대 선택
            </a>
            <a href="/feedback" className="active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              피드백
            </a>
          </nav>
        </aside>

        <main className="main-content">
          <div className="container" style={{ maxWidth: 1000, margin: "0 auto" }}>
            <header className="report-header" style={{ textAlign: "center", marginBottom: "40px" }}>
              <div className="header-content">
                <h1>AI 코칭 히스토리</h1>
                <p>과거 세션을 통해 당신의 성장 여정을 확인해보세요</p>
                <div className="header-stats">
                  <div className="stat-item">
                    <span className="stat-number">12</span>
                    <span className="stat-label">총 세션</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">85</span>
                    <span className="stat-label">평균 점수</span>
                  </div>
                </div>
              </div>
            </header>

            <div className="history-card card">
              <div className="calendar-wrapper">
                <div className="calendar-header">
                  <button onClick={prevMonth} className="calendar-nav-btn">‹</button>
                  <h2 ref={currentMonthRef} id="current-month"></h2>
                  <button onClick={nextMonth} className="calendar-nav-btn">›</button>
                </div>
                <div className="calendar-grid" ref={calendarBodyRef} id="calendar-body"></div>
              </div>
              <div className="session-list-wrapper">
                <h3 ref={sessionListTitleRef} id="session-list-title">세션 목록</h3>
                <div className="session-list-container" ref={sessionListRef} id="session-list"></div>
              </div>
            </div>

            <div id="report-content" ref={reportContentRef} style={{ display: "none" }}>
              <section className="card score-overview">
                <div className="summary-grid">
                  <div className="total-score">
                    <div className="score-circle">
                      <div className="score-fill" ref={totalScoreRef} id="total-score" data-value="0"></div>
                      <div className="score-value">0</div>
                      <div className="score-label">종합 매력 점수</div>
                    </div>
                  </div>
                  <div className="ai-comment">
                    <div className="comment-header">
                      <div className="ai-avatar">🤖</div>
                      <h3>AI 코치의 핵심 요약</h3>
                    </div>
                    <p ref={aiSummaryRef} id="ai-summary">이번 세션에서 가장 인상적이었던 점을 한 줄로 요약해드릴게요.</p>
                    <div className="comment-footer">
                      <span className="timestamp"></span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="card radar-section" style={{ animationDelay: "0.1s" }}>
                <div className="section-header">
                  <h2 className="section-title">매력 지수 분석</h2>
                  <p className="section-subtitle">5가지 핵심 요소로 분석한 당신의 매력 지수</p>
                </div>
                <div className="chart-container">
                  <canvas ref={radarCanvasRef} id="radarChart" />
                </div>
              </section>

              <section className="card moments-section" style={{ animationDelay: "0.2s" }}>
                <div className="section-header">
                  <h2 className="section-title">최고의 순간</h2>
                  <p className="section-subtitle">세션 중 가장 빛났던 순간들을 타임라인으로 확인해보세요</p>
                </div>
                <div className="timeline-container">
                  <div className="timeline-track">
                    <div className="timeline-moment" style={{ left: '25%' }}>
                      <div className="moment-peak"></div>
                      <div className="moment-label">자연스러운 미소</div>
                      <div className="moment-time">3분 24초</div>
                    </div>
                    <div className="timeline-moment" style={{ left: '65%' }}>
                      <div className="moment-peak"></div>
                      <div className="moment-label">완벽한 자세</div>
                      <div className="moment-time">7분 12초</div>
                    </div>
                    <div className="timeline-moment" style={{ left: '85%' }}>
                      <div className="moment-peak"></div>
                      <div className="moment-label">적극적 질문</div>
                      <div className="moment-time">12분 8초</div>
                    </div>
                  </div>
                  <div className="timeline-duration">
                    <span>0초</span>
                    <span>15분</span>
                  </div>
                </div>
              </section>

              <section className="card analysis-section" style={{ animationDelay: "0.3s" }}>
                <div className="section-header">
                  <h2 className="section-title">자세 & 표정 분석</h2>
                  <p className="section-subtitle">비언어적 소통의 핵심 요소들을 분석했어요</p>
                </div>
                <div className="detail-analysis-grid">
                  <div className="metric-item" data-aos="fade-up" data-aos-delay="100">
                    <div className="metric-header">
                      <span className="label">시선 안정성</span>
                      <span className="value" data-value="0">0<span className="unit">%</span></span>
                    </div>
                    <div className="progress-bar"><div className="progress-bar-inner" data-value="0"></div></div>
                    <div className="metric-insight">상대방의 눈을 편안하게 바라보았어요.</div>
                  </div>
                  <div className="metric-item" data-aos="fade-up" data-aos-delay="200">
                    <div className="metric-header">
                      <span className="label">긍정적 표정</span>
                      <span className="value" data-value="0">0<span className="unit">%</span></span>
                    </div>
                    <div className="progress-bar"><div className="progress-bar-inner" data-value="0"></div></div>
                    <div className="metric-insight">밝은 표정이 대화 분위기를 이끌었어요.</div>
                  </div>
                  <div className="metric-item" data-aos="fade-up" data-aos-delay="300">
                    <div className="metric-header">
                      <span className="label">자세 안정성</span>
                      <span className="value" data-value="0">0<span className="unit">%</span></span>
                    </div>
                    <div className="progress-bar"><div className="progress-bar-inner" data-value="0"></div></div>
                    <div className="metric-insight">대부분 안정적이었으나, 가끔 움직임이 있었어요.</div>
                  </div>
                  <div className="metric-item" data-aos="fade-up" data-aos-delay="400">
                    <div className="metric-header">
                      <span className="label">평균 미소 유지</span>
                      <span className="value" data-value="0">0<span className="unit">초</span></span>
                    </div>
                    <div className="progress-bar"><div className="progress-bar-inner" data-value="0"></div></div>
                    <div className="metric-insight">자연스러운 미소로 호감을 주었어요.</div>
                  </div>
                </div>
              </section>

              <section className="card voice-section" style={{ animationDelay: "0.4s" }}>
                <div className="section-header">
                  <h2 className="section-title">음성 & 대화 분석</h2>
                  <p className="section-subtitle">목소리 톤과 대화 패턴을 분석했어요</p>
                </div>
                <div className="voice-analysis-grid">
                  <div className="voice-metrics">
                    <div className="metric-item" data-aos="fade-up" data-aos-delay="100">
                      <div className="metric-header">
                        <span className="label">목소리 자신감</span>
                        <span className="value" data-value="0">0<span className="unit">점</span></span>
                      </div>
                      <div className="progress-bar"><div className="progress-bar-inner" data-value="0"></div></div>
                      <div className="metric-insight">조금 더 힘 있는 목소리가 전달력을 높여요.</div>
                    </div>
                    <div className="metric-item" data-aos="fade-up" data-aos-delay="200">
                      <div className="metric-header">
                        <span className="label">대화 참여도</span>
                        <span className="value" data-value="0">0<span className="unit">%</span></span>
                      </div>
                      <div className="progress-bar"><div className="progress-bar-inner" data-value="0"></div></div>
                      <div className="metric-insight">적극적인 대화 참여로 좋은 인상을 주었어요.</div>
                    </div>
                  </div>
                  <div className="speech-bubble-chart-container" ref={speechBubbleContainerRef} id="speechBubbleChart">
                    <h4>발화 구간별 목소리 자신감</h4>
                  </div>
                </div>
              </section>

              <section className="card coaching-section final-coaching" style={{ animationDelay: "0.5s" }}>
                <div className="section-header">
                  <h2 className="section-title">AI 종합 코칭</h2>
                  <p className="section-subtitle">이번 세션을 종합적으로 분석한 맞춤형 피드백</p>
                </div>
                <div className="coaching-content">
                  <div className="coaching-summary">
                    <h3>이번 세션 핵심 포인트</h3>
                    <p ref={finalCoachingRef} id="final-coaching-text"></p>
                  </div>
                  
                  <div className="coaching-details">
                    <div className="coaching-section">
                      <h4>✨ 잘한 점</h4>
                      <ul>
                        <li>자연스러운 미소로 긍정적인 분위기를 조성했습니다</li>
                        <li>상대방의 이야기에 적극적으로 귀 기울였습니다</li>
                        <li>적절한 시선 접촉으로 신뢰감을 표현했습니다</li>
                      </ul>
                    </div>
                    
                    <div className="coaching-section">
                      <h4>💡 개선할 점</h4>
                      <ul>
                        <li>목소리 톤을 조금 더 자신감 있게 조절해보세요</li>
                        <li>자세를 더 안정적으로 유지하면 좋겠습니다</li>
                        <li>질문을 통해 대화를 더 활발하게 이끌어보세요</li>
                      </ul>
                    </div>
                    
                    <div className="coaching-section">
                      <h4>🎯 다음 세션 목표</h4>
                      <div className="next-goals">
                        <div className="goal-item">
                          <span className="goal-number">1</span>
                          <span className="goal-text">목소리 자신감 80점 이상 달성</span>
                        </div>
                        <div className="goal-item">
                          <span className="goal-number">2</span>
                          <span className="goal-text">자세 안정성 90% 이상 유지</span>
                        </div>
                        <div className="goal-item">
                          <span className="goal-number">3</span>
                          <span className="goal-text">적극적인 질문으로 대화 주도</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="coaching-encouragement">
                    <div className="encouragement-icon">💪</div>
                    <p>매번 조금씩 개선해나가는 당신이 정말 대단해요! 다음 세션에서도 좋은 모습 보여주세요!</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* 설정 모달 */}
      {showSettingsModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card settings-modal">
            <div className="modal-header">
              <h3>설정</h3>
              <button className="modal-close" aria-label="닫기" onClick={() => setShowSettingsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {isLoadingSettings ? (
                <div className="settings-loading">
                  <div className="loading-spinner"></div>
                  <p>설정을 불러오는 중...</p>
                </div>
              ) : userSettings ? (
                <div className="settings-content">
                  <div className="setting-group">
                    <label className="setting-label">이름</label>
                    <div className="setting-value">
                      {user?.user_metadata?.full_name || '이름 없음'}
                    </div>
                  </div>
                  
                  <div className="setting-group">
                    <label className="setting-label">이메일</label>
                    <div className="setting-value">
                      {user?.email || '이메일 없음'}
                    </div>
                  </div>
                  
                  <div className="setting-group">
                    <label className="setting-label">MBTI</label>
                    <select 
                      className="setting-input"
                      value={userSettings.mbti || ''}
                      onChange={(e) => updateMBTI(e.target.value)}
                    >
                      <option value="">MBTI를 선택하세요</option>
                      <option value="INTJ">INTJ</option>
                      <option value="INTP">INTP</option>
                      <option value="ENTJ">ENTJ</option>
                      <option value="ENTP">ENTP</option>
                      <option value="INFJ">INFJ</option>
                      <option value="INFP">INFP</option>
                      <option value="ENFJ">ENFJ</option>
                      <option value="ENFP">ENFP</option>
                      <option value="ISTJ">ISTJ</option>
                      <option value="ISFJ">ISFJ</option>
                      <option value="ESTJ">ESTJ</option>
                      <option value="ESFJ">ESFJ</option>
                      <option value="ISTP">ISTP</option>
                      <option value="ISFP">ISFP</option>
                      <option value="ESTP">ESTP</option>
                      <option value="ESFP">ESFP</option>
                    </select>
                  </div>
                  
                  <div className="setting-group">
                    <label className="setting-label">캠 캘리브레이션</label>
                    <div className="setting-value">
                      {userSettings.cam_calibration ? (
                        <div className="calibration-status">
                          <span className="status-success">✅ 완료</span>
                          <button 
                            className="btn-delete-calibration"
                            onClick={deleteCamCalibration}
                          >
                            삭제
                          </button>
                        </div>
                      ) : (
                        <span className="status-pending">⏳ 미완료</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="setting-group">
                    <label className="setting-label">멤버십</label>
                    <div className="setting-value">
                      <span className={`membership-badge ${userSettings.member_tier || 'basic'}`}>
                        {userSettings.member_tier === 'premium' ? 'Premium' : 'Basic'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="settings-error">
                  <p>설정을 불러올 수 없습니다.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowSettingsModal(false)}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .history-card { padding: 20px; display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; }
        .calendar-wrapper { padding-right: 20px; border-right: 1px solid var(--stroke); }
        .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 0 10px; }
        .calendar-header h2 { font-size: 18px; font-weight: 700; margin: 0; color: var(--text); }
        .calendar-header button { background: none; border: none; cursor: pointer; font-size: 20px; color: var(--muted); }
        .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; }
        .calendar-grid div { padding: 8px 4px; font-size: 14px; position: relative; }
        .calendar-day-name { font-weight: 600; color: var(--muted); font-size: 12px; }
        .calendar-day { cursor: pointer; border-radius: 50%; transition: background-color .2s, color .2s; border: 2px solid transparent; }
                 .calendar-day.today { font-weight: 700; border-color: var(--brand2); color: var(--brand2); }
         .calendar-day.selected { background: var(--brand2); color: #fff; border-color: var(--brand2); }
         .calendar-day:not(.selected):hover { background-color: rgba(0,0,0,0.05); }
         .session-markers { position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); display: flex; gap: 3px; }
         .session-marker { width: 5px; height: 5px; border-radius: 50%; background: #fbc2eb; }
         .calendar-day.selected .session-marker { background: #fff; }
         .calendar-day.today:not(.selected) .session-marker { background: var(--brand2); }

        .session-list-wrapper h3 { font-size: 18px; font-weight: 700; margin: 0 0 20px 0; color: var(--text); padding-left: 10px; }
        .session-list-container { max-height: 300px; overflow-y: auto; padding-right: 5px; }
        .session-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: var(--radius); margin-bottom: 8px; cursor: pointer; transition: all 0.3s ease; border: 2px solid transparent; }
        .session-item:last-child { margin-bottom: 0; }
        .session-item:hover { background-color: var(--color-primary-light); transform: translateY(-1px); }
        .session-item.active { background-color: var(--color-primary-light); border-color: var(--brand2); box-shadow: 0 4px 12px rgba(166, 193, 238, 0.3); transform: translateY(-2px); }
        .session-item img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
        .session-info h4 { margin: 0; font-size: 14px; font-weight: 700; color: var(--text); }
        .session-info p { margin: 2px 0 0; font-size: 12px; color: var(--muted); }
        .session-status {
          margin-left: auto;
          background: var(--color-primary-light);
          border-radius: 12px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          color: var(--brand2);
        }

        .report-header h1 { font-size: 32px; font-weight: 800; margin: 0 0 8px; background: linear-gradient(135deg, var(--brand2), var(--brand1)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .report-header p { font-size: 16px; color: var(--muted); margin: 0 0 24px; }
        .header-stats { display: flex; justify-content: center; gap: 40px; margin-top: 24px; }
        .stat-item { text-align: center; }
        .stat-number { display: block; font-size: 24px; font-weight: 800; color: var(--brand2); }
        .stat-label { font-size: 14px; color: var(--muted); font-weight: 500; }

        .card { background: var(--glass); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: var(--radius); border: 1px solid var(--stroke); padding: 32px; box-shadow: var(--shadow); opacity: 0; transform: translateY(20px); animation: fadeInUp .7s ease-out forwards; }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        
        .score-overview { background: linear-gradient(135deg, rgba(166, 193, 238, 0.05), rgba(251, 194, 235, 0.05)); border: 1px solid rgba(166, 193, 238, 0.2); }
        .summary-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 32px; align-items: center; }
        .score-circle { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 160px; height: 160px; margin: 0 auto; background: rgba(255, 255, 255, 0.9); border-radius: 50%; box-shadow: 0 8px 32px rgba(166, 193, 238, 0.3); position: relative; overflow: hidden; border: 3px solid rgba(166, 193, 238, 0.3); }
        .score-fill { position: absolute; bottom: 0; left: 0; width: 100%; height: 0%; background: linear-gradient(135deg, var(--brand2), var(--brand1)); transition: height 2s ease-out; border-radius: 50%; }
        .score-value { font-size: 48px; font-weight: 900; color: var(--text); text-align: center; position: relative; z-index: 2; }
        .total-score .score-label { text-align: center; color: var(--text); font-weight: 600; margin-top: 4px; font-size: 14px; position: relative; z-index: 2; }
        
        .ai-comment { background: white; border-radius: 16px; padding: 24px; border: 1px solid rgba(0, 0, 0, 0.08); }
        .comment-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .ai-avatar { font-size: 24px; }
        .ai-comment h3 { margin: 0; font-size: 18px; font-weight: 700; color: var(--text); }
        .ai-comment p { margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: var(--text); }
        .comment-footer { display: flex; justify-content: flex-end; }
        .timestamp { font-size: 12px; color: var(--muted); }

        .section-header { margin-bottom: 24px; }
        .section-title { font-size: 22px; font-weight: 700; margin: 0 0 8px; color: var(--text); }
        .section-subtitle { font-size: 15px; color: var(--muted); margin: 0; }
        .chart-container { width: 100%; max-width: 450px; margin: 0 auto; }

        .detail-analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .metric-item { display: flex; flex-direction: column; gap: 12px; padding: 20px; background: white; border-radius: 12px; border: 1px solid rgba(0, 0, 0, 0.08); }
        .metric-header { display: flex; justify-content: space-between; align-items: baseline; }
        .metric-header .label { font-size: 16px; font-weight: 600; color: var(--text); }
        .metric-header .value { font-size: 24px; font-weight: 700; color: var(--brand2); }
        .metric-header .value .unit { font-size: 16px; font-weight: 500; color: var(--muted); margin-left: 2px; }
        .progress-bar { width: 100%; height: 8px; background: rgba(0, 0, 0, 0.1); border-radius: 4px; overflow: hidden; }
        .progress-bar-inner { height: 100%; width: 0%; background: linear-gradient(90deg, var(--brand2), var(--brand1)); border-radius: 4px; transition: width 1s ease-out; }
        .metric-insight { font-size: 14px; color: var(--muted); margin-top: 8px; line-height: 1.5; }

        .speech-bubble-chart-container { margin-top: 32px; position: relative; width: 100%; height: 120px; background: rgba(0,0,0,0.03); border-radius: var(--radius); padding: 20px; border: 1px solid var(--stroke); }
        .speech-bubble-chart-container h4 { margin: 0 0 12px; font-size: 14px; font-weight: 600; color: var(--muted); text-align: center; position: absolute; top: -35px; width: 100%; left: 0; }
        .speech-bubble { position: absolute; bottom: 20px; background: var(--brand2); border-radius: 50%; transform: translateX(-50%); transition: all .5s ease-out; cursor: pointer; }
        .speech-bubble:hover { transform: translateX(-50%) scale(1.1); }
        .tooltip { position: absolute; bottom: 110%; left: 50%; transform: translateX(-50%); background: var(--text); color: var(--bg); padding: 6px 10px; border-radius: 6px; font-size: 12px; white-space: nowrap; opacity: 0; visibility: hidden; transition: opacity .2s, visibility .2s; pointer-events: none; }
        .speech-bubble:hover .tooltip { opacity: 1; visibility: visible; }

        .key-moments-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .moment-card { border: 1px solid rgba(0, 0, 0, 0.08); border-radius: 16px; overflow: hidden; background: white; transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .moment-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1); }
        .moment-image { position: relative; }
        .moment-image img { width: 100%; height: 180px; object-fit: cover; background: #eee; }
        .moment-badge { position: absolute; top: 12px; right: 12px; background: linear-gradient(135deg, var(--brand2), var(--brand1)); color: white; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(166, 193, 238, 0.3); }
        .moment-card-content { padding: 20px; }
        .moment-card-content h4 { margin: 0 0 8px; font-size: 16px; font-weight: 700; color: var(--text); }
        .moment-card-content p { margin: 0; font-size: 14px; color: var(--muted); line-height: 1.6; }
        .moment-time { font-size: 12px; color: var(--brand2); margin-top: 12px; font-weight: 500; }

        .coaching-content { display: flex; flex-direction: column; gap: 32px; }
        .coaching-summary { background: linear-gradient(135deg, rgba(166, 193, 238, 0.05), rgba(251, 194, 235, 0.05)); padding: 24px; border-radius: 16px; border: 1px solid rgba(166, 193, 238, 0.2); }
        .coaching-summary h3 { font-size: 18px; font-weight: 700; margin: 0 0 12px; color: var(--text); }
        .coaching-summary p { font-size: 16px; line-height: 1.7; color: var(--text); margin: 0; }
        
        .coaching-details { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .coaching-section { background: white; padding: 20px; border-radius: 12px; border: 1px solid rgba(0, 0, 0, 0.08); }
        .coaching-section h4 { font-size: 16px; font-weight: 700; margin: 0 0 16px; color: var(--text); }
        .coaching-section ul { margin: 0; padding-left: 20px; }
        .coaching-section li { font-size: 14px; line-height: 1.6; color: var(--text); margin-bottom: 8px; }
        .coaching-section li:last-child { margin-bottom: 0; }
        
        .next-goals { display: flex; flex-direction: column; gap: 12px; }
        .goal-item { display: flex; align-items: center; gap: 12px; }
        .goal-number { width: 28px; height: 28px; background: linear-gradient(135deg, var(--brand2), var(--brand1)); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; box-shadow: 0 4px 12px rgba(166, 193, 238, 0.3); }
        .goal-text { font-size: 14px; color: var(--text); font-weight: 500; }
        
        .coaching-encouragement { display: flex; align-items: center; gap: 16px; padding: 24px; background: linear-gradient(135deg, rgba(166, 193, 238, 0.1), rgba(251, 194, 235, 0.1)); border-radius: 16px; border: 1px solid rgba(166, 193, 238, 0.2); }
        .encouragement-icon { font-size: 32px; }
        .coaching-encouragement p { font-size: 16px; line-height: 1.6; color: var(--text); margin: 0; font-weight: 500; }

        .calendar-nav-btn { background: none; border: none; cursor: pointer; font-size: 20px; color: var(--muted); padding: 8px; border-radius: 8px; transition: all 0.2s ease; }
        .calendar-nav-btn:hover { background: rgba(0, 0, 0, 0.05); color: var(--text); }

        .timeline-container { position: relative; height: 120px; margin-top: 20px; padding: 20px 0; }
        .timeline-track { position: absolute; top: 50%; transform: translateY(-50%); width: 100%; height: 2px; background: rgba(0, 0, 0, 0.1); z-index: 1; }
        .timeline-moment { position: absolute; top: 50%; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; z-index: 2; }
        .moment-peak { width: 12px; height: 12px; background: var(--brand2); border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 2px var(--brand2); margin-bottom: 8px; }
        .moment-label { font-size: 12px; color: var(--text); font-weight: 600; text-align: center; margin-bottom: 4px; }
        .moment-time { font-size: 10px; color: var(--muted); }
        .timeline-duration { position: absolute; bottom: 0; left: 0; right: 0; display: flex; justify-content: space-between; font-size: 10px; color: var(--muted); z-index: 1; }

        .voice-analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .voice-metrics { display: flex; flex-direction: column; gap: 24px; }

                 @media (max-width: 768px) {
           .history-card { grid-template-columns: 1fr; }
           .calendar-wrapper { border-right: none; padding-right: 0; }
           .session-list-wrapper { border-top: 1px solid var(--stroke); padding-top: 20px; }
           .summary-grid { grid-template-columns: 1fr; text-align: center; }
           .detail-analysis-grid { grid-template-columns: 1fr; }
           .key-moments-grid { grid-template-columns: 1fr; }
           .coaching-details { grid-template-columns: 1fr; }
           .voice-analysis-grid { grid-template-columns: 1fr; }
         }
      `}</style>
    </>
  );
}


