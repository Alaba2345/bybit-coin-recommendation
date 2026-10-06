import { useEffect, useState } from 'react';

const generateDynamicCoins = () => {
  const baseAssets = [
    'BTC','ETH','SOL','BNB','XRP','ADA','DOGE','LINK','DOT','AVAX','MATIC','LTC','UNI','ATOM','NEAR','APT','ARB','OP','ALGO','FIL','TIA','SUI','RNDR','PEPE','FET','BONK','INJ','SEI','FLOW','IMX','GRT','EOS','ONT','XTZ','KAVA','TRX','ICP','ETC','EGLD','WAVES','SAND','MANA','AAVE','COMP','YFI','SNX','THETA','HBAR','VET','CHZ','ENJ','RUNE','KSM','FTM','CELR','ZIL','ONE','PYR','IOTX','NEXO','BCH','XLM','USDC','BUSD','TUSD','DAI','SUSHI','JUP','MAGIC','MASK','WIF','PENDLE','FLUX','AKT','JASMY','BLUR','PAXG','XNO','GALA','FLOKI','WLD','ORDI','GAS','VOXEL','BTT','CRO','BGB','GMT','GTC','LDO','JTO','ZRO','AZERO','KNC','RSR','DENT','SKL','ACH','REEF','MAV','SXP','DASH','ZEC','NMR','KAS','CSPR','HNT','BORA','EVMOS','XDC','DAO','CTK','MINA','NTRN','PRQ','LUNC','APE','WOO','GNO','BANC','CVX','FXS','STX','MUBI','HIFI','USDP','ILV','LOKA','NCT','POLS','RONIN','KLAY','UOS','ERN','PORTAL','OGN','SFRX','DYM','PHB','ID','MANTA','BAN','REQ','MEV','STG','AUDIO','TVK','ARK','BICO','RLB','BNT','ZEN','LQTY','MBOX','KAI','C98','XPR','BOND','BTRST','LRC','SYN','YGG','AMP','ZETA','OCEAN','DUSK','GODS','RAY','GLMR','MNGO','PING','TWT','RPL','RIF','XAUT','BLOK','ZRX','CVC','BAL','UMA','BADGER','STRK','STETH','AGIX','RLC','TORN','DYDX','PERP','JOE','LOOKS','SWAP','ALCH','SHIB','ETHPOW','FRAX','CRV','PLS','RENDER','MOVR','CELO','FLR','XEC','CHIA','BSW','ROSE','OSMO','MEME','HOOKED','SWIM','NFT','AURORA','ZK','LOOT','SWASH','CHEQ','RMRK','STRM','BDX','ZEPHYR','SENSO','ARDR','SNM','POND','GOA','METIS','GLITCH','FUZZ','ALB','VENOM','GOKU','MARA','NAKA','SIDUS','EXON','NEON','NUDES','TSK','XALL','SHFL','SAITAMA','CHIB','PEEL','KOTO','TXAD','DOLA','WBNB','WETH','UST','LUSD','MUSD','NUSD','VUSD','XBOND','LUNA','CONVEX','DRIFT','KWENTA','LYRA','PSYOP','SPACE','TOMO','ZORA','BONE','LEASH','INU','SHINA','HOGE','AKITA','ELON','MOMO','KABOSU','ROCKET','MOON','SAFE','GROK','MOG','COPE','SMD','BRETT','BOME','PNUT','SPX','LOP','LONG','SHORT','PHANTOM','MNT','MAVA','MAVIS','AXS','RON','DECEN','TKEY','CHIP','CYBER','PRIME','ZLTO','MINT','JEDI','PYTH','MARINADE','ORCA','SERUM',
  ];

  const coins = baseAssets
    .map((asset) => `${asset}USDT`)
    .filter((symbol, index, arr) => arr.indexOf(symbol) === index)
    .slice(0, 750)
    .map((symbol, index) => createDynamicCoin(symbol, index))
    .sort((a, b) => b.score - a.score);

  return coins;
};

