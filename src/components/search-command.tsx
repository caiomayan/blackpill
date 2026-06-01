"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { SearchIcon, Users, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { searchGlobal } from "@/app/actions/search";

const shortcuts = [
  {
    label: "Search players",
    href: "/search/players",
    icon: Users,
    shortcut: "Enter",
  },
  {
    label: "Search teams",
    href: "/search/teams",
    icon: Trophy,
    shortcut: "Enter",
  },
];

export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<{ players: any[]; teams: any[] }>({
    players: [],
    teams: [],
  });
  const [isPending, startTransition] = useTransition();

  // Listen to keyboard shortcut (Ctrl+K) and custom open event
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };

    const onOpenSearch = () => {
      setOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-global-search", onOpenSearch);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-global-search", onOpenSearch);
    };
  }, []);

  // Debounce query input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results from server action
  useEffect(() => {
    if (debouncedQuery.trim() === "") {
      setResults({ players: [], teams: [] });
      return;
    }
    startTransition(() => {
      searchGlobal(debouncedQuery).then((res) => {
        setResults(res);
      });
    });
  }, [debouncedQuery]);

  // Reset states when dialog closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setQuery("");
        setDebouncedQuery("");
        setResults({ players: [], teams: [] });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      showCloseButton={false}
      className="overflow-hidden border-border/40 bg-transparent p-0 shadow-none sm:max-w-2xl"
    >
      <Command
        className="rounded-3xl border border-neutral-200/50 bg-white/95 text-neutral-800 shadow-2xl backdrop-blur-2xl"
        shouldFilter={false}
      >
        <CommandInput
          placeholder="Search players, teams..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>
            {isPending ? "Searching..." : "No results found."}
          </CommandEmpty>

          {results.players.length > 0 && (
            <CommandGroup heading="Players">
              {results.players.map((player) => (
                <CommandItem
                  key={`player-${player.steamId64}`}
                  value={`player-${player.steamId64}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/player/${player.steamId64}`);
                  }}
                >
                  <Image
                    src={player.steamAvatarUrl ?? "/blackpill.png"}
                    alt={player.username ?? "Player"}
                    width={24}
                    height={24}
                    className="rounded-full mr-2 object-cover"
                  />
                  <span>{player.username ?? player.steamPersonaName}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.teams.length > 0 && (
            <CommandGroup heading="Teams">
              {results.teams.map((team) => (
                <CommandItem
                  key={`team-${team.id}`}
                  value={`team-${team.id}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(`/teams/${team.id}`);
                  }}
                >
                  {team.avatarUrl ? (
                    <Image
                      src={team.avatarUrl}
                      alt={team.name}
                      width={24}
                      height={24}
                      className="mr-2 object-contain"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-[#fff000] text-black text-[10px] font-bold flex items-center justify-center mr-2">
                      {team.tag ?? team.name.substring(0, 4).toUpperCase()}
                    </div>
                  )}
                  <span>{team.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {query.trim() === "" && (
            <CommandGroup heading="Quick actions">
              {shortcuts.map((item) => {
                const Icon = item.icon;

                return (
                  <CommandItem
                    key={item.label}
                    value={item.label}
                    onSelect={() => {
                      setOpen(false);
                      router.push(item.href);
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                    <CommandShortcut>{item.shortcut}</CommandShortcut>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export function SearchCommand() {
  return (
    <main className="fixed inset-0 z-0 flex items-center justify-center px-4 pointer-events-none bg-neutral-50/30">
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("open-global-search"))}
        className={cn(
          "pointer-events-auto group flex items-center gap-4 w-full max-w-lg rounded-full bg-white/70 border border-white px-6 py-4 text-left backdrop-blur-2xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.08)] hover:bg-white/95 hover:-translate-y-1 duration-500",
        )}
      >
        <SearchIcon className="size-5 text-neutral-400 group-hover:text-black transition-colors duration-300" strokeWidth={2.5} />
        <span className="flex-1 text-[15px] font-bold text-neutral-400 group-hover:text-neutral-700 transition-colors duration-300 tracking-wide">
          Search players, teams...
        </span>
        <KbdGroup className="gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity duration-300">
          <Kbd className="bg-neutral-100/80 border-none shadow-sm text-neutral-500 font-extrabold rounded-lg px-2 py-1 text-[10px] uppercase tracking-widest">Ctrl</Kbd>
          <Kbd className="bg-neutral-100/80 border-none shadow-sm text-neutral-500 font-extrabold rounded-lg px-2 py-1 text-[10px] uppercase tracking-widest">K</Kbd>
        </KbdGroup>
      </button>
    </main>
  );
}

export function HeaderSearch() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-global-search"))}
      className="group flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-neutral-100/40 hover:bg-neutral-100/80 border border-neutral-200/30 text-neutral-400 hover:text-neutral-700 transition-all text-xs font-semibold shadow-sm hover:shadow"
      title="Search (Ctrl+K)"
    >
      <SearchIcon className="size-3.5 text-neutral-400 group-hover:text-neutral-900 transition-colors duration-300" strokeWidth={2.5} />
      <span className="hidden md:inline text-neutral-400 group-hover:text-neutral-600 transition-colors duration-300">Search...</span>
      <span className="hidden lg:inline-flex items-center gap-0.5 text-[9px] font-extrabold text-neutral-400 bg-white border border-neutral-200/50 rounded-md px-1 py-0.5 uppercase tracking-wider scale-90">
        Ctrl K
      </span>
    </button>
  );
}
