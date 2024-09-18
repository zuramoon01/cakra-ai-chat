import { redirect, type Handle } from "@sveltejs/kit";

const isAuthRoute = (pathname: string) => {
  const authRoute = ["/auth/signin", "/auth/signup"];

  return authRoute.some((route) => route === pathname);
};

const isProtectedRoute = (pathname: string) => {
  const protectedRoute = ["/"];

  return protectedRoute.some((route) => route === pathname);
};

export const handle: Handle = async ({ event, resolve }) => {
  const accessToken = event.cookies.get("access_token");

  if (accessToken && isAuthRoute(event.url.pathname)) {
    redirect(307, "/");
  }

  if (!accessToken && isProtectedRoute(event.url.pathname)) {
    redirect(307, "/auth/signin");
  }

  const response = await resolve(event);

  return response;
};
