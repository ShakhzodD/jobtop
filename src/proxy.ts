import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

export function proxy(req: NextRequest) {
  const intlMiddleware = createMiddleware(routing);
  const response = intlMiddleware(req);

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
