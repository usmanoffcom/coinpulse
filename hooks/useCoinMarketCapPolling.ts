'use client';

import { useEffect, useRef, useState } from 'react';

// Client-side API function for fetching coin data
const fetchCoinPrice = async (coinId: string): Promise<ExtendedPriceData | null> => {
  try {
    // Extract symbol or id from coinId (format: "symbol-id" or just "symbol")
    const parts = coinId.split('-');
    const hasId = parts.length >= 2 && !isNaN(Number(parts[parts.length - 1]));
    const identifier = hasId ? parts[parts.length - 1] : parts[0].toUpperCase();
    const paramName = hasId ? 'id' : 'symbol';

    const response = await fetch(`/api/coinmarketcap/quotes?${paramName}=${encodeURIComponent(identifier)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch price');
    }

    const data = await response.json();
    
    if (!data || !data.data) {
      return null;
    }

    // CMC returns data with numeric ID as key or symbol as key
    const coin = Object.values(data.data)[0] as any;
    if (!coin) {
      return null;
    }

    const quote = coin.quote?.USD;

    if (!quote) {
      return null;
    }

    return {
      usd: quote.price,
      coin: coin.symbol,
      price: quote.price,
      change24h: quote.percent_change_24h || 0,
      marketCap: quote.market_cap || 0,
      volume24h: quote.volume_24h || 0,
      timestamp: new Date(quote.last_updated).getTime(),
    };
  } catch (error) {
    console.error('Error fetching coin price:', error);
    return null;
  }
};

export const useCoinMarketCapPolling = ({
  coinId,
  poolId,
  liveInterval = '1m', // Default to 1 minute for Free tier
}: UseCoinGeckoWebSocketProps): UseCoinGeckoWebSocketReturn => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [price, setPrice] = useState<ExtendedPriceData | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [ohlcv, setOhlcv] = useState<OHLCData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Start polling
    setIsConnected(true);

    // Free tier updates data every 1 minute, so minimum poll interval is 60 seconds
    // Convert '1s' to '1m' to avoid exceeding rate limits on Free tier
    const effectiveInterval = liveInterval === '1s' ? '1m' : liveInterval;
    const pollInterval = effectiveInterval === '1m' ? 60000 : 60000; // Always 60 seconds for Free tier

    const fetchData = async () => {
      const priceData = await fetchCoinPrice(coinId);
      if (priceData) {
        setPrice(priceData);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    intervalRef.current = setInterval(fetchData, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsConnected(false);
    };
  }, [coinId, liveInterval]);

  // Note: Trades and OHLCV are not available through polling in CMC free API
  // These would need separate endpoints or be disabled
  useEffect(() => {
    setTrades([]);
    setOhlcv(null);
  }, [coinId, poolId]);

  return {
    price,
    trades,
    ohlcv,
    isConnected,
  };
};
