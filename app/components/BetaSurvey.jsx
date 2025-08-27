'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const BetaSurvey = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      question: '실제적으로 도움이 되었나요?',
      required: true
    },
    {
      id: 'satisfaction',
      question: '전반적인 만족도는 어떠신가요?',
      required: true
    },
    {
      id: 'ease_of_use',
      question: '사용하기 쉬웠나요?',
      required: true
    },
    {
      id: 'recommendation',
      question: '다른 사람에게 추천하시겠습니까?',
      required: true
    },
    {
      id: 'overall_experience',
      question: '전체적인 경험은 어떠셨나요?',
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

  return (
    <div className="beta-survey-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="beta-survey-toggle"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          width: '100%',
          marginBottom: '10px',
          transition: 'all 0.3s ease'
        }}
      >
        {isOpen ? '베타 테스트 설문 닫기' : '베타 테스트 설문'}
      </button>

      {isOpen && (
        <div className="beta-survey-modal" style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            color: '#333',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            베타 테스트 설문조사
          </h3>
          
          <form onSubmit={handleSubmit}>
            {questions.map((q) => (
              <div key={q.id} style={{ marginBottom: '20px' }}>
                <p style={{
                  margin: '0 0 10px 0',
                  fontWeight: '500',
                  color: '#333',
                  fontSize: '14px'
                }}>
                  {q.question} {q.required && <span style={{ color: 'red' }}>*</span>}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {options.map((option) => (
                    <label key={option.value} style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#555'
                    }}>
                      <input
                        type="radio"
                        name={q.id}
                        value={option.value}
                        checked={formData[q.id] === option.value}
                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                        required={q.required}
                        style={{ marginRight: '8px' }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginBottom: '20px' }}>
              <p style={{
                margin: '0 0 10px 0',
                fontWeight: '500',
                color: '#333',
                fontSize: '14px'
              }}>
                추가 의견이나 개선사항을 알려주세요
              </p>
              <textarea
                value={formData.feedback}
                onChange={(e) => handleInputChange('feedback', e.target.value)}
                placeholder="의견을 자유롭게 작성해주세요..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '13px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                style={{
                  background: isFormValid() && !isSubmitting 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#ccc',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: isFormValid() && !isSubmitting ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500',
                  flex: 1
                }}
              >
                {isSubmitting ? '제출 중...' : '설문 제출'}
              </button>
              
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: '#f5f5f5',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BetaSurvey;
