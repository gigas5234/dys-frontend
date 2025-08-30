-- 온보딩 기능을 위한 users 테이블 스키마 업데이트
-- 이 스크립트는 기존 users 테이블에 온보딩 관련 필드를 추가합니다.

-- 1. 온보딩 완료 상태 필드 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- 2. 온보딩 거부 상태 필드 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_dismissed BOOLEAN DEFAULT FALSE;

-- 3. 온보딩 마지막 조회 시간 필드 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_viewed_at TIMESTAMP WITH TIME ZONE;

-- 4. 다시 보지 않기 설정 필드 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_dont_show_again BOOLEAN DEFAULT FALSE;

-- 5. 기존 사용자들의 온보딩 상태를 기본값으로 설정 (선택사항)
-- UPDATE users SET 
--     onboarding_completed = FALSE,
--     onboarding_dismissed = FALSE,
--     onboarding_viewed_at = NULL,
--     onboarding_dont_show_again = FALSE
-- WHERE onboarding_completed IS NULL;

-- 6. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_onboarding_status ON users(onboarding_completed, onboarding_dismissed, onboarding_dont_show_again);

-- 7. 뷰 생성 (온보딩 통계용)
CREATE OR REPLACE VIEW onboarding_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE onboarding_completed = TRUE) as completed_users,
    COUNT(*) FILTER (WHERE onboarding_dismissed = TRUE) as dismissed_users,
    COUNT(*) FILTER (WHERE onboarding_completed = FALSE AND onboarding_dismissed = FALSE) as pending_users,
    COUNT(*) FILTER (WHERE onboarding_dont_show_again = TRUE) as dont_show_again_users,
    ROUND(
        (COUNT(*) FILTER (WHERE onboarding_completed = TRUE)::DECIMAL / COUNT(*)) * 100, 2
    ) as completion_rate
FROM users;

-- 8. 함수 생성 (온보딩 상태 업데이트용)
CREATE OR REPLACE FUNCTION update_onboarding_status(
    user_id UUID,
    status TEXT,
    dont_show_again BOOLEAN DEFAULT FALSE,
    view_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE users 
    SET 
        onboarding_completed = (status = 'completed'),
        onboarding_dismissed = (status = 'dismissed'),
        onboarding_viewed_at = view_time,
        onboarding_dont_show_again = dont_show_again
    WHERE id = user_id;
    
    RETURN FOUND;
END;
$$;

-- 9. 트리거 함수 생성 (사용자 생성 시 기본 온보딩 상태 설정)
CREATE OR REPLACE FUNCTION set_default_onboarding_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.onboarding_completed = FALSE;
    NEW.onboarding_dismissed = FALSE;
    NEW.onboarding_viewed_at = NULL;
    NEW.onboarding_dont_show_again = FALSE;
    RETURN NEW;
END;
$$;

-- 10. 트리거 생성
DROP TRIGGER IF EXISTS trigger_set_default_onboarding_status ON users;
CREATE TRIGGER trigger_set_default_onboarding_status
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_default_onboarding_status();

-- 11. 권한 설정 (필요한 경우)
-- GRANT SELECT, UPDATE ON users TO authenticated;
-- GRANT SELECT ON onboarding_stats TO authenticated;

-- 확인 쿼리
-- SELECT 
--     column_name, 
--     data_type, 
--     is_nullable, 
--     column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- AND column_name LIKE 'onboarding%'
-- ORDER BY column_name;
