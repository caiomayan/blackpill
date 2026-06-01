"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { IconBrandSteam, IconUsers, IconShield } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { sanitizeReturnTo } from "@/lib/return-to";
import { HeaderSearch } from "@/components/search-command";

type HeaderUser = {
  steamId64: string;
  username: string | null;
  steamPersonaName: string | null;
  steamAvatarUrl: string | null;
  systemRole: string;
};

type HeaderProps = {
  currentUser: HeaderUser | null;
};

export function Header({ currentUser }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName =
    currentUser?.username ?? currentUser?.steamPersonaName ?? "Account";

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const currentRoute = `${pathname}${
    searchParams.toString() ? `?${searchParams.toString()}` : ""
  }`;
  const returnTo = sanitizeReturnTo(
    pathname === "/login" ? searchParams.get("returnTo") : currentRoute,
  );
  const steamLoginHref = `/api/auth/steam/start?returnTo=${encodeURIComponent(
    returnTo,
  )}`;
  const logoutReturnTo = returnTo;

  return (
    <header className="relative flex items-center justify-between h-20 px-6 max-w-[1200px] mx-auto w-full">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center hover:scale-105 transition-transform z-10">
        <Image src="/blackpill.png" alt="Logo" width={44} height={44} className="drop-shadow-sm" priority />
      </Link>

      {/* Center: Navigation */}
      <nav className="absolute inset-0 flex items-center justify-center pointer-events-none hidden md:flex">
        <ul className="flex items-center gap-10 pointer-events-auto">
          <li>
            <Link
              href="/ranking"
              className={`text-[11px] font-extrabold tracking-[0.2em] uppercase transition-all hover:text-black ${pathname === "/ranking" ? "text-black" : "text-neutral-400"}`}
            >
              Ranking
            </Link>
          </li>
          <li>
            <Link
              href="/search/players"
              className={`text-[11px] font-extrabold tracking-[0.2em] uppercase transition-all hover:text-black ${pathname.startsWith("/search/players") || pathname.startsWith("/player") ? "text-black" : "text-neutral-400"}`}
            >
              Players
            </Link>
          </li>
          <li>
            <Link
              href="/search/teams"
              className={`text-[11px] font-extrabold tracking-[0.2em] uppercase transition-all hover:text-black ${pathname.startsWith("/search/teams") || pathname.startsWith("/teams") ? "text-black" : "text-neutral-400"}`}
            >
              Teams
            </Link>
          </li>
          <li>
            <Link
              href="/about"
              className={`text-[11px] font-extrabold tracking-[0.2em] uppercase transition-all hover:text-black ${pathname === "/about" ? "text-black" : "text-neutral-400"}`}
            >
              About
            </Link>
          </li>
        </ul>
      </nav>

      {/* Right: User Menu */}
      <div className="z-10 flex items-center gap-4 relative">
        <HeaderSearch />
        {currentUser ? (
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex items-center justify-center rounded-full border-[3px] border-transparent hover:border-neutral-100 transition-all focus:outline-none focus:border-neutral-100 shadow-sm hover:shadow-md"
            >
              <Image
                src={currentUser.steamAvatarUrl ?? "/blackpill.png"}
                alt={displayName}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            </button>

            {isMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-3xl border border-neutral-100/80 bg-white/95 backdrop-blur-xl p-2.5 shadow-[0_12px_40px_rgb(0,0,0,0.08)] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-3 p-3 mb-2 bg-neutral-50/80 rounded-2xl border border-neutral-100/50">
                  <Image
                    src={currentUser.steamAvatarUrl ?? "/blackpill.png"}
                    alt={displayName}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-neutral-900 tracking-tight">
                      {displayName}
                    </p>
                    <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Steam User</p>
                  </div>
                </div>

                <div className="grid gap-1 px-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-xl font-semibold text-neutral-600 hover:text-black hover:bg-neutral-100/50 transition-colors"
                    asChild
                  >
                    <Link href={`/player/${currentUser.steamId64}`} onClick={() => setIsMenuOpen(false)}>
                      My Profile
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-xl font-semibold text-neutral-600 hover:text-black hover:bg-neutral-100/50 transition-colors"
                    asChild
                  >
                    <Link href="/settings/profile" onClick={() => setIsMenuOpen(false)}>
                      Edit Profile
                    </Link>
                  </Button>

                  <div className="py-2">
                    <Link 
                      href="/teams" 
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:text-black hover:bg-neutral-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconUsers size={18} />
                      My Teams
                    </Link>

                    {currentUser.systemRole === "ADMIN" && (
                      <Link 
                        href="/admin" 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <IconShield size={18} />
                        Admin Console
                      </Link>
                    )}
                  </div>
                  
                  <div className="h-px w-full bg-neutral-100 my-1"></div>

                  <form
                    action={`/api/auth/logout?returnTo=${encodeURIComponent(logoutReturnTo)}`}
                    method="post"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start rounded-xl font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      type="submit"
                    >
                      Logout
                    </Button>
                  </form>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <Button
            className="rounded-full px-6 font-bold tracking-wide shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 bg-black text-white hover:bg-neutral-800"
            size="default"
            asChild
          >
            <a href={steamLoginHref} className="flex items-center gap-2">
              <IconBrandSteam size={18} stroke={2.5} />
              Login
            </a>
          </Button>
        )}
      </div>
    </header>
  );
}
