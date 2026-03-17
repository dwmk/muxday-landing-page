import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const destinationBase = 'https://app.muxday.com';

  // 1. Root path: Serves public/index.html automatically
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 2. /@VAR/... -> https://app.muxday.com?user=VAR/...
  if (pathname.startsWith('/@')) {
    const parts = pathname.split('/');
    const user = parts[1].substring(1);
    const rest = parts.slice(2).join('/');
    const newPath = rest ? `/${rest}` : '';
    return NextResponse.redirect(
      new URL(`${newPath}?user=${user}${search ? `&${search.slice(1)}` : ''}`, destinationBase)
    );
  }

  // 3. /app/VAR/... -> https://app.muxday.com/VAR/...
  if (pathname.startsWith('/app/')) {
    const newPath = pathname.replace('/app/', '/');
    return NextResponse.redirect(new URL(`${newPath}${search}`, destinationBase));
  }

  // 4. Default: Check if file exists in /public, otherwise redirect to destination
  // This handles the /url/url/... requirement
  return NextResponse.redirect(new URL(`${pathname}${search}`, destinationBase));
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};