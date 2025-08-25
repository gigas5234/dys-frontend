export async function GET() {
  try {
    // GKE 백엔드 URL (LoadBalancer 포트 80 사용)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://34.64.136.237';
    
    console.log('🔍 [PROXY] Health check 시작:', backendUrl);
    console.log('🔍 [PROXY] 환경 변수 확인:', {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV
    });
    
    const response = await fetch(`${backendUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🔍 [PROXY] Health check 응답:', response.status);
    
    if (!response.ok) {
      console.error('❌ [PROXY] Health check 실패:', response.status);
      return new Response(JSON.stringify({ 
        error: 'Backend health check failed',
        status: response.status 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const data = await response.json();
    console.log('✅ [PROXY] Health check 성공:', data);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ [PROXY] Health check 에러:', error);
    return new Response(JSON.stringify({ 
      error: 'Backend connection failed',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
