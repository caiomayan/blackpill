import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { IconArrowLeft } from "@tabler/icons-react";
import { getInventoryData, formatWear, InventoryItem } from "@/services/inventory";

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

export default async function InventoryPage({ params }: { params: Promise<{ steamId64: string }> }) {
  const { steamId64 } = await params;
  
  const user = await prisma.user.findUnique({
    where: { steamId64 },
    select: {
      username: true,
      steamPersonaName: true,
      steamAvatarUrl: true,
    }
  });

  if (!user) {
    notFound();
  }

  const inventoryItems = await getInventoryData(steamId64);

  // Split items into Specials (Knives & Gloves), Other (Pins, Music Kits), and Regular Weapons
  const specialItems = inventoryItems.filter(i => i.type === "Knife" || i.type === "Gloves");
  const otherItems = inventoryItems.filter(i => i.type === "Pin" || i.type === "Music Kit");
  
  // Sort weapons: meta weapons first, then alphabetical by name
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
      {/* Team Indicators */}
      <div className="absolute top-5 right-5 flex items-center gap-1.5 z-10">
        {item.teams?.includes("CT") && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" title="Equipped on CT" />}
        {item.teams?.includes("T") && <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" title="Equipped on TR" />}
      </div>

      <div className="w-full h-28 mb-6 flex flex-col items-center justify-center relative">
        {item.imageUrl ? (
          <Image 
            src={item.imageUrl} 
            alt={item.name} 
            fill 
            className="object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500 ease-out" 
          />
        ) : (
          <div className="w-full h-24 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-300">
            <span className="text-xs font-medium uppercase tracking-wider">{item.type}</span>
          </div>
        )}
      </div>

      {/* Stickers */}
      {item.mappedStickers && item.mappedStickers.length > 0 && (
        <div className="flex items-center justify-center gap-1 mb-4 h-8">
          {item.mappedStickers.map((sticker, sIdx) => (
            <div key={sIdx} className="relative w-8 h-8 opacity-90 hover:opacity-100 hover:scale-110 transition-all" title={sticker.name}>
              <Image src={sticker.imageUrl} alt={sticker.name} fill className="object-contain drop-shadow-sm" />
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-auto">
        <p className="text-[10px] text-neutral-400 font-bold tracking-widest uppercase mb-1.5">
          {item.nametag ? `"${item.nametag}"` : item.type}
        </p>
        <p className="font-semibold text-[15px] leading-tight text-neutral-800">
          {item.isStatTrak && <span className="text-[#cf6a32] mr-1">StatTrak™</span>}
          {item.name}
        </p>
        {item.wear !== undefined && <p className="text-[11px] font-medium text-neutral-400 mt-2">{formatWear(item.wear)}</p>}
      </div>
    </div>
  );

  return (
    <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-12 relative flex flex-col animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-12 border-b border-neutral-100 pb-6">
        <div className="flex items-center gap-4">
          <Link href={`/player/${steamId64}`} className="w-10 h-10 bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-black rounded-full flex items-center justify-center transition-colors">
            <IconArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-black tracking-tight">Equipped Inventory</h1>
            <p className="text-sm font-medium text-neutral-400 mt-1">
              Showing <span className="text-black">{inventoryItems.length}</span> items for {user.username ?? user.steamPersonaName ?? "Unknown"}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-400">{user.username ?? user.steamPersonaName}</span>
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <Image 
              src={user.steamAvatarUrl ?? "/blackpill.png"} 
              alt="Avatar"
              fill 
              className="object-cover" 
            />
          </div>
        </div>
      </div>

      {inventoryItems.length > 0 ? (
        <div className="flex flex-col gap-16">
          
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

    </main>
  );
}
