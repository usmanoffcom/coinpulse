'use server';

import qs from 'query-string';

const BASE_URL = process.env.COINMARKETCAP_BASE_URL || 'https://pro-api.coinmarketcap.com';
const API_KEY = process.env.COINMARKETCAP_API_KEY;

if (!API_KEY) throw new Error('COINMARKETCAP_API_KEY is not set');

export async function fetcher<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 180, // 3 minutes cache for Hobbyist tier (30 req/min limit)
): Promise<T> {
  // Remove leading slash from endpoint if present, and ensure BASE_URL doesn't end with slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  
  const url = qs.stringifyUrl(
    {
      url: `${cleanBaseUrl}/${cleanEndpoint}`,
      query: params,
    },
    { skipEmptyString: true, skipNull: true },
  );

  const response = await fetch(url, {
    headers: {
      'X-CMC_PRO_API_KEY': API_KEY,
      'Content-Type': 'application/json',
    } as Record<string, string>,
    next: { revalidate },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const statusBody = errorBody as { status?: { error_message?: string; error_code?: number } };
    const errorMessage = statusBody?.status?.error_message || response.statusText;
    
    // Handle specific errors
    if (response.status === 403) {
      // For OHLCV endpoint, 403 is expected (not available on Hobbyist) - use warn instead of error
      const isOHLCVEndpoint = endpoint.includes('ohlcv');
      const logMethod = isOHLCVEndpoint ? console.warn : console.error;
      
      logMethod(`CoinMarketCap API 403 Forbidden: ${endpoint}. Error: ${errorMessage}`);
      
      if (!isOHLCVEndpoint) {
        // Only log detailed error for non-OHLCV endpoints (for debugging)
        console.error('CoinMarketCap API 403 Forbidden Details:', {
          endpoint,
          url,
          errorCode: statusBody?.status?.error_code,
          errorMessage,
          apiKeyPrefix: API_KEY?.substring(0, 8) + '...' // Log first 8 chars only for security
        });
        console.warn('If you recently upgraded to Hobbyist plan, please restart your Next.js dev server to reload API key.');
      }
    } else if (response.status === 429) {
      console.warn('CoinMarketCap API rate limit exceeded. Please wait before making more requests.');
    }
    
    throw new Error(`API Error: ${response.status}: ${errorMessage}`);
  }

  return response.json();
}

// Helper to convert CoinMarketCap ID/symbol to slug format (for backward compatibility)
function idToSlug(id: number | string, symbol: string): string {
  return `${symbol.toLowerCase()}-${id}`;
}

function slugToIdAndSymbol(slug: string): { id?: string; symbol?: string } {
  // Try to extract from slug format like "bitcoin-1" or just use as-is
  const parts = slug.split('-');
  if (parts.length >= 2 && !isNaN(Number(parts[parts.length - 1]))) {
    return {
      id: parts[parts.length - 1],
      symbol: parts.slice(0, -1).join('-').toUpperCase(),
    };
  }
  return { symbol: slug.toUpperCase() };
}

// Fetch coin listings (markets)
export async function getCoinMarkets(params: {
  start?: number;
  limit?: number;
  convert?: string;
}): Promise<CoinMarketData[]> {
  const { start = 1, limit = 10, convert = 'USD' } = params;

  const response = await fetcher<{
    data: Array<{
      id: number;
      name: string;
      symbol: string;
      slug: string;
      cmc_rank: number;
      num_market_pairs: number;
      circulating_supply: number;
      total_supply: number;
      max_supply: number | null;
      infinite_supply: boolean;
      last_updated: string;
      date_added: string;
      quote: {
        USD: {
          price: number;
          volume_24h: number;
          volume_change_24h: number;
          percent_change_1h: number;
          percent_change_24h: number;
          percent_change_7d: number;
          percent_change_30d: number;
          percent_change_60d: number;
          percent_change_90d: number;
          market_cap: number;
          market_cap_dominance: number;
          fully_diluted_market_cap: number;
          last_updated: string;
        };
      };
    }>;
  }>('/v1/cryptocurrency/listings/latest', {
    start: String(start),
    limit: String(limit),
    convert,
  });

  return response.data.map((coin) => ({
    id: idToSlug(coin.id, coin.symbol),
    symbol: coin.symbol,
    name: coin.name,
    image: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
    current_price: coin.quote.USD.price,
    market_cap: coin.quote.USD.market_cap,
    market_cap_rank: coin.cmc_rank,
    fully_diluted_valuation: coin.quote.USD.fully_diluted_market_cap,
    total_volume: coin.quote.USD.volume_24h,
    high_24h: 0, // CMC doesn't provide this in listings
    low_24h: 0,
    price_change_24h: (coin.quote.USD.price * coin.quote.USD.percent_change_24h) / 100,
    price_change_percentage_24h: coin.quote.USD.percent_change_24h,
    market_cap_change_24h: (coin.quote.USD.market_cap * coin.quote.USD.percent_change_24h) / 100,
    market_cap_change_percentage_24h: coin.quote.USD.percent_change_24h,
    circulating_supply: coin.circulating_supply,
    total_supply: coin.total_supply,
    max_supply: coin.max_supply,
    ath: 0, // Will be fetched separately if needed
    ath_change_percentage: 0,
    ath_date: '',
    atl: 0,
    atl_change_percentage: 0,
    atl_date: '',
    last_updated: coin.last_updated,
  }));
}

// Fetch coin details
// Hobbyist plan should have access to /v1/cryptocurrency/info, but with fallback if not available
export async function getCoinDetails(slug: string): Promise<CoinDetailsData> {
  const { id, symbol } = slugToIdAndSymbol(slug);
  const identifier = id || symbol || slug;

  // Always fetch quotes first (most reliable endpoint)
  const quotesResponse = await fetcher<{
    data: Record<
      string,
      {
        id: number;
        name: string;
        symbol: string;
        slug: string;
        cmc_rank: number;
        circulating_supply: number;
        total_supply: number;
        max_supply: number | null;
        quote: {
          USD: {
            price: number;
            volume_24h: number;
            volume_change_24h: number;
            percent_change_1h: number;
            percent_change_24h: number;
            percent_change_7d: number;
            percent_change_30d: number;
            percent_change_60d: number;
            percent_change_90d: number;
            market_cap: number;
            market_cap_dominance: number;
            fully_diluted_market_cap: number;
            last_updated: string;
          };
        };
      }
    >;
  }>('/v1/cryptocurrency/quotes/latest', {
    [id ? 'id' : 'symbol']: identifier,
    convert: 'USD',
  });

  const coinQuote = Object.values(quotesResponse.data)[0];

  // Try to fetch info, but fallback if 403 (may not be activated yet or unavailable)
  let coinInfo: {
    id: number;
    name: string;
    symbol: string;
    slug: string;
    description?: string;
    urls?: {
      website?: string[];
      explorer?: string[];
      reddit?: string[];
    };
  } = {
    id: coinQuote.id,
    name: coinQuote.name,
    symbol: coinQuote.symbol,
    slug: coinQuote.slug,
  };

  try {
    const infoResponse = await fetcher<{
      data: Record<
        string,
        {
          id: number;
          name: string;
          symbol: string;
          slug: string;
          description: string;
          urls: {
            website: string[];
            explorer: string[];
            reddit: string[];
          };
        }
      >;
    }>('/v1/cryptocurrency/info', {
      [id ? 'id' : 'symbol']: identifier,
    });
    const fetchedInfo = Object.values(infoResponse.data)[0];
    if (fetchedInfo) {
      coinInfo = {
        id: fetchedInfo.id,
        name: fetchedInfo.name,
        symbol: fetchedInfo.symbol,
        slug: fetchedInfo.slug,
        description: fetchedInfo.description,
        urls: fetchedInfo.urls,
      };
    }
  } catch (error: any) {
    // If info endpoint returns 403, use basic info from quotes response
    if (error?.message?.includes('403') || error?.message?.includes('Forbidden')) {
      console.warn(`Info endpoint not available for ${slug}, using quotes data only`);
    } else {
      throw error; // Re-throw other errors
    }
  }

  return {
    id: idToSlug(coinInfo.id, coinInfo.symbol),
    name: coinInfo.name,
    symbol: coinInfo.symbol,
    asset_platform_id: null,
    detail_platforms: {},
    image: {
      large: `https://s2.coinmarketcap.com/static/img/coins/200x200/${coinInfo.id}.png`,
      small: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coinInfo.id}.png`,
    },
    market_data: {
      current_price: {
        usd: coinQuote.quote.USD.price,
      },
      price_change_24h_in_currency: {
        usd: (coinQuote.quote.USD.price * coinQuote.quote.USD.percent_change_24h) / 100,
      },
      price_change_percentage_24h_in_currency: {
        usd: coinQuote.quote.USD.percent_change_24h,
      },
      price_change_percentage_30d_in_currency: {
        usd: coinQuote.quote.USD.percent_change_30d || 0,
      },
      market_cap: {
        usd: coinQuote.quote.USD.market_cap,
      },
      total_volume: {
        usd: coinQuote.quote.USD.volume_24h,
      },
    },
    market_cap_rank: coinQuote.cmc_rank,
    description: {
      en: coinInfo.description || '',
    },
    links: {
      homepage: coinInfo.urls?.website || [],
      blockchain_site: coinInfo.urls?.explorer || [],
      subreddit_url: coinInfo.urls?.reddit?.[0] || '',
    },
    tickers: [],
  };
}

// Mapping of common coin symbols to CoinGecko IDs
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'DOT': 'polkadot',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'LTC': 'litecoin',
  'AVAX': 'avalanche-2',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'ETC': 'ethereum-classic',
  'XLM': 'stellar',
  'ALGO': 'algorand',
  'FIL': 'filecoin',
  'TRX': 'tron',
  'VET': 'vechain',
};

// Fetch OHLCV data from CoinGecko Public API (fallback when CoinMarketCap and Binance are unavailable)
// CoinGecko Public API is free and doesn't require API keys
async function getOHLCVFromCoinGecko(
  slug: string,
  coinName?: string,
  symbol?: string,
  params?: {
    days?: number | string;
    interval?: string;
  },
): Promise<OHLCData[]> {
  const { days = 1, interval = 'hourly' } = params || {};
  
  // Try to get CoinGecko ID from mapping, symbol, or slug
  let coinId: string | null = null;
  
  // First, try symbol mapping (e.g., ETH -> ethereum)
  if (symbol && SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()]) {
    coinId = SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()];
  }
  
  // If not found, try extracting from slug (bitcoin-1 -> bitcoin)
  if (!coinId) {
    const slugParts = slug.split('-');
    if (slugParts.length > 0) {
      const potentialId = slugParts[0].toLowerCase();
      // Try common mappings first
      if (potentialId === 'eth') {
        coinId = 'ethereum';
      } else if (potentialId === 'btc') {
        coinId = 'bitcoin';
      } else {
        coinId = potentialId;
      }
    }
  }
  
  // If still not found and we have coin name, try to derive from name
  if (!coinId && coinName) {
    const nameLower = coinName.toLowerCase().replace(/\s+/g, '-');
    coinId = nameLower;
  }
  
  if (!coinId) {
    console.warn(`Could not determine CoinGecko ID for ${slug}`);
    return [];
  }
  
  // Calculate days
  const daysNum = typeof days === 'string' ? parseInt(days) || 1 : days;
  const vsCurrency = 'usd';
  
  // CoinGecko OHLC endpoint format: /coins/{id}/ohlc
  // interval: daily (default) or hourly (if days <= 1, use hourly)
  const coinGeckoDays = daysNum <= 1 ? 1 : daysNum;
  
  try {
    const url = qs.stringifyUrl({
      url: `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc`,
      query: {
        vs_currency: vsCurrency,
        days: String(coinGeckoDays),
      },
    });

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`CoinGecko API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as Array<[number, number, number, number, number]>;

    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`CoinGecko returned empty data for ${coinId}`);
      return [];
    }

    // CoinGecko format: [timestamp_ms, open, high, low, close]
    // This is already in our format!
    const result = data.map((candle) => [
      candle[0], // timestamp in ms
      candle[1], // open
      candle[2], // high
      candle[3], // low
      candle[4], // close
    ] as OHLCData);
    
    console.log(`Successfully fetched ${result.length} OHLCV candles from CoinGecko for ${coinId}`);
    return result;
  } catch (error: any) {
    console.warn(`CoinGecko OHLCV fetch failed for ${slug} (id: ${coinId}):`, error?.message || error);
    return [];
  }
}

