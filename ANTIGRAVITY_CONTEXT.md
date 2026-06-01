# BlackPill Handoff Context

This document is the current handoff for future agents. It summarizes the project, the architecture, the auth/session flow, and the implementation state so work can continue without re-discovery.

## Project Summary

BlackPill is a Next.js App Router project for a Counter-Strike 2 social platform. The app is intentionally minimal and neutral in visual style, inspired by Vercel-like layouts. The product goal is to let users manage profiles, teams, and roles such as RIFLER, AWPER, OPENER, and IGL.

The project now includes Steam authentication via OpenID, a custom persisted session layer, and an onboarding flow that forces users to complete username, email, and role on first access.

## Important Rules

- Keep the UI minimal and clean.
- Login is optional on public pages.
- Steam login should be triggered only when the user clicks the login CTA in the header.
- After login, the user must return to the same page they were on.
- Logout should also return to the same page as a guest.
- Public pages should not force login.
- Onboarding is only required for first-time Steam users.
- The project is on Next.js 16 App Router, so some APIs are async and differ from older Next.js behavior.
- Before changing code, read `AGENTS.md` because it contains a critical warning about this being "not the Next.js you know".

## Current Tech Stack

- Next.js 16.2.6
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- Prisma 7.8.0
- PostgreSQL
- Steam OpenID via `openid`
- Zod for validation
- `pg` plus `@prisma/adapter-pg` for Prisma 7 direct database access

## Repository Structure

Key folders and files:

- `src/app/layout.tsx` - root layout, reads current session user and passes it to the header
- `src/components/layout/Header.tsx` - navigation bar, login CTA, avatar dropdown for logged-in users, logout form
- `src/components/layout/Footer.tsx` - footer
- `src/app/page.tsx` - home page search command
- `src/app/about/page.tsx` - about page
- `src/app/servers/page.tsx` - public placeholder page
- `src/app/ranking/page.tsx` - public placeholder page
- `src/app/teams/page.tsx` - public placeholder page
- `src/app/onboarding/page.tsx` - onboarding page
- `src/app/login/page.tsx` - technical redirect route, not a real page UI
- `src/app/api/auth/steam/start/route.ts` - Steam OpenID start endpoint
- `src/app/api/auth/steam/callback/route.ts` - Steam OpenID callback endpoint
- `src/app/api/auth/logout/route.ts` - logout endpoint
- `src/app/api/onboarding/route.ts` - onboarding submit endpoint
- `src/lib/prisma.ts` - Prisma client with pg adapter
- `src/lib/session.ts` - session helpers and cookie handling
- `src/lib/steam.ts` - OpenID auth and Steam profile fetching
- `src/lib/return-to.ts` - safe return URL handling
- `src/lib/validation.ts` - onboarding schema and role values
- `prisma/schema.prisma` - Prisma schema
- `prisma.config.ts` - Prisma 7 config
- `system-design/` - product/system docs and SQL model reference

## User Experience Flow

### Login

1. User clicks the login CTA in the header.
2. The header sends the browser directly to `/api/auth/steam/start?returnTo=...`.
3. The start route creates a Steam OpenID relying party URL and redirects the browser to Steam.
4. Steam returns to `/api/auth/steam/callback?returnTo=...`.
5. The callback validates the OpenID response.
6. The app fetches Steam profile data when `STEAM_API_KEY` is present.
7. The app upserts the user in PostgreSQL.
8. The app creates a custom session row and writes the `bp_session` cookie.
9. If onboarding is complete, the user returns to the original page.
10. If onboarding is incomplete, the user goes to `/onboarding?returnTo=...`.

### Onboarding

- The onboarding page requires:
  - username
  - email
  - role
- Role options:
  - RIFLER
  - AWPER
  - OPENER
  - IGL
- The backend validates the same data again with Zod.
- When onboarding succeeds, the user is marked `onboardingCompleted = true` and returns to the original page.

### Logout

1. User clicks the avatar in the header.
2. A small dropdown appears with:
   - avatar
   - display name
   - disabled Edit profile button
   - Logout button
3. Logout revokes the session in PostgreSQL.
4. Logout clears the cookie.
5. Logout redirects back to the current page as a guest.

## Session Model

The user is persisted in the UI through a cookie + server lookup flow.

- Cookie name: `bp_session`
- Cookie is HTTP-only
- Cookie maps to a hashed token in the `Session` table
- The root layout reads the current user from cookies on the server
- The header receives the current user and changes its display accordingly

This is why the user stays logged in across reloads.

## Auth and Redirect Details

The app uses a safe `returnTo` helper so navigation stays internal only.

- `src/lib/return-to.ts` sanitizes the return path.
- Public pages keep the same route after login/logout.
- Protected flows still use the onboarding redirect when needed.

## Database Schema

The Prisma schema currently includes:

- `User`
  - `steamId64` unique identifier
  - `steamPersonaName`
  - `steamAvatarUrl`
  - `username`
  - `email`
  - `role`
  - `onboardingCompleted`
- `Session`
  - `tokenHash`
  - `userId`
  - `expiresAt`
  - `lastSeenAt`
- `Team`
- `UserTeam`
  - unique `(userId, teamId)`

Current Prisma schema is in `prisma/schema.prisma`.

## Important Config

### Environment Variables

Current `.env` values used by the app:

- `DATABASE_URL`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `STEAM_API_KEY`

The `DATABASE_URL` is used by Prisma + `pg` + the adapter.

### Next.js Image Hosts

`next.config.ts` allows Steam avatar image hosts:

- `avatars.steamstatic.com`
- `steamcdn-a.akamaihd.net`
- `shared.akamai.steamstatic.com`

This is required so the header can display the Steam avatar.

## Current Header Behavior

- Login button stays visually the same.
- Logged-in user sees an avatar button.
- Clicking the avatar opens a simple dropdown.
- Dropdown includes:
  - avatar
  - user name
  - disabled Edit profile button
  - Logout button

The header uses the current route to build `returnTo`.

## Build Status

The app currently builds successfully.

The last validated command was:

```bash
npm run build
```

## Known Considerations

- `src/app/login/page.tsx` is mostly a technical redirect route now. It exists as fallback, but the real login entry point is the header CTA.
- The login flow should remain simple:
  - click login
  - Steam auth
  - return to same page
  - logout
  - return to same page as guest
- If more auth complexity is added later, keep the UX simple and avoid reintroducing intermediate login screens unless required.
- The project is on a newer Next.js version, so always check `AGENTS.md` and the local docs if something looks inconsistent with older Next.js behavior.

## What Future Work Likely Needs

- Implement the Edit profile action later.
- Replace placeholder pages with real content for ranking, teams, and servers.
- Add user profile page / settings page.
- Expand team and ranking models once product requirements are ready.
- Consider adding a dedicated UI component for the avatar dropdown if the menu grows.

## Suggested Reading Order For A New Agent

1. `AGENTS.md`
2. This file
3. `src/app/layout.tsx`
4. `src/components/layout/Header.tsx`
5. `src/lib/session.ts`
6. `src/lib/steam.ts`
7. `src/lib/return-to.ts`
8. `src/app/api/auth/steam/start/route.ts`
9. `src/app/api/auth/steam/callback/route.ts`
10. `src/app/onboarding/page.tsx`
11. `src/components/onboarding-form.tsx`

## Short Handoff Summary

The project is functional and builds. Steam login works, onboarding works, session persistence works, logout works, and public pages no longer force login. The UI now shows a Steam avatar dropdown for logged-in users. Future work should preserve the current simple flow and avoid adding extra auth screens unless the product requires them.
