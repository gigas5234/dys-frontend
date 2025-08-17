import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

// 환경 변수가 없으면 더미 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 로그인 버튼 핸들러
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000"
    }
  });
  if (error) console.error(error);
  return { data, error };
}

// 로그인 후 세션 확인 & 내 프로필 조회(본인 로우만 보임)
export async function fetchMyProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No session");
  const { data, error } = await supabase.from("users").select("*").single();
  if (error) throw error;
  return data;
}

// 로그아웃
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error(error);
  return { error };
}

// 현재 세션 가져오기
export async function getCurrentSession() {
  try {
    console.log('🔍 [SUPABASE] 세션 확인 시작...');
    
    // 먼저 현재 세션 확인
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [SUPABASE] 세션 확인 오류:', error);
      return null;
    }
    
    if (session) {
      console.log('✅ [SUPABASE] 활성 세션 발견:', {
        user_id: session.user.id,
        email: session.user.email,
        expires_at: session.expires_at
      });
      return session;
    }
    
    // 세션이 없으면 URL에서 토큰 확인
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user_id = urlParams.get('user_id');
    const email = urlParams.get('email');
    
    if (token && user_id && email) {
      console.log('🔄 [SUPABASE] URL에서 토큰 감지, 세션 복원 시도...');
      
      try {
        // 토큰으로 세션 설정
        const { data, error: setSessionError } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token // 임시로 같은 토큰 사용
        });
        
        if (setSessionError) {
          console.error('❌ [SUPABASE] 세션 설정 실패:', setSessionError);
          return null;
        }
        
        if (data.session) {
          console.log('✅ [SUPABASE] 세션 복원 성공');
          return data.session;
        }
      } catch (restoreError) {
        console.error('❌ [SUPABASE] 세션 복원 실패:', restoreError);
      }
    }
    
    console.log('⚠️ [SUPABASE] 활성 세션 없음');
    return null;
  } catch (error) {
    console.error('❌ [SUPABASE] 세션 확인 중 예외 발생:', error);
    return null;
  }
}

// JWT 토큰을 백엔드로 전송
export async function sendAuthToBackend(backendUrl) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No session found');
      return false;
    }

    const response = await fetch(`${backendUrl}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        user_id: session.user.id,
        email: session.user.email,
        access_token: session.access_token,
        refresh_token: session.refresh_token
      })
    });

    if (response.ok) {
      console.log('Auth sent to backend successfully');
      return true;
    } else {
      console.error('Failed to send auth to backend:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error sending auth to backend:', error);
    return false;
  }
}

// iframe용 URL 생성 (JWT 토큰 포함)
export async function getIframeUrl(baseUrl, path) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      console.error('No session found for iframe URL');
      return `${baseUrl}/${path}`;
    }

    // JWT 토큰을 URL 파라미터로 전달
    const params = new URLSearchParams({
      user_id: session.user.id,
      email: session.user.email,
      token: session.access_token
    });

    return `${baseUrl}/${path}?${params.toString()}`;
  } catch (error) {
    console.error('Error generating iframe URL:', error);
    return `${baseUrl}/${path}`;
  }
}

// URL에서 토큰을 사용하여 세션 복원
export async function restoreSessionFromUrl() {
  try {
    if (typeof window === 'undefined') return null;
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const user_id = urlParams.get('user_id');
    const email = urlParams.get('email');
    
    if (!token || !user_id || !email) {
      return null;
    }
    
    console.log('🔄 [RESTORE] URL에서 세션 복원 시도...');
    
    // 토큰 유효성 검증
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('❌ [RESTORE] 토큰 유효성 검증 실패:', error);
      return null;
    }
    
    if (data.user && data.user.id === user_id) {
      console.log('✅ [RESTORE] 토큰 유효성 확인됨');
      
      // 세션 설정
      const { data: sessionData, error: setError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: token
      });
      
      if (setError) {
        console.error('❌ [RESTORE] 세션 설정 실패:', setError);
        return null;
      }
      
      if (sessionData.session) {
        console.log('✅ [RESTORE] 세션 복원 성공');
        return sessionData.session;
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ [RESTORE] 세션 복원 중 오류:', error);
    return null;
  }
}
