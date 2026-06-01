export function formatWear(wear: number | undefined) {
  if (wear === undefined) return "";
  if (wear < 0.07) return "(Factory New)";
  if (wear < 0.15) return "(Minimal Wear)";
  if (wear < 0.38) return "(Field-Tested)";
  if (wear < 0.45) return "(Well-Worn)";
  return "(Battle-Scarred)";
}

let memoryCache: {
  skins: any;
  collectibles: any;
  musicKits: any;
  stickers: any;
  lastFetch: number;
} = {
  skins: null, collectibles: null, musicKits: null, stickers: null, lastFetch: 0
};

export async function getCsgoDatabases() {
  const CACHE_DURATION = 24 * 60 * 60 * 1000;
  const now = Date.now();
  
  if (memoryCache.lastFetch && (now - memoryCache.lastFetch < CACHE_DURATION)) {
    return memoryCache;
  }

  try {
    const fetchConfig = { cache: "no-store" as RequestCache };
    const [resSkins, resCol, resMusic, resStickers] = await Promise.all([
      fetch("https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json", fetchConfig),
      fetch("https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/collectibles.json", fetchConfig),
      fetch("https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/music_kits.json", fetchConfig),
      fetch("https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/stickers.json", fetchConfig)
    ]);
    
    memoryCache.skins = resSkins.ok ? await resSkins.json() : [];
    memoryCache.collectibles = resCol.ok ? await resCol.json() : [];
    memoryCache.musicKits = resMusic.ok ? await resMusic.json() : [];
    memoryCache.stickers = resStickers.ok ? await resStickers.json() : [];
    memoryCache.lastFetch = now;
    
    return memoryCache;
  } catch (error) {
    return memoryCache;
  }
}

export type InventoryItem = {
  type: string;
  def?: number;
  musicId?: number;
  paint?: number;
  wear?: number;
  nametag?: string;
  name: string;
  imageUrl: string | null;
  hash?: string;
  teams: ("T" | "CT")[];
  isStatTrak: boolean;
  seed?: number;
  mappedStickers: { name: string; imageUrl: string }[];
};

