-- 베타 테스트 설문조사 테이블 생성
CREATE TABLE IF NOT EXISTS beta_surveys (
    id BIGSERIAL PRIMARY KEY,
    helpfulness TEXT NOT NULL CHECK (helpfulness IN ('very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied')),
    satisfaction TEXT NOT NULL CHECK (satisfaction IN ('very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied')),
    ease_of_use TEXT NOT NULL CHECK (ease_of_use IN ('very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied')),
    recommendation TEXT NOT NULL CHECK (recommendation IN ('very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied')),
    overall_experience TEXT NOT NULL CHECK (overall_experience IN ('very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied')),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE beta_surveys ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 설문을 제출할 수 있도록 정책 설정
CREATE POLICY "Allow public insert on beta_surveys" ON beta_surveys
    FOR INSERT WITH CHECK (true);

-- 관리자만 조회할 수 있도록 정책 설정 (선택사항)
CREATE POLICY "Allow admin select on beta_surveys" ON beta_surveys
    FOR SELECT USING (auth.role() = 'authenticated');

-- updated_at 자동 업데이트를 위한 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_beta_surveys_updated_at 
    BEFORE UPDATE ON beta_surveys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_beta_surveys_created_at ON beta_surveys(created_at);
CREATE INDEX IF NOT EXISTS idx_beta_surveys_satisfaction ON beta_surveys(satisfaction);

-- 댓글: 이 SQL 스크립트를 Supabase SQL Editor에서 실행하세요
