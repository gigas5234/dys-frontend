import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

// 환경 변수가 없으면 더미 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 로그인 버튼 핸들러
export async function signInWithGoogle() {
  console.log('🔍 [SUPABASE] signInWithGoogle 시작');
  console.log('🔍 [SUPABASE] supabase 객체 확인:', !!supabase);
  console.log('🔍 [SUPABASE] supabase.auth 확인:', !!supabase.auth);
  
  // Vercel 배포 환경에서는 프로덕션 URL 사용
  const redirectUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://dys-phi.vercel.app';
    
  console.log('🔍 [SUPABASE] redirectTo URL:', redirectUrl);
  console.log('🔍 [SUPABASE] OAuth 설정 시작...');
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl
      }
    });
    
    console.log('🔍 [SUPABASE] OAuth 응답 받음');
    console.log('🔍 [SUPABASE] data:', data);
    console.log('🔍 [SUPABASE] error:', error);
    
    if (error) {
      console.error('❌ [SUPABASE] signInWithGoogle 에러:', error);
    } else {
      console.log('✅ [SUPABASE] signInWithGoogle 성공');
      console.log('🔍 [SUPABASE] data.url (리다이렉트 URL):', data?.url);
    }
    
    return { data, error };
  } catch (catchError) {
    console.error('❌ [SUPABASE] signInWithGoogle catch 에러:', catchError);
    return { data: null, error: catchError };
  }
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
    // 클라이언트에서만 실행
    if (typeof window === 'undefined') {
      return null;
    }
    
    // 먼저 현재 세션 확인
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [SUPABASE] 세션 확인 오류:', error);
      return null;
    }
    
    if (session) {
      // 토큰 만료 시간 확인
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      const timeUntilExpiry = expiresAt - now;
      
      console.log('🔍 [SUPABASE] 토큰 정보:');
      console.log('  - 만료 시간:', new Date(expiresAt * 1000).toLocaleString());
      console.log('  - 남은 시간:', Math.floor(timeUntilExpiry / 60), '분');
      console.log('  - 만료까지:', timeUntilExpiry > 0 ? '유효' : '만료됨');
      
      // 토큰이 만료되었으면 자동 로그아웃
      if (timeUntilExpiry <= 0) {
        console.log('⚠️ [SUPABASE] 토큰 만료됨, 자동 로그아웃 실행');
        await supabase.auth.signOut();
        return null;
      }
      
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
    if (typeof window === 'undefined') {
      return null;
    }
    
    // URL 해시에서 access_token 추출
    const hash = window.location.hash;
    
    if (!hash || !hash.includes('access_token=')) {
      return null;
    }
    
    console.log('🔍 [RESTORE] restoreSessionFromUrl 시작');
    console.log('🔍 [RESTORE] URL 해시:', hash);
    
    // URL 해시 파라미터 파싱 (더 정확한 파싱)
    const hashParams = new URLSearchParams(hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const expiresAt = hashParams.get('expires_at');
    const refreshToken = hashParams.get('refresh_token');
    const tokenType = hashParams.get('token_type');
    
    console.log('🔍 [RESTORE] 파싱된 토큰 정보:');
    console.log('  - accessToken:', accessToken ? '있음' : '없음');
    console.log('  - expiresAt:', expiresAt);
    console.log('  - refreshToken:', refreshToken ? '있음' : '없음');
    console.log('  - tokenType:', tokenType);
    
    if (!accessToken) {
      console.log('⚠️ [RESTORE] URL에 access_token이 없음');
      return null;
    }
    
    console.log('🔄 [RESTORE] URL에서 세션 복원 시도...');
    
    try {
      // 토큰으로 세션 설정
      console.log('🔍 [RESTORE] supabase.auth.setSession 호출');
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || accessToken
      });
      
      if (error) {
        console.error('❌ [RESTORE] 세션 설정 실패:', error);
        return null;
      }
      
      if (data.session) {
        console.log('✅ [RESTORE] 세션 복원 성공:', data.session.user.email);
        console.log('🔍 [RESTORE] 세션 정보:', {
          user: data.session.user.email,
          expires_at: data.session.expires_at,
          access_token: data.session.access_token ? '있음' : '없음'
        });
        return data.session;
      } else {
        console.log('⚠️ [RESTORE] 세션 데이터가 없음');
        return null;
      }
    } catch (sessionError) {
      console.error('❌ [RESTORE] 세션 설정 중 오류:', sessionError);
      return null;
    }
  } catch (error) {
    console.error('❌ [RESTORE] 세션 복원 중 오류:', error);
    return null;
  }
}

