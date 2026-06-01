import { NextResponse, type NextRequest } from "next/server";

import {
  clearSessionCookie,
  revokeSessionByToken,
  SESSION_COOKIE_NAME,
} from "@/lib/session";
import { sanitizeReturnTo } from "@/lib/return-to";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const returnTo = sanitizeReturnTo(
    new URL(request.url).searchParams.get("returnTo"),
  );

  if (token) {
    await revokeSessionByToken(token);
  }

  const response = NextResponse.redirect(new URL(returnTo, request.url));
  return clearSessionCookie(response);
}
