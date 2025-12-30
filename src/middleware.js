import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Only apply to /api routes, but skip login, signup, check-auth, etc. if needed
    // However, most user-facing api routes require x-user-id
    if (pathname.startsWith('/api/') &&
        !pathname.startsWith('/api/login') &&
        !pathname.startsWith('/api/signup') &&
        !pathname.startsWith('/api/check-auth') &&
        !pathname.startsWith('/api/company-profile')) {

        const token = request.cookies.get('token')?.value;

        if (token) {
            try {
                const secret = new TextEncoder().encode(process.env.JWT_SECRET);
                const { payload } = await jwtVerify(token, secret);

                // Clone the headers and set the x-user-id
                const requestHeaders = new Headers(request.headers);
                if (payload.id) {
                    requestHeaders.set('x-user-id', payload.id);
                }

                // Return response with modified headers
                return NextResponse.next({
                    request: {
                        headers: requestHeaders,
                    },
                });
            } catch (error) {
                console.error('Middleware JWT Verification Error:', error);
                // Continue without header if verification fails? 
                // Or return 401? The routes themselves check for x-user-id and return 401
            }
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: '/api/:path*',
};
