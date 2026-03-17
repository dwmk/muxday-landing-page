import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const destinationBase = 'https://app.muxday.com';

  // 1. Local Case: Root / (Serves public/index.html)
  if (pathname === '/') {
    return NextResponse.next();
  }

    // 2. REWRITE for dynamic embeds: /@username or /@username/ANYTHING
  //    → always shows the profile embed (ignores extra path for simplicity)
  if (pathname.startsWith('/@')) {
    const parts = pathname.split('/');
    const userSegment = parts[1];
    if (!userSegment?.startsWith('@')) {
      return NextResponse.next();
    }
    const username = userSegment.substring(1);

    const internalPath = `/profile/${username}`;

    const url = request.nextUrl.clone();
    url.pathname = internalPath;
    url.search = request.nextUrl.search;

    return NextResponse.rewrite(url);
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