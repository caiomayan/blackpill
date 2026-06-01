import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { IconBrandSteam, IconBrandX, IconBrandInstagram, IconBrandYoutube, IconLink, IconShieldCheck, IconShieldX } from "@tabler/icons-react";
import { getInventoryData, formatWear, InventoryItem } from "@/services/inventory";

import { syncUserFaceit } from "@/lib/faceit";

// Definition indexes for meta weapons
const META_WEAPONS = [
  7,  // AK-47
  16, // M4A4
  60, // M4A1-S
  9,  // AWP
  1,  // Desert Eagle
  4,  // Glock-18
  61, // USP-S
];

export default async function PlayerPage(
  props: {
    params: Promise<{ steamId64: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
  }
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const steamId64 = params.steamId64;
  const tab = typeof searchParams.tab === "string" ? searchParams.tab : "overview";
  
  const user = await prisma.user.findUnique({
    where: { steamId64 },
    include: {
      teams: {
        include: {
          team: true
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  const primaryTeam = user.teams.length > 0 ? user.teams[0].team : null;
  const faceitData = await syncUserFaceit(steamId64, user.id);
  const inventoryItems = await getInventoryData(steamId64);

  const roleIconMap: Record<string, string> = {
    RIFLER: "/role/icon-rifler.svg",
    AWPER: "/role/icon-awper.svg",
    ENTRY: "/role/icon-entry_fragger.svg",
    SUPPORT: "/role/icon-rifler.svg",
    LURKER: "/role/icon-rifler.svg",
    IGL: "/role/icon-igl.svg",
    COACH: "/role/icon-coach.svg",
  };

  const currentRoleIcons = user.inGameRoles.map((role) => {
    const path = roleIconMap[role];
    if (!path) return null;
    return <Image key={role} src={path} alt={role} width={22} height={22} className="opacity-70" />;
  }).filter(Boolean);

  // Inventory logic for the detailed view
  const specialItems = inventoryItems.filter(i => i.type === "Knife" || i.type === "Gloves");
  const otherItems = inventoryItems.filter(i => i.type === "Pin" || i.type === "Music Kit");
  const weaponItems = inventoryItems
    .filter(i => i.type !== "Knife" && i.type !== "Gloves" && i.type !== "Pin" && i.type !== "Music Kit")
    .sort((a, b) => {
      const aIsMeta = a.def ? META_WEAPONS.includes(a.def) : false;
      const bIsMeta = b.def ? META_WEAPONS.includes(b.def) : false;
      if (aIsMeta && !bIsMeta) return -1;
      if (!aIsMeta && bIsMeta) return 1;
      return a.name.localeCompare(b.name);
    });

  const ItemCard = ({ item }: { item: InventoryItem }) => (
    <div className="relative bg-white p-6 rounded-2xl border border-neutral-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-neutral-200 transition-all group flex flex-col justify-between h-full min-h-[240px]">
      <div className="absolute top-5 right-5 flex items-center gap-1.5 z-10">
        {item.teams?.includes("CT") && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" title="Equipped on CT" />}
        {item.teams?.includes("T") && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" title="Equipped on TR" />}
      </div>
      <div className="w-full h-28 mb-6 flex flex-col items-center justify-center relative">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill className="object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500 ease-out" sizes="(max-width: 768px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-24 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-300">
            <span className="text-xs font-medium uppercase tracking-wider">{item.type}</span>
          </div>
        )}
      </div>
      {item.mappedStickers && item.mappedStickers.length > 0 && (
        <div className="flex items-center justify-center gap-1 mb-4 h-8">
          {item.mappedStickers.map((sticker, sIdx) => (
            <div key={sIdx} className="relative w-8 h-8 opacity-90 hover:opacity-100 hover:scale-110 transition-all" title={sticker.name}>
              <Image src={sticker.imageUrl} alt={sticker.name} fill className="object-contain drop-shadow-sm" sizes="32px" />
            </div>
          ))}
        </div>
      )}
      <div className="text-center mt-auto">
        <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase mb-1.5">{item.nametag ? `"${item.nametag}"` : item.type}</p>
        <p className="font-semibold text-[15px] leading-tight text-neutral-800">
          {item.isStatTrak && <span className="text-[#cf6a32] mr-1">StatTrak™</span>}
          {item.name}
        </p>
        {item.wear !== undefined && <p className="text-[11px] font-medium text-neutral-400 mt-2">{formatWear(item.wear)}</p>}
      </div>
    </div>
  );

  return (
    <main className={`flex-1 w-full max-w-[1200px] mx-auto px-6 relative flex flex-col items-center pt-6 md:pt-8 ${tab === "overview" ? "h-[calc(100vh-130px)]" : "min-h-[calc(100vh-130px)] pb-16"}`}>
      
      {/* Player Header */}
      <div className="flex flex-col items-center w-full max-w-2xl z-10 animate-fade-in relative mb-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden mb-3 border-4 border-white shadow-[0_4px_20px_rgb(0,0,0,0.08)]">
          <Image 
            src={user.steamAvatarUrl ?? "/blackpill.png"} 
            alt={user.username ?? "Avatar"} 
            fill 
            className="object-cover"
            sizes="96px"
            priority
          />
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-neutral-900 to-neutral-500 tracking-tighter leading-none text-center">
            {user.username ?? user.steamPersonaName ?? "Unknown"}
          </h1>
          {user.hasAuthenticated ? (
            <div title="Autenticado (Verificado)" className="bg-green-50 text-green-500 p-1 rounded-full shadow-sm">
              <IconShieldCheck size={20} stroke={2.5} />
            </div>
          ) : (
            <div title="Não Autenticado (Adicionado Manualmente)" className="bg-red-50 text-red-500 p-1 rounded-full shadow-sm">
              <IconShieldX size={20} stroke={2.5} />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-3 bg-white px-3 py-1 rounded-full shadow-sm border border-neutral-100">
          {primaryTeam ? (
            <Link href={`/teams/${primaryTeam.id}`} className="flex items-center gap-1.5 group">
              {primaryTeam.avatarUrl ? (
                 <Image src={primaryTeam.avatarUrl} alt={primaryTeam.name} width={16} height={16} className="object-contain group-hover:scale-110 transition-transform" />
              ) : (
                <div className="text-[8px] font-bold bg-[#fff000] text-black px-1.5 py-0.5 rounded tracking-wider">
                  {primaryTeam.tag ?? primaryTeam.name.substring(0, 4).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-semibold text-neutral-600 group-hover:text-black transition-colors">{primaryTeam.name}</span>
            </Link>
          ) : (
            <span className="text-xs font-semibold text-neutral-400">Free Agent</span>
          )}
          {currentRoleIcons.length > 0 && (
             <>
               <div className="w-px h-3 bg-neutral-200 mx-1"></div>
               <div className="flex items-center gap-1" title={user.inGameRoles.join(", ")}>
                 {currentRoleIcons}
               </div>
             </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-4 max-w-lg">
          {faceitData && (
            <Link href={`https://www.faceit.com/en/players/${faceitData.nickname}`} target="_blank" className="flex items-center gap-1.5 bg-[#ff5500] text-white px-3 py-1.5 rounded-full font-semibold text-[11px] hover:bg-[#ff3300] hover:-translate-y-0.5 transition-all shadow-sm">
              <Image src="/platforms/faceit.svg" alt="Faceit" width={12} height={12} className="brightness-0 invert flex-shrink-0" />
              <span>Faceit</span>
            </Link>
          )}
          <Link href={`https://steamcommunity.com/profiles/${user.steamId64}`} target="_blank" className="flex items-center gap-1.5 bg-[#171a21] text-white px-3 py-1.5 rounded-full font-semibold text-[11px] hover:bg-[#000000] hover:-translate-y-0.5 transition-all shadow-sm">
             <IconBrandSteam size={14} stroke={2} />
             <span>Steam</span>
          </Link>
          
          {user.xUrl && (
            <Link href={user.xUrl} target="_blank" className="flex items-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-full font-semibold text-[11px] hover:bg-neutral-800 hover:-translate-y-0.5 transition-all shadow-sm">
               <IconBrandX size={14} stroke={2.5} />
               <span>X</span>
            </Link>
          )}
          {user.instagramUrl && (
            <Link href={user.instagramUrl} target="_blank" className="flex items-center gap-1.5 bg-gradient-to-r from-[#fd5949] to-[#d6249f] text-white px-3 py-1.5 rounded-full font-semibold text-[11px] hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-sm">
               <IconBrandInstagram size={14} stroke={2.5} />
               <span>Instagram</span>
            </Link>
          )}
          {user.youtubeUrl && (
            <Link href={user.youtubeUrl} target="_blank" className="flex items-center gap-1.5 bg-[#FF0000] text-white px-3 py-1.5 rounded-full font-semibold text-[11px] hover:bg-[#cc0000] hover:-translate-y-0.5 transition-all shadow-sm">
               <IconBrandYoutube size={14} stroke={2.5} />
               <span>YouTube</span>
            </Link>
          )}
          {user.hltvUrl && (
            <Link href={user.hltvUrl} target="_blank" className="flex items-center gap-1.5 bg-[#2d6a8c] text-white px-3 py-1.5 rounded-full font-semibold text-[11px] hover:bg-[#204f69] hover:-translate-y-0.5 transition-all shadow-sm">
               <IconLink size={14} stroke={2.5} />
               <span>HLTV</span>
            </Link>
          )}
        </div>

        {/* Player Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-md p-1 rounded-2xl shadow-sm border border-neutral-100/50">
          <Link href={`/player/${steamId64}?tab=overview`} className={`px-5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all ${tab === "overview" ? "text-black bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)]" : "text-neutral-500 hover:text-black hover:bg-white/80"}`}>
            Overview
          </Link>
          <Link href={`/player/${steamId64}?tab=stats`} className={`px-5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all ${tab === "stats" ? "text-black bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)]" : "text-neutral-500 hover:text-black hover:bg-white/80"}`}>
            Stats
          </Link>
          <Link href={`/player/${steamId64}?tab=inventory`} className={`px-5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all ${tab === "inventory" ? "text-black bg-white shadow-[0_2px_10px_rgb(0,0,0,0.04)]" : "text-neutral-500 hover:text-black hover:bg-white/80"}`}>
            Inventory
          </Link>
        </div>
      </div>

      {tab === "overview" && (
        <div className="w-full max-w-[850px] bg-white/80 backdrop-blur-md rounded-3xl flex flex-col md:flex-row shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white/50 z-10 relative">
           {/* Faceit Card */}
           <div className="flex-1 p-5 flex flex-col items-center justify-center min-h-[150px] border-b md:border-b-0 md:border-r border-neutral-100/60 bg-gradient-to-b from-neutral-50/50 to-white/50 relative overflow-hidden rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none">
             <div className="absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none flex items-center justify-center">
               <Image src="/platforms/faceit.svg" alt="Faceit Watermark" width={120} height={120} className="grayscale flex-shrink-0" />
             </div>
             
             <Image src="/platforms/faceit.svg" alt="Faceit" width={24} height={24} className="mb-3 opacity-90 drop-shadow-sm flex-shrink-0" />
             {faceitData?.cs2 ? (
               <div className="flex items-center gap-3 z-10">
                 <Image 
                   src={`/faceit-level/level${faceitData.cs2.skill_level}.png`} 
                   alt={`Level ${faceitData.cs2.skill_level}`} 
                   width={32} 
                   height={32} 
                   className="drop-shadow-md hover:scale-110 transition-transform"
                 />
                 <span className="text-xl font-extrabold tracking-tight text-neutral-800">{faceitData.cs2.faceit_elo} <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-0.5">elo</span></span>
               </div>
             ) : (
               <span className="text-xs font-medium text-neutral-400">No Faceit Data</span>
             )}
           </div>

           {/* Inventory Preview */}
           {inventoryItems.slice(0, 2).map((item, idx) => (
             <Link href={`/player/${steamId64}?tab=inventory`} key={idx} className={`relative flex-1 p-5 flex flex-col items-center text-center justify-between min-h-[150px] group transition-colors hover:bg-neutral-50/80 cursor-pointer ${idx === 0 ? 'border-b md:border-b-0 md:border-r border-neutral-100/60' : ''} ${idx === 1 ? 'rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none' : ''}`}>
               <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                 {item.teams?.includes("CT") && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm" title="Equipped on CT" />}
                 {item.teams?.includes("T") && <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" title="Equipped on TR" />}
               </div>
               
               <div className="w-full h-16 mb-3 flex items-center justify-center relative">
                 {item.imageUrl ? (
                   <Image src={item.imageUrl} alt={item.name} fill className="object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 50vw, 25vw" />
                 ) : (
                   <div className="w-full h-16 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400">
                     <span className="text-[10px] font-medium uppercase tracking-wider">{item.type}</span>
                   </div>
                 )}
               </div>
               <div className="text-center">
                 <p className="text-[9px] text-neutral-400 font-bold tracking-widest uppercase mb-1">{item.nametag ? `"${item.nametag}"` : item.type}</p>
                 <p className="font-semibold text-sm leading-tight text-neutral-800">
                   {item.isStatTrak && <span className="text-[#cf6a32] mr-1">StatTrak™</span>}
                   {item.name}
                 </p>
                 {item.wear !== undefined && <p className="text-[10px] font-medium text-neutral-400 mt-1.5">{formatWear(item.wear)}</p>}
               </div>
             </Link>
           ))}

           {inventoryItems.length === 0 && (
             <>
               <div className="flex-1 p-5 flex flex-col items-center text-center justify-center min-h-[150px] border-b md:border-b-0 md:border-r border-neutral-100/60">
                 <span className="text-[10px] font-medium text-neutral-300 tracking-wide uppercase">No Equipped Items</span>
               </div>
               <div className="flex-1 p-5 flex flex-col items-center text-center justify-center min-h-[150px] rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none">
                 <span className="text-[10px] font-medium text-neutral-300 tracking-wide uppercase">No Equipped Items</span>
               </div>
             </>
           )}
           
           {inventoryItems.length === 1 && (
             <div className="flex-1 p-5 flex flex-col items-center text-center justify-center min-h-[150px] rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none">
               <span className="text-[10px] font-medium text-neutral-300 tracking-wide uppercase">Empty Slot</span>
             </div>
           )}

        </div>
      )}

      {tab === "inventory" && (
        <div className="w-full animate-fade-in">
          {inventoryItems.length > 0 ? (
            <div className="flex flex-col gap-12 w-full max-w-[1200px]">
              
              {/* Knives & Gloves */}
              {specialItems.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-neutral-800 mb-6">Knives & Gloves</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {specialItems.map((item, idx) => (
                      <ItemCard key={idx} item={item} />
                    ))}
                  </div>
                </section>
              )}
              
              {/* Collectibles & Music Kits */}
              {otherItems.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-neutral-800 mb-6">Collectibles & Music Kits</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {otherItems.map((item, idx) => (
                      <ItemCard key={idx} item={item} />
                    ))}
                  </div>
                </section>
              )}

              {/* Weapons */}
              {weaponItems.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-neutral-800 mb-6">Weapons</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {weaponItems.map((item, idx) => (
                      <ItemCard key={idx} item={item} />
                    ))}
                  </div>
                </section>
              )}

            </div>
          ) : (
            <div className="w-full py-20 flex flex-col items-center justify-center bg-neutral-50/50 rounded-3xl border border-dashed border-neutral-200">
              <p className="text-lg font-medium text-neutral-400 tracking-wide uppercase mb-2">No Equipped Items Found</p>
              <p className="text-sm text-neutral-400 max-w-sm text-center">This player does not have any items equipped on the CS2 Inventory Simulator.</p>
            </div>
          )}
        </div>
      )}

      {tab === "stats" && (
        <div className="w-full py-32 flex flex-col items-center justify-center animate-fade-in">
          <p className="text-xl font-bold text-neutral-300 tracking-wider uppercase">Stats Coming Soon</p>
        </div>
      )}

    </main>
  );
}
