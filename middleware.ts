import { auth } from "~/server/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isSignInPage = nextUrl.pathname === "/signin";
  const isRegisterPage = nextUrl.pathname === "/register";
  const isAuthPage = isSignInPage || isRegisterPage;
  
  // If not authenticated and not on auth pages, redirect to sign-in
  if (!req.auth && !isAuthPage) {
    return Response.redirect(new URL("/signin", nextUrl));
  }
  
  // If authenticated and on auth pages, redirect to home
  if (req.auth && isAuthPage) {
    return Response.redirect(new URL("/", nextUrl));
  }
});

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    // Skip all API routes except protected ones
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