// 백엔드에서 프론트엔드로 돌아올 때 사용하는 함수
export function createReturnUrl(sessionId, additionalParams = {}) {
  try {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://dys-phi.vercel.app';
    
    const params = new URLSearchParams({
      return_from_backend: 'true',
      session_id: sessionId,
      timestamp: Date.now().toString(),
      ...additionalParams
    });
    
    return `${baseUrl}?${params.toString()}`;
  } catch (error) {
    console.error('Error creating return URL:', error);
    return typeof window !== 'undefined' ? window.location.origin : 'https://dys-phi.vercel.app';
  }
}

// 백엔드에서 돌아왔는지 확인하는 함수
export function isReturnFromBackend() {
  if (typeof window === 'undefined') return false;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('return_from_backend') === 'true';
}

// URL 파라미터 정리 함수
export function cleanReturnParams() {
  if (typeof window === 'undefined') return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const returnFromBackend = urlParams.get('return_from_backend');
  
  if (returnFromBackend === 'true') {
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

// 토큰 만료 시간 주기적 체크 (10분마다)
export function startTokenExpiryCheck() {
  if (typeof window === 'undefined') return;
  
  const checkExpiry = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      const timeUntilExpiry = expiresAt - now;
      
      // 10분 전에 경고 표시
      if (timeUntilExpiry <= 600 && timeUntilExpiry > 0) {
        console.log('⚠️ [SUPABASE] 토큰 만료 10분 전');
        // 여기에 사용자에게 경고 메시지를 표시할 수 있습니다
      }
      
      // 만료되면 자동 로그아웃
      if (timeUntilExpiry <= 0) {
        console.log('⚠️ [SUPABASE] 토큰 만료됨, 자동 로그아웃 실행');
        await supabase.auth.signOut();
        window.location.href = '/login';
      }
    }
  };
  
  // 10분마다 체크 (600,000ms = 10분)
  const interval = setInterval(checkExpiry, 600000);
  
  // 초기 체크
  checkExpiry();
  
  return interval;
}

// 온보딩 상태 업데이트
export const updateOnboardingStatus = async (status) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('❌ [ONBOARDING] 세션이 없습니다.');
      return { error: 'No session' };
    }
    
    const updateData = {
      onboarding_completed: status === 'completed',
      onboarding_dismissed: status === 'dismissed',
      onboarding_viewed_at: new Date().toISOString()
    };
    
    console.log('🔍 [ONBOARDING] 온보딩 상태 업데이트:', {
      userId: session.user.id,
      status: status,
      updateData: updateData
    });
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', session.user.id)
      .select();
      
    if (error) {
      console.error('❌ [ONBOARDING] 온보딩 상태 업데이트 오류:', error);
      return { error };
    }
    
    console.log('✅ [ONBOARDING] 온보딩 상태 업데이트 성공:', data);
    return { data, error: null };
  } catch (error) {
    console.error('❌ [ONBOARDING] 온보딩 상태 업데이트 중 예외:', error);
    return { error };
  }
};

// 온보딩 상태 확인
export const checkOnboardingStatus = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.log('⚠️ [ONBOARDING] 세션이 없어 온보딩 상태를 확인할 수 없습니다.');
      return { data: null, error: 'No session' };
    }
    
    console.log('🔍 [ONBOARDING] 온보딩 상태 확인 중:', session.user.id);
    
    const { data, error } = await supabase
      .from('users')
      .select('onboarding_completed, onboarding_dismissed, onboarding_viewed_at')
      .eq('id', session.user.id)
      .single();
      
    if (error) {
      console.error('❌ [ONBOARDING] 온보딩 상태 확인 오류:', error);
      return { data: null, error };
    }
    
    console.log('✅ [ONBOARDING] 온보딩 상태 확인 성공:', data);
    return { data, error: null };
  } catch (error) {
    console.error('❌ [ONBOARDING] 온보딩 상태 확인 중 예외:', error);
    return { data: null, error };
  }
};
