import { type NextRequest, NextResponse } from "next/server";
import { HOME_PATH, LOGIN_PATH, sessionCookieName } from "@/shared/config";

/*
 * Быстрая («оптимистичная») проверка входа: есть ли cookie сессии. Расшифровку и проверку сессии у netschool
 * делают сами страницы и API — сюда тяжёлую логику не кладём (см. документацию Next: Proxy).
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(sessionCookieName());
  const { pathname } = request.nextUrl;

  if (pathname === LOGIN_PATH) {
    return hasSession
      ? NextResponse.redirect(new URL(HOME_PATH, request.url))
      : NextResponse.next();
  }
  if (!hasSession) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Next читает matcher при сборке — только литерал. Список совпадает с PROTECTED_PATHS (проверяет тест).
  matcher: [
    "/login",
    "/today/:path*",
    "/diary/:path*",
    "/grades/:path*",
    "/more/:path*",
  ],
};
