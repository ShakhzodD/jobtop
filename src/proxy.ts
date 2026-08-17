import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

export function proxy(req: NextRequest) {
  const hasLocaleCookie = req.cookies.has("NEXT_LOCALE");
  if (!hasLocaleCookie) {
    req.cookies.set("NEXT_LOCALE", routing.defaultLocale);
  }

  const intlMiddleware = createMiddleware(routing);
  const response = intlMiddleware(req);
  if (!hasLocaleCookie) {
    response.cookies.set("NEXT_LOCALE", routing.defaultLocale);
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
