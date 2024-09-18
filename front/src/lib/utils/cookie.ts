import Cookies from "js-cookie";
import { dev } from "$app/environment";

export function setCookieAccessToken(token: string) {
  Cookies.set("access_token", token, {
    httpOnly: false,
    expires: 1, // 1 day
    path: "/",
    sameSite: "strict",
    // secure: !dev,
  });
}

export function revokeCookieAccessToken() {
  Cookies.remove("access_token", {
    path: "/",
  });
}
