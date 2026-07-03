import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { PATHS } from '@/lib/constants/paths';
import { ENV_NEXTAUTH_SECRET } from '@/lib/constants/environments';

function hasActiveSession(token: Awaited<ReturnType<typeof getToken>> | null) {
  if (!token || typeof token === 'string') return false;
  if (token.error === 'RefreshAccessTokenError') return false;
  if (typeof token.accessToken !== 'string' || !token.accessToken) return false;
  return true;
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: ENV_NEXTAUTH_SECRET });
  const isAuth = hasActiveSession(token);

  // ── API proxy: fetch backend directly with Bearer token ───────────
  if (req.nextUrl.pathname.startsWith('/api/admin/')) {
    if (!isAuth || !token?.accessToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const backendUrl = process.env.NEXT_PUBLIC_URL_API;
    if (!backendUrl) {
      return NextResponse.json(
        { error: 'NEXT_PUBLIC_URL_API no está configurado en el servidor' },
        { status: 500 }
      );
    }
    const targetPath = req.nextUrl.pathname.replace(/^\/api/, '');
    const url = `${backendUrl}${targetPath}${req.nextUrl.search}`;
    try {
      const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
      const body = hasBody ? await req.text() : undefined;
      const contentType = req.headers.get('content-type') ?? (hasBody ? 'application/json' : '');
      const backendRes = await fetch(url, {
        method: req.method,
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          ...(contentType && { 'Content-Type': contentType }),
        },
        body,
      });
      const resBody = await backendRes.text();
      return new NextResponse(resBody, {
        status: backendRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      return NextResponse.json({ error: 'Error de conexion con el backend' }, { status: 502 });
    }
  }

  // ── Auth pages (login, recover, etc.) ──────────────────────────────
  const isAuthPage =
    req.nextUrl.pathname.startsWith(PATHS.signInPage);

  if (isAuthPage) {
    if (isAuth && !req.nextUrl.searchParams.has('error')) {
      return NextResponse.redirect(new URL(PATHS.dashboardPage, req.url));
    }
    return NextResponse.next();
  }

  // ── Protected pages ───────────────────────────────────────────────
  if (!isAuth) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) from += req.nextUrl.search;
    return NextResponse.redirect(
      new URL(`${PATHS.signInPage}?callbackUrl=${encodeURIComponent(from)}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/agencias/:path*',
    '/flota/:path*',
    '/rutas/:path*',
    '/viajes/:path*',
    '/reclamos/:path*',
    '/suscripciones/:path*',
    '/soporte/:path*',
    '/dashboard/:path*',
    '/terminales/:path*',
    '/boletos/:path*',
    '/pasajeros/:path*',
    '/manifiesto-sutran/:path*',
    '/comisiones/:path*',
    '/configuracion/:path*',
    '/reportes-y-analitica/:path*',
    '/iniciar-sesion',
    '/recuperar-correo',
    '/revisar-correo',
    '/restablecer-contrasena/:path*',
  ],
};