const createDynamicCoin = (symbol, index) => {
  const seed = hashSymbol(symbol);
  const timestamp = Date.now();
  
  // Simulate real-time price movements
  const priceMultiplier = 1 + (Math.sin(timestamp / 5000 + seed) * 0.05);
  
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

  const lastPrice = Number((basePrice * priceMultiplier).toFixed(6));
  
  // Dynamic price change - changes in real-time
  const volatilityFactor = Math.sin(timestamp / 3000 + seed) * 0.15 + (Math.random() - 0.5) * 0.1;
  const price24hPcnt = Number((((seed % 80) - 30) / 10 + volatilityFactor).toFixed(2));
  
  const volume24h = ((seed % 950000000) + 120000000) * (index % 7 + 1);
  const marketCap = Number((volume24h * lastPrice * (2 + (seed % 8))).toFixed(0));
  const turnover24h = Number((volume24h * lastPrice * 1.3).toFixed(2));

  // Real-time signal detection
  const score = calculateScore(price24hPcnt, volume24h, marketCap, seed);
  const signal = detectSignal(price24hPcnt, score, volume24h);
  const volatility = Number((0.8 + ((seed % 60) / 25) + Math.abs(volatilityFactor)).toFixed(2));

  const stopLoss = Number((lastPrice * (1 - 0.12 - ((seed % 20) / 1000))).toFixed(6));
  const takeProfit1 = Number((lastPrice * (1 + 0.08 + ((seed % 30) / 1000))).toFixed(6));
  const takeProfit2 = Number((lastPrice * (1 + 0.18 + ((seed % 45) / 1000))).toFixed(6));

  return {
    symbol,
    lastPrice,
    price24hPcnt,
    volume24h,
    marketCap,
    turnover24h,
    signal,
    score: Number(score.toFixed(1)),
    volatility,
    stopLoss,
    takeProfit1,
    takeProfit2,
    lastUpdated: timestamp,
  };
};

const hashSymbol = (symbol) => {
  const base = symbol.replace('USDT', '').replace('USD', '');
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash * 31 + base.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const calculateScore = (price24hPcnt, volume24h, marketCap, seed) => {
  const gainScore = Math.min(price24hPcnt * 2, 30); // Bonus for gains
  const volumeScore = Math.min((volume24h / 1000000000) * 10, 25); // Normalized volume
  const marketCapScore = Math.min((marketCap / 10000000000) * 15, 25); // Normalized market cap
  const baseScore = 30 + (seed % 10);
  
  const totalScore = baseScore + gainScore + volumeScore + marketCapScore;
  return Math.min(Math.max(totalScore, 20), 95);
};

const detectSignal = (price24hPcnt, score, volume24h) => {
  if (score >= 75 && price24hPcnt > 3) return 'Breakout';
  if (score >= 65 && price24hPcnt > 1.5) return 'Bullish';
  if (score >= 50 && price24hPcnt > 0) return 'Neutral';
  if (price24hPcnt < -5) return 'Risky';
  return 'Neutral';
};

export const getLiveCoins = () => {
  return generateDynamicCoins();
};

export const getTopRecommendations = (coins, limit = 5) => {
  return coins
    .filter((coin) => coin.score >= 65 && (coin.signal === 'Breakout' || coin.signal === 'Bullish'))
    .slice(0, limit);
};

export const sortCoins = (coins, sortBy = 'score') => {
  const sorted = [...coins];
  switch (sortBy) {
    case 'topGainers':
      return sorted.sort((a, b) => b.price24hPcnt - a.price24hPcnt);
    case 'topLosers':
      return sorted.sort((a, b) => a.price24hPcnt - b.price24hPcnt);
    case 'marketCap':
      return sorted.sort((a, b) => b.marketCap - a.marketCap);
    case 'volume':
      return sorted.sort((a, b) => b.volume24h - a.volume24h);
    case 'score':
    default:
      return sorted.sort((a, b) => b.score - a.score);
  }
};

export const filterCoins = (coins, filters = {}) => {
  let filtered = [...coins];

  if (filters.minMarketCap) {
    filtered = filtered.filter((coin) => coin.marketCap >= filters.minMarketCap);
  }

  if (filters.maxMarketCap) {
    filtered = filtered.filter((coin) => coin.marketCap <= filters.maxMarketCap);
  }

  if (filters.minVolume) {
    filtered = filtered.filter((coin) => coin.volume24h >= filters.minVolume);
  }

  if (filters.maxVolume) {
    filtered = filtered.filter((coin) => coin.volume24h <= filters.maxVolume);
  }

  if (filters.minPriceChange) {
    filtered = filtered.filter((coin) => coin.price24hPcnt >= filters.minPriceChange);
  }

  if (filters.maxPriceChange) {
    filtered = filtered.filter((coin) => coin.price24hPcnt <= filters.maxPriceChange);
  }

  if (filters.signal) {
    filtered = filtered.filter((coin) => coin.signal === filters.signal);
  }

  if (filters.minScore) {
    filtered = filtered.filter((coin) => coin.score >= filters.minScore);
  }

  return filtered;
};

export const paginateCoins = (coins, page = 1, perPage = 20) => {
  const total = coins.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;

  return {
    data: coins.slice(start, end),
    page,
    perPage,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

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