// Fetch OHLCV data from Binance (fallback when CoinMarketCap is unavailable)
// Binance Public API is free and doesn't require API keys
async function getOHLCVFromBinance(
  symbol: string,
  params: {
    days?: number | string;
    interval?: string;
  },
): Promise<OHLCData[]> {
  const { days = 1, interval = 'hourly' } = params;
  
  // Map interval to Binance format
  const binanceInterval = interval === 'hourly' ? '1h' : interval === 'daily' ? '1d' : '1h';
  
  // Calculate limit based on days
  const daysNum = typeof days === 'string' ? parseInt(days) || 1 : days;
  const limit = Math.min(Math.max(daysNum * (interval === 'hourly' ? 24 : 1), 100), 1000); // Binance max is 1000
  
  // Calculate start time if needed
  const endTime = Date.now();
  const startTime = endTime - daysNum * 24 * 60 * 60 * 1000;
  
  // Binance symbol format: BTCUSDT, ETHUSDT, etc.
  const binanceSymbol = `${symbol}USDT`;
  
  try {
    const url = qs.stringifyUrl({
      url: 'https://api.binance.com/api/v3/klines',
      query: {
        symbol: binanceSymbol,
        interval: binanceInterval,
        limit: String(limit),
        startTime: String(startTime),
        endTime: String(endTime),
      },
    });

    const response = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Binance API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as Array<[number, string, string, string, string, string, number, string, number, string, string, string]>;

    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`Binance returned empty data for ${binanceSymbol}`);
      return [];
    }

    // Binance format: [Open time, Open, High, Low, Close, Volume, Close time, ...]
    // Convert to our format: [timestamp_ms, open, high, low, close]
    const result = data.map((kline) => [
      kline[0], // Open time (timestamp in ms)
      parseFloat(kline[1]), // Open
      parseFloat(kline[2]), // High
      parseFloat(kline[3]), // Low
      parseFloat(kline[4]), // Close
    ]);
    
    return result;
  } catch (error: any) {
    console.warn(`Binance OHLCV fetch failed for ${symbol} (symbol: ${binanceSymbol}):`, error?.message || error);
    return [];
  }
}

