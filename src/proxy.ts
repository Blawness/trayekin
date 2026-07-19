import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export default auth((req) => {
  const isAuth = !!req.auth;
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isPublicPage = PUBLIC_ROUTES.includes(pathname) || isAuthPage;

  if (!isAuth && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
