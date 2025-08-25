import { NextRequest, NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { path } = params;
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  
  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/${path.join('/')}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log('프록시 요청:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('프록시 에러:', error);
    return NextResponse.json({ error: '프록시 요청 실패' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { path } = params;
  const body = await request.text();
  
  try {
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/${path.join('/')}`;
    
    console.log('프록시 POST 요청:', backendUrl);
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
    
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('프록시 POST 에러:', error);
    return NextResponse.json({ error: '프록시 요청 실패' }, { status: 500 });
  }
}