// Fetch OHLCV data
// Hobbyist plan should have access to historical OHLCV data, but with fallback to Binance if not available
export async function getCoinOHLCV(
  slug: string,
  params: {
    vs_currency?: string;
    days?: number | string;
    interval?: string;
  },
): Promise<OHLCData[]> {
  const { id, symbol } = slugToIdAndSymbol(slug);
  const identifier = id || symbol || slug;
  const coinSymbol = symbol || slug.toUpperCase();

  const { days = 1, interval = 'hourly', vs_currency = 'USD' } = params;

  // Calculate time_start and time_end based on days
  const timeEnd = Math.floor(Date.now() / 1000);
  const daysNum = typeof days === 'string' ? parseInt(days) || 1 : days;
  
  // Hobbyist plan supports up to 1 month (30 days) for hourly/daily intervals
  // Limit to 30 days to stay within plan limits
  const limitedDays = Math.min(daysNum, 30);
  const timeStart = timeEnd - limitedDays * 24 * 60 * 60;

  // Map interval to CMC format
  const cmcInterval = interval === 'hourly' ? 'hourly' : interval === 'daily' ? 'daily' : 'daily';
  const count = limitedDays <= 1 ? 24 : limitedDays; // approximate count

  try {
    const response = await fetcher<{
      data: {
        id: number;
        name: string;
        symbol: string;
        quotes: Array<{
          time_open: string;
          time_close: string;
          time_high: string;
          time_low: string;
          quote: {
            USD: {
              open: number;
              high: number;
              low: number;
              close: number;
              volume: number;
            };
          };
        }>;
      };
    }>('/v2/cryptocurrency/ohlcv/historical', {
      [id ? 'id' : 'symbol']: identifier,
      time_start: String(timeStart),
      time_end: String(timeEnd),
      interval: cmcInterval,
      count: String(count),
      convert: vs_currency,
    });

    return response.data.quotes.map((quote) => [
      new Date(quote.time_open).getTime(), // timestamp in ms
      quote.quote.USD.open,
      quote.quote.USD.high,
      quote.quote.USD.low,
      quote.quote.USD.close,
    ]);
  } catch (error: any) {
    // If OHLCV endpoint returns 403 or fails, use Binance as fallback
    if (error?.message?.includes('403') || error?.message?.includes('Forbidden') || error?.message?.includes('Error')) {
      console.warn(`CoinMarketCap OHLCV endpoint not available for ${slug}, trying Binance fallback...`);
      
      // Get correct symbol from CoinMarketCap API (e.g., "BTC" instead of "BITCOIN")
      let correctSymbol = coinSymbol;
      try {
        const quotesResponse = await fetcher<{
          data: Record<string, { symbol: string }>;
        }>('/v1/cryptocurrency/quotes/latest', {
          [id ? 'id' : 'symbol']: identifier,
          convert: 'USD',
        });
        const coinQuote = Object.values(quotesResponse.data)[0];
        if (coinQuote?.symbol) {
          correctSymbol = coinQuote.symbol;
        }
      } catch (quoteError) {
        // If quotes also fails, use the symbol we have
        console.warn(`Could not fetch symbol from CoinMarketCap for ${slug}, using ${coinSymbol}`);
      }
      
      // Get coin name from CoinMarketCap for CoinGecko fallback
      let coinName: string | undefined;
      try {
        const quotesResponse = await fetcher<{
          data: Record<string, { name: string; symbol: string }>;
        }>('/v1/cryptocurrency/quotes/latest', {
          [id ? 'id' : 'symbol']: identifier,
          convert: 'USD',
        });
        const coinQuote = Object.values(quotesResponse.data)[0];
        if (coinQuote) {
          coinName = coinQuote.name;
          correctSymbol = coinQuote.symbol;
        }
      } catch (quoteError) {
        // If quotes fails, use what we have
      }
      
      // Try Binance fallback with correct symbol
      const binanceData = await getOHLCVFromBinance(correctSymbol, { days, interval });
      
      if (binanceData.length > 0) {
        console.log(`Successfully fetched ${binanceData.length} OHLCV candles from Binance for ${correctSymbol}`);
        return binanceData;
      }
      
      // If Binance fails (e.g., 451 geo-restriction), try CoinGecko Public API
      console.warn(`Binance failed for ${slug}, trying CoinGecko fallback...`);
      const coinGeckoData = await getOHLCVFromCoinGecko(slug, coinName, correctSymbol, { days, interval });
      
      if (coinGeckoData.length > 0) {
        console.log(`Successfully fetched ${coinGeckoData.length} OHLCV candles from CoinGecko for ${slug}`);
        return coinGeckoData;
      }
      
      console.warn(`All sources (CoinMarketCap, Binance, CoinGecko) failed for ${slug}`);
      return [];
    }
    console.error('Error fetching OHLCV:', error);
    
    // Try Binance as fallback for any error - get correct symbol and name first
    let correctSymbol = coinSymbol;
    let coinName: string | undefined;
    try {
      const quotesResponse = await fetcher<{
        data: Record<string, { name: string; symbol: string }>;
      }>('/v1/cryptocurrency/quotes/latest', {
        [id ? 'id' : 'symbol']: identifier,
        convert: 'USD',
      });
      const coinQuote = Object.values(quotesResponse.data)[0];
      if (coinQuote) {
        correctSymbol = coinQuote.symbol;
        coinName = coinQuote.name;
      }
    } catch (quoteError) {
      // Use symbol we have if quotes fails
    }
    
    const binanceData = await getOHLCVFromBinance(correctSymbol, { days, interval });
    if (binanceData.length > 0) {
      return binanceData;
    }
    
    // If Binance fails, try CoinGecko as last resort
    const coinGeckoData = await getOHLCVFromCoinGecko(slug, coinName, correctSymbol, { days, interval });
    if (coinGeckoData.length > 0) {
      return coinGeckoData;
    }
    
    return [];
  }
}

