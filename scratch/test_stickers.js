async function test() {
  const res = await fetch(`https://steamcommunity.com/inventory/76561199504332272/730/2?l=english&count=100`);
  const data = await res.json();
  const descWithStickers = data.descriptions.find(d => 
    d.descriptions && d.descriptions.some(sub => sub.value.includes('Sticker:'))
  );
  if (descWithStickers) {
    const stickerDesc = descWithStickers.descriptions.find(sub => sub.value.includes('Sticker:'));
    console.log("Found stickers for:", descWithStickers.market_hash_name);
    console.log("Sticker HTML:", stickerDesc.value);
  } else {
    console.log("No stickers found in the first 100 items.");
  }
}
test();
