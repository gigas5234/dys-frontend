'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const BetaSurvey = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleOpenSurvey = () => {
      setIsOpen(true);
    };

    window.addEventListener('openBetaSurvey', handleOpenSurvey);
    
    return () => {
      window.removeEventListener('openBetaSurvey', handleOpenSurvey);
    };
  }, []);
  const [formData, setFormData] = useState({
    helpfulness: '',
    satisfaction: '',
    ease_of_use: '',
    recommendation: '',
    overall_experience: '',
    feedback: ''
  });

  const questions = [
    {
      id: 'helpfulness',
      question: '데연소를 이용하면서 실제 대화 실전 연습에 도움이 되었나요?',
      required: true
    },
    {
      id: 'satisfaction',
      question: '자세·시선 교정 기능이 대화 태도 개선에 도움이 되었나요?',
      required: true
    },
    {
      id: 'ease_of_use',
      question: '목소리 톤·감정 피드백이 실제 대화 자신감 향상에 기여했나요?',
      required: true
    },
    {
      id: 'recommendation',
      question: 'AI 페르소나(가상 상대)와의 대화가 자연스럽고 몰입감이 있었나요?',
      required: true
    },
    {
      id: 'overall_experience',
      question: '데연소를 사용한 후 실제 소개팅/데이트 상황에 대비하는 자신감이 향상되었다고 느끼시나요?',
      required: true
    }
  ];

  const options = [
    { value: 'very_satisfied', label: '매우 만족' },
    { value: 'satisfied', label: '만족' },
    { value: 'neutral', label: '보통' },
    { value: 'dissatisfied', label: '불만족' },
    { value: 'very_dissatisfied', label: '매우 불만족' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return questions.every(q => q.required && formData[q.id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      alert('모든 필수 항목을 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('beta_surveys')
        .insert([
          {
            helpfulness: formData.helpfulness,
            satisfaction: formData.satisfaction,
            ease_of_use: formData.ease_of_use,
            recommendation: formData.recommendation,
            overall_experience: formData.overall_experience,
            feedback: formData.feedback,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('설문 제출 오류:', error);
        alert('설문 제출 중 오류가 발생했습니다.');
      } else {
        alert('설문이 성공적으로 제출되었습니다. 감사합니다!');
        setFormData({
          helpfulness: '',
          satisfaction: '',
          ease_of_use: '',
          recommendation: '',
          overall_experience: '',
          feedback: ''
        });
        setIsOpen(false);
      }
    } catch (error) {
      console.error('설문 제출 오류:', error);
      alert('설문 제출 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      helpfulness: '',
      satisfaction: '',
      ease_of_use: '',
      recommendation: '',
      overall_experience: '',
      feedback: ''
    });
  };

  // 설문이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#f8f9fa',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '20px'
    }}>
      <div className="container" style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* 헤더 */}
        <header className="report-header" style={{ textAlign: "center", marginBottom: "40px", position: "relative" }}>
          <div className="header-content">
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: '#333',
              marginBottom: '10px'
            }}>
              베타 테스트 설문조사
            </h1>
            <p style={{ 
              fontSize: '16px', 
              color: '#666',
              marginBottom: '20px'
            }}>
              서비스 개선을 위한 소중한 의견을 들려주세요
            </p>
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '0',
                right: '0',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>
        </header>

        {/* 설문 폼 */}
        <div className="card" style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <form onSubmit={handleSubmit}>
            {questions.map((q, index) => (
              <div key={q.id} style={{ 
                marginBottom: '30px',
                padding: '25px',
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                backgroundColor: '#fafafa'
              }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  color: '#333',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  {index + 1}. {q.question} {q.required && <span style={{ color: 'red' }}>*</span>}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {options.map((option) => (
                    <label key={option.value} style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#555',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      transition: 'background-color 0.2s',
                      border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={option.value}
                        checked={formData[q.id] === option.value}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                        required={q.required}
                        style={{ 
                          marginRight: '12px',
                          transform: 'scale(1.2)'
                        }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}

                         <div style={{ marginBottom: '30px' }}>
               <h3 style={{
                 margin: '0 0 20px 0',
                 color: '#333',
                 fontSize: '18px',
                 fontWeight: '600'
               }}>
                 6. 추가로 원하시는 기능이나 개선되었으면 하는 점을 자유롭게 작성해주세요.
               </h3>
              <textarea
                value={formData.feedback}
                onChange={(e) => handleInputChange('feedback', e.target.value)}
                placeholder="의견을 자유롭게 작성해주세요. 서비스 개선에 큰 도움이 됩니다..."
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.5'
                }}
              />
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '15px',
              justifyContent: 'center',
              marginTop: '40px'
            }}>
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                style={{
                  background: isFormValid() && !isSubmitting 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#ccc',
                  color: 'white',
                  border: 'none',
                  padding: '15px 40px',
                  borderRadius: '8px',
                  cursor: isFormValid() && !isSubmitting ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: '600',
                  minWidth: '150px',
                  transition: 'all 0.3s ease'
                }}
              >
                {isSubmitting ? '제출 중...' : '설문 제출'}
              </button>
              
              <button
                type="button"
                onClick={handleClose}
                style={{
                  background: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '15px 40px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  minWidth: '100px',
                  transition: 'all 0.3s ease'
                }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BetaSurvey;