// Fetch trending coins (CMC doesn't have trending endpoint, so we'll use top gainers)
// Hobbyist plan: manual sorting works well, keeping this approach for consistency
export async function getTrendingCoins(): Promise<{ coins: TrendingCoin[] }> {
  try {
    const response = await fetcher<{
      data: Array<{
        id: number;
        name: string;
        symbol: string;
        slug: string;
        cmc_rank: number;
        quote: {
          USD: {
            price: number;
            percent_change_24h: number;
          };
        };
      }>;
    }>('/v1/cryptocurrency/listings/latest', {
      start: '1',
      limit: '50', // Fetch more to sort manually
      convert: 'USD',
    });

    // Check if response has data
    if (!response.data || response.data.length === 0) {
      return { coins: [] };
    }

    // Sort by percent_change_24h descending manually
    const sortedData = response.data
      .sort((a, b) => b.quote.USD.percent_change_24h - a.quote.USD.percent_change_24h)
      .slice(0, 7); // Take top 7

    return {
      coins: sortedData.map((coin) => ({
        item: {
          id: idToSlug(coin.id, coin.symbol),
          name: coin.name,
          symbol: coin.symbol,
          market_cap_rank: coin.cmc_rank,
          thumb: `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png`,
          large: `https://s2.coinmarketcap.com/static/img/coins/200x200/${coin.id}.png`,
          data: {
            price: coin.quote.USD.price,
            price_change_percentage_24h: {
              usd: coin.quote.USD.percent_change_24h,
            },
          },
        },
      })),
    };
  } catch (error) {
    console.error('Error fetching trending coins:', error);
    // Return empty array instead of throwing to allow graceful degradation
    return { coins: [] };
  }
}

// Fetch categories
// Hobbyist plan has access to /v1/cryptocurrency/categories endpoint
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetcher<{
      data: Array<{
        id: string;
        name: string;
        title: string;
        description: string;
        num_tokens: number;
        avg_price_change: number;
        market_cap: number;
        market_cap_change: number;
        volume: number;
        volume_change: number;
        last_updated: string;
      }>;
    }>('/v1/cryptocurrency/categories', {
      limit: '100',
    });

    return response.data.map((category) => ({
      name: category.name,
      top_3_coins: [], // CMC doesn't provide this directly, would need separate call
      market_cap_change_24h: category.market_cap_change || 0,
      market_cap: category.market_cap,
      volume_24h: category.volume,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