export async function getInventoryData(steamId64: string): Promise<InventoryItem[]> {
  try {
    const res = await fetch(`https://inventory.cstrike.app/api/equipped/v4/${steamId64}.json`, {
      next: { revalidate: 3600, tags: [`inventory-${steamId64}`] },
    });
    if (!res.ok) return [];
    const data = await res.json();
    
    const itemsMap = new Map<string, any>();
    
    const addItem = (item: any, type: string, team: "T" | "CT") => {
      const key = item.hash || `${item.def}-${item.paint}` || item.musicId || "collectible";
      if (itemsMap.has(key)) {
        const existing = itemsMap.get(key);
        if (!existing.teams.includes(team)) {
          existing.teams.push(team);
        }
      } else {
        itemsMap.set(key, { ...item, type, teams: [team] });
      }
    };
    
    if (data.knives) {
      Object.entries(data.knives).forEach(([key, item]: [string, any]) => {
        const team = key === "2" ? "T" : key === "3" ? "CT" : null;
        if (team) addItem(item, "Knife", team);
      });
    }
    
    if (data.gloves) {
      Object.entries(data.gloves).forEach(([key, item]: [string, any]) => {
        const team = key === "2" ? "T" : key === "3" ? "CT" : null;
        if (team) addItem(item, "Gloves", team);
      });
    }
    
    if (data.tWeapons) {
      Object.values(data.tWeapons).forEach((item: any) => addItem(item, "Weapon", "T"));
    }
    
    if (data.ctWeapons) {
      Object.values(data.ctWeapons).forEach((item: any) => addItem(item, "Weapon", "CT"));
    }
    
    if (data.collectible) {
      itemsMap.set("collectible", { ...data.collectible, type: "Pin", teams: ["CT", "T"] });
    }
    if (data.musicKit) {
      itemsMap.set("musicKit", { ...data.musicKit, type: "Music Kit", teams: ["CT", "T"] });
    }
    
    const items = Array.from(itemsMap.values());
    
    const db = await getCsgoDatabases();
    
    return items.map((item) => {
      let dbItem;
      let itemName = `Unknown Item`;
      let imageUrl = null;
      let mappedStickers: { name: string, imageUrl: string }[] = [];
      
      const isStatTrak = item.stattrak !== undefined && item.stattrak !== null && item.stattrak >= 0;

      if (item.type === "Pin") {
        dbItem = db.collectibles?.find((s: any) => s.def_index === String(item.def));
        itemName = dbItem?.name || `Pin (${item.def})`;
        imageUrl = dbItem?.image || null;
      } else if (item.type === "Music Kit") {
        dbItem = db.musicKits?.find((s: any) => s.def_index === String(item.musicId));
        itemName = dbItem?.name || `Music Kit (${item.musicId})`;
        imageUrl = dbItem?.image || null;
      } else {
        dbItem = db.skins?.find((s: any) => {
          const matchDef = s.weapon?.weapon_id === item.def;
          const matchPaint = String(s.paint_index || '0') === String(item.paint || '0');
          return matchDef && matchPaint;
        });
        itemName = dbItem ? dbItem.name.replace('★ ', '') : `Unknown Weapon (${item.def})`;
        imageUrl = dbItem?.image || null;
        
        if (item.stickers && Array.isArray(item.stickers)) {
          mappedStickers = item.stickers.map((st: any) => {
             const stDb = db.stickers?.find((s: any) => s.def_index === String(st.def));
             return stDb ? { name: stDb.name, imageUrl: stDb.image } : null;
          }).filter(Boolean);
        }
      }
      
      return {
        ...item,
        name: itemName,
        imageUrl,
        isStatTrak,
        mappedStickers
      };
    });
  } catch (error) {
    return [];
  }
}
export async function getRealSteamInventory(steamId64: string) {
  try {
    const res = await fetch(`https://steamcommunity.com/inventory/${steamId64}/730/2?l=english&count=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return { items: [], error: res.status === 403 ? "private" : "rate_limit" };
    }
    const data = await res.json();
    if (!data || !data.assets || !data.descriptions) {
      return { items: [], error: "empty" };
    }

    const descMap = new Map();
    for (const desc of data.descriptions) {
      descMap.set(desc.classid + '_' + desc.instanceid, desc);
    }

    const items = [];
    for (const asset of data.assets) {
      const desc = descMap.get(asset.classid + '_' + asset.instanceid);
      if (desc && desc.icon_url) {
        // Filter out cases, grafitti, keys etc if possible, usually by checking tags
        const isWeaponOrGloves = desc.tags?.some((t: any) => 
          t.category === "Weapon" || t.category === "Type" && (t.internal_name === "CSGO_Type_Knife" || t.internal_name === "Type_Hands")
        );
        if (isWeaponOrGloves) {
          // Extract rarity color
          const rarityTag = desc.tags?.find((t: any) => t.category === "Rarity");
          const color = rarityTag?.color ? `#${rarityTag.color}` : "#ffffff";
          
          let mappedStickers: { name: string, imageUrl: string }[] = [];
          if (desc.descriptions) {
            const stickerDesc = desc.descriptions.find((d: any) => d.value && d.value.includes("Sticker:"));
            if (stickerDesc) {
              const imgRegex = /<img[^>]+src="([^">]+)"/g;
              let match;
              while ((match = imgRegex.exec(stickerDesc.value)) !== null) {
                mappedStickers.push({ imageUrl: match[1], name: "Sticker" });
              }
            }
          }
          
          let nametag;
          if (desc.fraudwarnings) {
            const ntWarn = desc.fraudwarnings.find((fw: string) => fw.startsWith("Name Tag:"));
            if (ntWarn) {
              const matches = ntWarn.match(/Name Tag: ''(.+)''/);
              if (matches) nametag = matches[1];
            }
          }
          
          items.push({
            id: asset.assetid,
            name: desc.market_hash_name,
            imageUrl: `https://community.cloudflare.steamstatic.com/economy/image/${desc.icon_url}`,
            color: color,
            type: desc.type,
            mappedStickers,
            nametag
          });
        }
      }
    }

    return { items, error: null };
  } catch (error) {
    return { items: [], error: "fetch_failed" };
  }
}
