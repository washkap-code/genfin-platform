/* GENFIN preview lock — Vercel Edge Middleware (Jonomi Digital Studios)
   Before Mon 13 Jul 2026 12:00 CAT: site is fully open (review period).
   After the deadline: every page redirects to /hold.html unless the
   visitor holds the correct access cookie (set by the hold page form). */

const DEADLINE_UTC = Date.UTC(2026, 6, 13, 10, 0, 0); // 12:00 CAT (UTC+2)
const PASSWORD = 'Mukanya@1979';

export const config = {
  matcher: [
    // Everything except the hold page and the static assets it needs
    '/((?!hold\\.html|hold$|shared/|assets/|vendor/|favicon|manifest\\.webmanifest).*)',
  ],
};

export default function middleware(request) {
  if (Date.now() < DEADLINE_UTC) return; // review period — site open

  const cookies = request.headers.get('cookie') || '';
  const expected = 'gf_access=' + encodeURIComponent(PASSWORD);
  const authorized = cookies
    .split(';')
    .some((c) => c.trim() === expected);

  if (authorized) return;

  const url = new URL(request.url);
  const dest = new URL('/hold.html', url.origin);

  const headers = new Headers({ Location: dest.href });
  if (cookies.includes('gf_access=')) {
    // Wrong password attempt — show error and clear stale cookies
    dest.searchParams.set('e', '1');
    headers.set('Location', dest.href);
    headers.append('Set-Cookie', 'gf_access=; path=/; max-age=0; SameSite=Lax');
    headers.append('Set-Cookie', 'gf_unlocked=; path=/; max-age=0; SameSite=Lax');
  }
  return new Response(null, { status: 302, headers });
}
