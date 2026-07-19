import { NextRequest, NextResponse } from 'next/server';

const STORAGE_SERVER_URL = process.env.STORAGE_SERVER_URL ?? 'http://localhost:3001';

async function proxyRequest(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const storagePath = url.pathname.replace('/api', '');
  const storageUrl = `${STORAGE_SERVER_URL}${storagePath}${url.search}`;

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('content-length');

  try {
    const response = await fetch(storageUrl, {
      method: request.method,
      headers,
      body: request.body,
      cache: 'no-store',
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Storage server unavailable',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 },
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  return proxyRequest(request);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return proxyRequest(request);
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  return proxyRequest(request);
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  return proxyRequest(request);
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
