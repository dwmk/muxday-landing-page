import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const destinationBase = 'https://app.muxday.com';

  // 1. Root: Serves public/index.html (Next.js does this automatically if return next())
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 2. /@VAR/... -> https://app.muxday.com?user=VAR&...
  if (pathname.startsWith('/@')) {
    const parts = pathname.split('/');
    const user = parts[1].substring(1);
    const rest = parts.slice(2).join('/');
    
    const redirectUrl = new URL(rest ? `/${rest}` : '/', destinationBase);
    redirectUrl.searchParams.set('user', user);
    
    // Preserve existing query params
    request.nextUrl.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });

    return NextResponse.redirect(redirectUrl);
  }

  // 3. /app/VAR/... -> https://app.muxday.com/VAR/...
  if (pathname.startsWith('/app/')) {
    const newPath = pathname.replace('/app/', '/');
    return NextResponse.redirect(new URL(`${newPath}${search}`, destinationBase));
  }

  // 4. Default: Redirect everything else to the app domain
  // (Ignoring internal Next.js paths which are handled by the matcher)
  return NextResponse.redirect(new URL(`${pathname}${search}`, destinationBase));
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