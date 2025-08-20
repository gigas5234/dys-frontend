"use client";

import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

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
  const radarChartRef = useRef(null);

  // 파트너/더미 데이터 (속도 항목 제거)
  const aiPartners = [
    { id: 1, gender: "female", name: "김세아", age: 28, mbti: "ENFP", job: "마케터", personality: ["활발함", "긍정적"], image: "/img/woman1_insta.webp" },
    { id: 2, gender: "female", name: "박서진", age: 25, mbti: "ESFJ", job: "대학생", personality: ["사교적", "다정함"], image: "/img/woman2_insta.webp" },
    { id: 3, gender: "female", name: "최유나", age: 34, mbti: "INFJ", job: "상담사", personality: ["통찰력", "따뜻함"], image: "/img/woman3_insta.webp" },
    { id: 4, gender: "male", name: "이준영", age: 31, mbti: "ISTJ", job: "개발자", personality: ["논리적", "신중함"], image: "/img/man2_insta.webp" },
    { id: 5, gender: "male", name: "정현우", age: 29, mbti: "ENTP", job: "스타트업 대표", personality: ["도전적", "창의적"], image: "/img/man3_insta.webp" }
  ];

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
    { date: "2025-08-18", partnerId: 1, report: generateRandomReport() },
    { date: "2025-08-20", partnerId: 2, report: generateRandomReport() },
    { date: "2025-08-20", partnerId: 4, report: generateRandomReport() },
    { date: "2025-08-21", partnerId: 3, report: generateRandomReport() }
  ];

  useEffect(() => {
    renderCalendar(currentDate);
    // 초기 진입 시 가장 최근 세션 날짜 선택
    const mostRecent = coachingHistory.map(s => s.date).sort().pop();
    if (mostRecent) {
      const dt = new Date(mostRecent);
      setCurrentDate(dt);
      renderCalendar(dt);
      const dayEl = calendarBodyRef.current?.querySelector(`.calendar-day[data-date="${mostRecent}"]`);
      if (dayEl) selectDate(dayEl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    calendarBodyRef.current?.querySelectorAll(".calendar-day.selected").forEach((el) => el.classList.remove("selected"));
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
      container.innerHTML = '<p style="text-align:center; color: var(--muted);">선택한 날짜에 기록이 없습니다.</p>';
      if (reportContentRef.current) reportContentRef.current.style.display = "none";
      return;
    }

    Object.values(byPartner).flat().forEach((session) => {
      const partner = aiPartners.find((p) => p.id === session.partnerId);
      const itemEl = document.createElement("div");
      itemEl.className = "session-item";
      itemEl.innerHTML = `
        <img src="${partner.image}" alt="${partner.name}" />
        <div class="session-info">
          <h4>${partner.name}</h4>
          <p>${partner.mbti}</p>
        </div>
      `;
      itemEl.addEventListener("click", () => {
        container.querySelectorAll(".session-item.active").forEach((el) => el.classList.remove("active"));
        itemEl.classList.add("active");
        updateReport(session.report);
      });
      container.appendChild(itemEl);
    });

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
    segments.forEach((seg) => {
      const bubble = document.createElement("div");
      bubble.className = "speech-bubble";
      const size = 20 + seg.duration * 3;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${(seg.time / totalDuration) * 100}%`;
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
      totalScoreRef.current.dataset.value = String(reportData.totalScore);
      animateValue(totalScoreRef.current, 0, reportData.totalScore, 1000);
    }
    if (aiSummaryRef.current) {
      aiSummaryRef.current.textContent = "AI가 이 세션에 대한 종합적인 코멘트를 제공합니다. 전반적으로 훌륭했지만, 개선할 점도 보이네요!";
    }
    if (finalCoachingRef.current) {
      finalCoachingRef.current.innerHTML = `이번 코칭도 정말 수고 많으셨습니다! <strong>집중 개선</strong> 포인트를 기준으로 다음 세션을 계획해보세요.`;
    }

    // 메트릭 값 업데이트 (발표 속도 제거)
    const metricValues = {
      "시선 안정성": reportData.posture.gaze,
      "긍정적 표정": reportData.posture.expression,
      "자세 안정성": reportData.posture.stability,
      "평균 미소 유지": reportData.posture.smileDuration,
      "목소리 자신감": reportData.voice.confidence,
    };

    document.querySelectorAll(".metric-item").forEach((item) => {
      const label = item.querySelector(".label")?.textContent || "";
      const valueEl = item.querySelector(".value");
      const bar = item.querySelector(".progress-bar-inner");
      if (!valueEl || !bar) return;
      const value = metricValues[label];
      valueEl.dataset.value = String(value);
      bar.dataset.value = label === "평균 미소 유지" ? String(Number(value) * 25) : String(value);
      animateValue(valueEl, 0, Number(value), 1000, label === "평균 미소 유지");
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
          <div className="header-right">
            <a href="/login" className="btn btn-login">로그인</a>
          </div>
        </div>
      </header>

      <div className="persona-container" style={{ marginTop: "var(--header-height)", minHeight: "calc(100vh - var(--header-height))" }}>
        <aside className="sidebar">
          <div className="logo">데연소</div>
          <nav>
            <a href="/persona">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2 4 4 8-8 2 2-10 10-6-6"/></svg>
              페르소나 선택
            </a>
            <a href="/feedback" className="active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h10"/></svg>
              피드백 리포트
            </a>
            <a href="/settings">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              설정
            </a>
          </nav>
        </aside>

        <main className="main-content" style={{ padding: 24 }}>
          <div className="container" style={{ maxWidth: 800, margin: "0 auto" }}>
            <header className="report-header" style={{ textAlign: "center", marginBottom: 0 }}>
              <h1>AI 코칭 히스토리</h1>
              <p>캘린더에서 날짜를 선택하여 과거의 분석 리포트를 확인해보세요.</p>
            </header>

            <div className="history-card card">
              <div className="calendar-wrapper">
                <div className="calendar-header">
                  <button onClick={prevMonth}>‹</button>
                  <h2 ref={currentMonthRef} id="current-month"></h2>
                  <button onClick={nextMonth}>›</button>
                </div>
                <div className="calendar-grid" ref={calendarBodyRef} id="calendar-body"></div>
              </div>
              <div className="session-list-wrapper">
                <h3 ref={sessionListTitleRef} id="session-list-title">세션 목록</h3>
                <div className="session-list-container" ref={sessionListRef} id="session-list"></div>
              </div>
            </div>

            <div id="report-content" ref={reportContentRef} style={{ display: "none" }}>
              <section className="card">
                <div className="summary-grid">
                  <div className="total-score">
                    <div className="score-value" ref={totalScoreRef} id="total-score" data-value="0">0</div>
                    <div className="score-label">종합 매력 점수</div>
                  </div>
                  <div className="ai-comment">
                    <h3>💡 코치의 한마디</h3>
                    <p ref={aiSummaryRef} id="ai-summary"></p>
                  </div>
                </div>
              </section>

              <section className="card" style={{ animationDelay: "0.1s" }}>
                <h2 className="section-title">매력 지수 요약</h2>
                <div className="chart-container">
                  <canvas ref={radarCanvasRef} id="radarChart" />
                </div>
              </section>

              <section className="card" style={{ animationDelay: "0.2s" }}>
                <h2 className="section-title">✨ 최고의 순간</h2>
                <div className="key-moments-grid">
                  <div className="moment-card">
                    <img src="https://placehold.co/400x220/E9EFFF/4A72FF?text=Best+Smile" alt="최고의 미소 순간" />
                    <div className="moment-card-content">
                      <h4>최고의 미소 순간</h4>
                      <p>자연스러운 미소로 긍정적인 분위기를 만들었어요.</p>
                    </div>
                  </div>
                  <div className="moment-card">
                    <img src="https://placehold.co/400x220/E4F6E7/28A745?text=Good+Posture" alt="이상적인 자세" />
                    <div className="moment-card-content">
                      <h4>이상적인 자세</h4>
                      <p>상대방의 이야기에 귀 기울일 때 신뢰감 있는 자세를 보여주었어요.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="card" style={{ animationDelay: "0.3s" }}>
                <h2 className="section-title">🤸 자세 & 표정 분석</h2>
                <div className="detail-analysis-grid">
                  <div className="metric-item">
                    <div className="metric-header">
                      <span className="label">시선 안정성</span>
                      <span className="value" data-value="0">0<span className="unit">%</span></span>
                    </div>
                    <div className="progress-bar"><div className="progress-bar-inner" data-value="0"></div></div>
                    <div className="metric-insight">상대방의 눈을 편안하게 바라보았어요.</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-header">
                      <span className="label">긍정적 표정</span>
                      <span className="value" data-value="0">0<span className="unit">%</span></span>
                    </div>
                    <div className="progress-bar"><div className="progress-bar-inner" data-value="0"></div></div>
                    <div className="metric-insight">밝은 표정이 대화 분위기를 이끌었어요.</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-header">
                      <span className="label">자세 안정성</span>
                      <span className="value" data-value="0">0<span className="unit">%</span></span>
                    </div>
                    <div className="progress-bar"><div className="progress-bar-inner" data-value="0"></div></div>
                    <div className="metric-insight">대부분 안정적이었으나, 가끔 움직임이 있었어요.</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-header">
                      <span className="label">평균 미소 유지</span>
                      <span className="value" data-value="0">0<span className="unit">초</span></span>
                    </div>
                    <div className="progress-bar"><div className="progress-bar-inner" data-value="0"></div></div>
                    <div className="metric-insight">자연스러운 미소로 호감을 주었어요.</div>
                  </div>
                </div>
              </section>

              <section className="card" style={{ animationDelay: "0.4s" }}>
                <h2 className="section-title">🎤 음성 & 대화 분석</h2>
                <div className="detail-analysis-grid">
                  <div className="metric-item">
                    <div className="metric-header">
                      <span className="label">목소리 자신감</span>
                      <span className="value" data-value="0">0<span className="unit">점</span></span>
                    </div>
                    <div className="progress-bar"><div className="progress-bar-inner" data-value="0"></div></div>
                    <div className="metric-insight">조금 더 힘 있는 목소리가 전달력을 높여요.</div>
                  </div>
                </div>
                <div className="speech-bubble-chart-container" ref={speechBubbleContainerRef} id="speechBubbleChart">
                  <h4>발화 구간별 목소리 자신감</h4>
                </div>
              </section>

              <section className="card final-coaching" style={{ animationDelay: "0.5s" }}>
                <h2 className="section-title">💌 AI 종합 코칭</h2>
                <p ref={finalCoachingRef} id="final-coaching-text"></p>
              </section>
            </div>
          </div>
        </main>
      </div>

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
        .session-marker { width: 5px; height: 5px; border-radius: 50%; background: var(--brand2); }

        .report-header h1 { font-size: 28px; font-weight: 800; margin: 0 0 8px; }
        .report-header p { font-size: 15px; color: var(--muted); margin: 0; }

        .card { background: var(--glass); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: var(--radius); border: 1px solid var(--stroke); padding: 28px; box-shadow: var(--shadow); opacity: 0; transform: translateY(20px); animation: fadeInUp .7s ease-out forwards; }
        @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
        .summary-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 28px; align-items: center; }
        .total-score .score-value { font-size: 56px; font-weight: 900; color: var(--text); text-align: center; }
        .total-score .score-label { text-align: center; color: var(--muted); font-weight: 500; margin-top: -6px; }
        .ai-comment h3 { margin: 0 0 12px; font-size: 18px; font-weight: 700; display: flex; align-items: center; gap: 8px; color: var(--text); }
        .ai-comment p { margin: 0; font-size: 15px; line-height: 1.7; color: var(--muted); }

        .section-title { font-size: 20px; font-weight: 700; margin: 0 0 18px; padding-bottom: 12px; border-bottom: 1px solid var(--stroke); color: var(--text); }
        .chart-container { width: 100%; max-width: 450px; margin: 0 auto; }

        .detail-analysis-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .metric-item { display: flex; flex-direction: column; gap: 8px; }
        .metric-header { display: flex; justify-content: space-between; align-items: baseline; }
        .metric-header .label { font-size: 16px; font-weight: 600; color: var(--muted); }
        .metric-header .value { font-size: 22px; font-weight: 700; color: var(--text); }
        .metric-header .value .unit { font-size: 15px; font-weight: 500; color: var(--muted); margin-left: 2px; }
        .progress-bar { width: 100%; height: 8px; background: var(--stroke); border-radius: 4px; overflow: hidden; }
        .progress-bar-inner { height: 100%; width: 0%; background: var(--brand2); border-radius: 4px; transition: width 1s ease-out; }
        .metric-insight { font-size: 13px; color: var(--muted); margin-top: 4px; }

        .speech-bubble-chart-container { margin-top: 32px; position: relative; width: 100%; height: 120px; background: rgba(0,0,0,0.03); border-radius: var(--radius); padding: 10px; border: 1px solid var(--stroke); }
        .speech-bubble-chart-container h4 { margin: 0 0 12px; font-size: 16px; font-weight: 600; color: var(--muted); text-align: center; position: absolute; top: -35px; width: 100%; left: 0; }
        .speech-bubble { position: absolute; bottom: 10px; background: var(--brand2); border-radius: 50%; transform: translateX(-50%); transition: all .5s ease-out; cursor: pointer; }
        .speech-bubble:hover { transform: translateX(-50%) scale(1.1); }
        .tooltip { position: absolute; bottom: 110%; left: 50%; transform: translateX(-50%); background: var(--text); color: var(--bg); padding: 6px 10px; border-radius: 6px; font-size: 12px; white-space: nowrap; opacity: 0; visibility: hidden; transition: opacity .2s, visibility .2s; pointer-events: none; }
        .speech-bubble:hover .tooltip { opacity: 1; visibility: visible; }

        .key-moments-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .moment-card { border: 1px solid var(--stroke); border-radius: var(--radius); overflow: hidden; background: #fff; }
        .moment-card img { width: 100%; height: 180px; object-fit: cover; background: #eee; }
        .moment-card-content { padding: 16px; }
        .moment-card-content h4 { margin: 0 0 8px; font-size: 16px; font-weight: 700; color: var(--text); }
        .moment-card-content p { margin: 0; font-size: 14px; color: var(--muted); }

        .final-coaching p { font-size: 16px; line-height: 1.8; color: var(--text); }

        @media (max-width: 768px) {
          .history-card { grid-template-columns: 1fr; }
          .calendar-wrapper { border-right: none; padding-right: 0; }
          .session-list-wrapper { border-top: 1px solid var(--stroke); padding-top: 20px; }
          .summary-grid { grid-template-columns: 1fr; text-align: center; }
          .detail-analysis-grid { grid-template-columns: 1fr; }
          .key-moments-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}


