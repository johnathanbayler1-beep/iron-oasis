import { NextRequest, NextResponse } from "next/server";
import sites from "./sites.config.json";

// Map hostname → site slug. "north-scottsdale.ironoasis.com" (or any host
// containing the slug) resolves to its route. Unknown hosts fall through
// to the root app untouched.
function slugForHost(hostname: string): string | null {
  const host = hostname.split(":")[0].toLowerCase();
  const site = sites.find(
    (s) => host === s.slug || host.startsWith(`${s.slug}.`)
  );
  return site?.slug ?? null;
}

export function middleware(request: NextRequest) {
  const slug = slugForHost(request.headers.get("host") ?? "");
  if (!slug) return NextResponse.next();

  const url = request.nextUrl.clone();
  // Route group `(slug)` is not part of the URL — internal path is /slug.
  url.pathname = `/${slug}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API routes, Next internals, and static assets (images, fonts, 3D models).
  matcher: [
    "/((?!api|_next|_static|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?|ttf|otf|glb|gltf|hdr|bin|mp4|webm)).*)",
  ],
};
