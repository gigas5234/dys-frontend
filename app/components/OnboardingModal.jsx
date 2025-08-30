"use client";

import React, { useState, useEffect } from 'react';
import { updateOnboardingStatus } from '../../lib/supabase';

 const OnboardingModal = ({ isOpen, onClose, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
           const slides = [
      {
        title: "마음에 드는 상대를 선택하세요.",
        description: "10명의 다양한 AI 페르소나 중에서 마음에 드는 상대를 선택할 수 있습니다.",
        image: "/onboarding/slide1-persona-selection.webp",
        alt: "페르소나 선택 화면",
        hasAnimation: false
      },
      {
        title: "바로 데이트를 시작해 보세요.",
        description: "다른 상대를 찾아볼 수도 있고, 준비가 완료되면 실제 AI 데이트를 시작할 수도 있습니다.",
        image: "/onboarding/slide2-chat-to-date.webp",
        alt: "채팅에서 두 가지 선택지",
        hasAnimation: false
      },
      {
        title: "개인화된 맞춤 자세를 측정하세요.",
        description: "자세 측정 하기를 시작하고 5초간 가만히 있으면 완료됩니다.",
        image: "/onboarding/slide3-camera.webp",
        alt: "자세 측정 화면",
        hasAnimation: false
      },
      {
        title: "실시간 피드백으로 소통 능력을 향상시키세요.",
        description: "카메라와 마이크를 통해 실시간으로 자세, 시선, 목소리를 분석받아 소통 능력을 개선하세요. 카메라와 마이크의 권한 요청이 진행됩니다.",
        image: "/onboarding/slide4-studio-overview.webp",
        alt: "GKE 스튜디오 전체 화면",
        hasAnimation: false
      }
    ];

       // 모달이 열릴 때 첫 번째 슬라이드로 리셋
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setDontShowAgain(false);
    }
  }, [isOpen]);

  // 다음 슬라이드로 이동
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  // 이전 슬라이드로 이동
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // 온보딩 완료 처리
  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // "다시 보지 않기"가 체크된 경우 completed로, 아니면 dismissed로 설정
      const status = dontShowAgain ? 'completed' : 'dismissed';
      await updateOnboardingStatus(status);
      onComplete();
    } catch (error) {
      console.error('온보딩 완료 처리 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  

  if (!isOpen) return null;

  const currentSlideData = slides[currentSlide];
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        {/* 헤더 */}
        <div className="onboarding-header">
          <div className="onboarding-progress">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`progress-dot ${index === currentSlide ? 'active' : ''} ${index < currentSlide ? 'completed' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
          <button className="onboarding-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* 슬라이드 내용 */}
        <div className="onboarding-content">
          <div className="slide-image-container">
            <img
              src={currentSlideData.image}
              alt={currentSlideData.alt}
              className="slide-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/600x400/e0e8ff/7d7d7d?text=Screenshot';
              }}
            />
            
                         {/* 애니메이션 요소들 */}
             {currentSlideData.hasAnimation && currentSlideData.animationElements?.map((element, index) => (
               <div
                 key={index}
                 className={`animation-element ${element.type}`}
                 style={{
                   left: element.x + '%',
                   top: element.y + '%',
                   width: element.width ? element.width + '%' : 'auto',
                   height: element.height ? element.height + '%' : 'auto',
                   animationDelay: `${element.delay}ms`
                 }}
               >
                {element.type === 'arrow' && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                )}
              </div>
            ))}
          </div>
          
          <div className="slide-text">
            <h2 className="slide-title">{currentSlideData.title}</h2>
            <p className="slide-description">{currentSlideData.description}</p>
          </div>
        </div>

        {/* 네비게이션 */}
        <div className="onboarding-navigation">
          <button
            className="nav-button prev"
            onClick={prevSlide}
            disabled={isFirstSlide}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6"></polyline>
            </svg>
            이전
          </button>

                                 <div className="navigation-center">
              {isLastSlide ? (
                <div className="final-actions">
                  <label className="dismiss-checkbox">
                    <input
                      type="checkbox"
                      checked={dontShowAgain}
                      onChange={(e) => setDontShowAgain(e.target.checked)}
                    />
                    <span>다시 보지 않기</span>
                  </label>
                  <button
                    className="btn btn-primary complete-btn"
                    onClick={handleComplete}
                    disabled={isLoading}
                  >
                    {isLoading ? '처리 중...' : '시작하기'}
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-primary next-btn"
                  onClick={nextSlide}
                >
                  다음
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
