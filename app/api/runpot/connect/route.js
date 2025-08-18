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

        // runpot 서버 URL (환경 변수에서 가져오거나 기본값 사용)
        const runpotServerUrl = process.env.RUNPOT_SERVER_URL || 'https://your-runpot-server.com';
        
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

        // runpot 서버로 POST 요청
        const response = await fetch(`${runpotServerUrl}/api/dys_studio/connect`, {
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
        
        return NextResponse.json({
            success: false,
            error: '서버 내부 오류',
            details: error.message
        }, { status: 500 });
    }
}
