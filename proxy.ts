import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Locale negotiation and redirects (e.g. `/` → `/en`).
 *
 * Next.js 16 renamed the `middleware` file convention to `proxy`. next-intl still
 * ships its handler as `next-intl/middleware`, but it's just a
 * `(request) => response` function, which is exactly what `proxy` expects.
 */
export default createMiddleware(routing);

export const config = {
  // Skip Next internals, Vercel internals, and anything with a file extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
