import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // 요청 데이터 파싱
        const requestData = await request.json();
        const { user_id, email, access_token, refresh_token, persona } = requestData;

        // 필수 데이터 검증
        if (!user_id || !email || !access_token || !persona) {
            return NextResponse.json(
                { error: '필수 데이터가 누락되었습니다.' },
                { status: 400 }
            );
        }

        console.log('runpot 연결 요청 받음:', {
            user_id,
            email,
            persona_name: persona.name
        });

        // 백엔드 서버 URL 확인 (클라이언트에서도 참조되는 공개 변수 사용)
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        
        if (!backendUrl) {
            console.error('NEXT_PUBLIC_BACKEND_URL 환경 변수가 설정되지 않았습니다.');
            return NextResponse.json({
                success: false,
                error: '서버 설정 오류',
                details: 'NEXT_PUBLIC_BACKEND_URL 환경 변수가 설정되지 않았습니다. .env.local 파일에 NEXT_PUBLIC_BACKEND_URL을 설정해주세요.'
            }, { status: 500 });
        }

        console.log('백엔드 URL:', backendUrl);
        
        // runpot 서버로 전송할 데이터 준비
        const runpotRequestData = {
            user_id,
            email,
            access_token,
            refresh_token,
            persona: {
                name: persona.name,
                age: persona.age,
                mbti: persona.mbti,
                job: persona.job,
                personality: persona.personality,
                gender: persona.gender,
                image: persona.image
            },
            timestamp: new Date().toISOString(),
            source: 'dys_frontend'
        };

        console.log('runpot 서버로 전송할 데이터:', runpotRequestData);
        console.log('요청 URL:', `${backendUrl}/dys_studio`);

        // runpot 서버로 POST 요청
        const response = await fetch(`${backendUrl}/dys_studio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`,
                'X-Source': 'dys_frontend',
                'X-User-ID': user_id
            },
            body: JSON.stringify(runpotRequestData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('runpot 서버 응답 성공:', result);
            
            return NextResponse.json({
                success: true,
                message: 'runpot 서버 연결 성공',
                data: result,
                redirectUrl: result.redirectUrl || null
            });
        } else {
            const errorText = await response.text();
            console.error('runpot 서버 응답 실패:', response.status, errorText);
            
            return NextResponse.json({
                success: false,
                error: 'runpot 서버 연결 실패',
                status: response.status,
                details: errorText
            }, { status: response.status });
        }

    } catch (error) {
        console.error('runpot 연결 API 오류:', error);
        console.error('에러 스택:', error.stack);
        
        // 더 자세한 에러 정보 제공
        let errorDetails = error.message;
        if (error.code === 'ENOTFOUND') {
            errorDetails = '서버를 찾을 수 없습니다. URL을 확인해주세요.';
        } else if (error.code === 'ECONNREFUSED') {
            errorDetails = '서버 연결이 거부되었습니다. 서버가 실행 중인지 확인해주세요.';
        } else if (error.code === 'ETIMEDOUT') {
            errorDetails = '서버 연결 시간이 초과되었습니다.';
        }
        
        return NextResponse.json({
            success: false,
            error: '서버 내부 오류',
            details: errorDetails,
            errorCode: error.code || 'UNKNOWN'
        }, { status: 500 });
    }
}
