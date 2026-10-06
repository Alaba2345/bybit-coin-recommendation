const bybitAssetUniverse = [
  'BTC','ETH','SOL','BNB','XRP','ADA','DOGE','LINK','DOT','AVAX','MATIC','LTC','UNI','ATOM','NEAR','APT','ARB','OP','ALGO','FIL','TIA','SUI','RNDR','PEPE','FET','BONK','INJ','SEI','NEAR','FLOW','IMX','GRT','EOS','ONT','XTZ','KAVA','TRX','ICP','ETC','EGLD','WAVES','SAND','MANA','AAVE','COMP','YFI','SNX','THETA','HBAR','VET','CHZ','ENJ','RUNE','KSM','FTM','CELR','ZIL','ONE','PYR','IOTX','NEXO','BCH','XLM','USDC','USDT','BUSD','TUSD','DAI','BTC','ETH','SOL','MATIC','LINK','ADA','DOT','XRP','UNI','SUSHI','JUP','MAGIC','MASK','WIF','PENDLE','FLUX','AKT','JASMY','BLUR','PAXG','XNO','GALA','FLOKI','WLD','ORDI','GAS','VOXEL','BTT','CRO','BGB','GMT','GTC','LDO','JTO','ZRO','AZERO','KNC','RSR','DENT','SKL','ACH','REEF','MAV','SXP','DASH','ZEC','NMR','KAS','CSPR','HNT','BORA','EVMOS','XDC','DAO','CTK','MINA','NTRN','PRQ','LUNC','APE','WOO','GNO','BANC','CVX','FXS','STX','MUBI','HIFI','USDP','ILV','LOKA','NCT','POLS','RONIN','KLAY','UOS','ERN','BRC20','PORTAL','OGN','SFRX','DYM','PHB','ID','MANTA','BAN','REQ','MEV','STG','AUDIO','TVK','ARK','BICO','RLB','BNT','ZEN','LQTY','MBOX','GAS','KAI','C98','XPR','BOND','BTRST','LRC','SYN','YGG','AMP','ZETA','OCEAN','DUSK','GODS','RAY','GLMR','MNGO','PING','TWT','RPL','RIF','XAUT','BLOK','ZRX','CVC','BAL','UMA','BADGER','STRK','STETH','AGIX','RLC','TORN','POLS'],
  'USDT'
];

const clampToPrice = (value, min, max) => Math.min(Math.max(value, min), max);

const buildSeed = (symbol) => {
  const base = symbol.replace('USDT', '').replace('USD', '');
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const createMockCoin = (symbol, index) => {
  const seed = buildSeed(symbol);
  const basePrice = (() => {
    if (symbol.includes('BTC')) return 62000 + (seed % 8000);
    if (symbol.includes('ETH')) return 3200 + (seed % 1500);
    if (symbol.includes('SOL')) return 120 + (seed % 160);
    if (symbol.includes('BNB')) return 550 + (seed % 200);
    if (symbol.includes('XRP')) return 0.52 + (seed % 0.8);
    if (symbol.includes('DOGE')) return 0.15 + (seed % 0.3);
    if (symbol.includes('ADA')) return 0.7 + (seed % 1.2);
    if (symbol.includes('LINK')) return 14 + (seed % 25);
    if (symbol.includes('MATIC')) return 0.48 + (seed % 1.1);
    if (symbol.includes('DOT')) return 6 + (seed % 12);
    if (symbol.includes('UNI')) return 9 + (seed % 18);
    return 0.5 + ((seed % 1000) / 10);
  })();

  const lastPrice = Number(basePrice.toFixed(6));
  const price24hPcnt = Number((((seed % 80) - 30) / 10).toFixed(2));
  const volume24h = ((seed % 950000000) + 120000000) * (index % 7 + 1);
  const turnover24h = Number((volume24h * lastPrice * 1.3).toFixed(2));

  const signalPool = ['Bullish', 'Breakout', 'Neutral', 'Risky'];
  const signal = signalPool[seed % signalPool.length];
  const score = clampToPrice(30 + (seed % 60), 28, 96);
  const volatility = Number((0.8 + ((seed % 60) / 25)).toFixed(2));

  const stopLoss = Number((lastPrice * (1 - 0.12 - ((seed % 20) / 1000))).toFixed(6));
  const takeProfit1 = Number((lastPrice * (1 + 0.08 + ((seed % 30) / 1000))).toFixed(6));
  const takeProfit2 = Number((lastPrice * (1 + 0.18 + ((seed % 45) / 1000))).toFixed(6));

  return {
    symbol,
    lastPrice,
    price24hPcnt,
    volume24h,
    turnover24h,
    signal,
    score: Number(score.toFixed(1)),
    volatility,
    stopLoss,
    takeProfit1,
    takeProfit2,
  };
};

export const mockCoins = bybitAssetUniverse
  .map((asset, index) => `${asset}USDT`)
  .filter((symbol, index, arr) => arr.indexOf(symbol) === index)
  .slice(0, 250)
  .map((symbol, index) => createMockCoin(symbol, index));

export const buildMockChart = (symbol) => {
  const basePrice = symbol.includes('BTC') ? 64280 : symbol.includes('ETH') ? 3520 : symbol.includes('SOL') ? 156 : 50;
  const points = [];
  let price = basePrice * 0.92;

  for (let i = 0; i < 36; i++) {
    price = price * (1 + (Math.sin(i / 4) * 0.02) + (Math.random() - 0.5) * 0.015);
    points.push({
      time: `T-${35 - i}`,
      close: Number(price.toFixed(4)),
      open: Number((price * (1 + (Math.random() - 0.5) * 0.01)).toFixed(4)),
      high: Number((price * (1 + (Math.random() * 0.02))).toFixed(4)),
      low: Number((price * (1 - (Math.random() * 0.02))).toFixed(4)),
      volume: Number((Math.random() * 2000000 + 500000).toFixed(0)),
    });
  }

  return points;
};
