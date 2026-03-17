import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const destinationBase = 'https://app.muxday.com';

  // 1. Local Case: Root / (Serves public/index.html)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 2. Redirect Case: /@VAR/... -> https://app.muxday.com?user=VAR&...
  if (pathname.startsWith('/@')) {
    const parts = pathname.split('/');
    const user = parts[1].substring(1);
    const rest = parts.slice(2).join('/');
    
    const redirectUrl = new URL(rest ? `/${rest}` : '/', destinationBase);
    redirectUrl.searchParams.set('user', user);
    
    request.nextUrl.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });

    return NextResponse.redirect(redirectUrl);
  }

  // 3. Redirect Case: /invite/... -> https://app.muxday.com/invite/...
  if (pathname.startsWith('/invite/')) {
    return NextResponse.redirect(new URL(`${pathname}${search}`, destinationBase));
  }

  // 4. Redirect Case: /app -> https://app.muxday.com/
  //    Redirect Case: /app/VAR/... -> https://app.muxday.com/VAR/...
  if (pathname === '/app' || pathname === '/app/') {
    return NextResponse.redirect(new URL(`/${search}`, destinationBase));
  }

  if (pathname.startsWith('/app/')) {
    const newPath = pathname.replace('/app/', '/');
    return NextResponse.redirect(new URL(`${newPath}${search}`, destinationBase));
  }

  // 5. GENERAL CASE: Load the resource locally on the current domain
  // This allows /web/qrcode, /a.html, etc., to stay here.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - api routes
     * - _next/static & _next/image
     * - favicon.ico, logo.png, etc. (files with a dot)
     * - index.html
     */
    '/((?!api|_next/static|_next/image|favicon.ico|index.html|.*\\..*).*)',
  ],
};