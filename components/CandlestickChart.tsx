'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import {
  getCandlestickConfig,
  getChartConfig,
  LIVE_INTERVAL_BUTTONS,
  PERIOD_BUTTONS,
  PERIOD_CONFIG,
} from '@/constants';
import { CandlestickSeries, createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import { getCoinOHLCV } from '@/lib/coinmarketcap.actions';
import { convertOHLCData } from '@/lib/utils';

const CandlestickChart = ({
  children,
  data,
  coinId,
  height = 360,
  initialPeriod = 'daily',
  liveOhlcv = null,
  mode = 'historical',
  liveInterval,
  setLiveInterval,
}: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const prevOhlcDataLength = useRef<number>(data?.length || 0);

  const [period, setPeriod] = useState(initialPeriod);
  const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? []);
  const [isPending, startTransition] = useTransition();

  const fetchOHLCData = async (selectedPeriod: Period) => {
    try {
      const { days, interval } = PERIOD_CONFIG[selectedPeriod];

      console.log(`[CandlestickChart] Fetching OHLC data for ${coinId}, period: ${selectedPeriod}, days: ${days}, interval: ${interval}`);
      
      const newData = await getCoinOHLCV(coinId, {
        vs_currency: 'usd',
        days,
        interval,
      });

      console.log(`[CandlestickChart] Received ${Array.isArray(newData) ? newData.length : 1} candles from getCoinOHLCV`);

      startTransition(() => {
        const dataToSet = Array.isArray(newData) ? newData : [newData];
        console.log(`[CandlestickChart] Setting ${dataToSet.length} candles to state`);
        setOhlcData(dataToSet);
      });
    } catch (e) {
      console.error('[CandlestickChart] Failed to fetch OHLCData', e);
    }
  };

  const handlePeriodChange = (newPeriod: Period) => {
    if (newPeriod === period) return;

    setPeriod(newPeriod);
    fetchOHLCData(newPeriod);
  };

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const showTime = ['daily', 'weekly', 'monthly'].includes(period);

    // Ensure container has width before creating chart
    const containerWidth = container.clientWidth || container.offsetWidth || 800;
    
    const chart = createChart(container, {
      ...getChartConfig(height, showTime),
      width: containerWidth,
    });
    const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());

    // Convert milliseconds to seconds for lightweight-charts
    const convertedToSeconds = ohlcData
      .filter((item) => item && item.length >= 5 && item[0] > 0) // Filter invalid data
      .map((item) => {
        // Check if timestamp is in milliseconds (> year 2000 in seconds = 946684800)
        const timestamp = item[0];
        const isMs = timestamp > 946684800000; // Year 2000 in milliseconds
        return [
          isMs ? Math.floor(timestamp / 1000) : timestamp,
          item[1],
          item[2],
          item[3],
          item[4],
        ] as OHLCData;
      });

    const converted = convertOHLCData(convertedToSeconds);
    
    console.log(`[CandlestickChart] Initializing with ${converted.length} candles, raw data: ${ohlcData.length}`, {
      firstCandle: ohlcData[0],
      lastCandle: ohlcData[ohlcData.length - 1],
    });
    
    if (converted.length > 0) {
      series.setData(converted);
      chart.timeScale().fitContent();
    } else {
      console.warn(`[CandlestickChart] No valid data to display for ${coinId}`);
      // Try to fetch data if we don't have any
      if (ohlcData.length === 0 && coinId) {
        console.log(`[CandlestickChart] Attempting to fetch data for ${coinId}`);
        fetchOHLCData(period);
      }
    }

    chartRef.current = chart;
    candleSeriesRef.current = series;

    const observer = new ResizeObserver((entries) => {
      if (!entries.length) return;
      const newWidth = entries[0].contentRect.width;
      if (newWidth > 0) {
        chart.applyOptions({ width: newWidth });
      }
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    };
  }, [height, period]);

  useEffect(() => {
    if (!candleSeriesRef.current) return;
    if (ohlcData.length === 0) return; // Don't update if no data

    // Convert milliseconds to seconds for lightweight-charts
    const convertedToSeconds = ohlcData
      .filter((item) => item && item.length >= 5 && item[0] > 0) // Filter invalid data
      .map((item) => {
        // Check if timestamp is in milliseconds (> year 2000 in seconds = 946684800)
        const timestamp = item[0];
        const isMs = timestamp > 946684800000; // Year 2000 in milliseconds
        return [
          isMs ? Math.floor(timestamp / 1000) : timestamp,
          item[1],
          item[2],
          item[3],
          item[4],
        ] as OHLCData;
      });

    let merged: OHLCData[];

    if (liveOhlcv) {
      const liveTimestamp = liveOhlcv[0];

      const lastHistoricalCandle = convertedToSeconds[convertedToSeconds.length - 1];

      if (lastHistoricalCandle && lastHistoricalCandle[0] === liveTimestamp) {
        merged = [...convertedToSeconds.slice(0, -1), liveOhlcv];
      } else {
        merged = [...convertedToSeconds, liveOhlcv];
      }
    } else {
      merged = convertedToSeconds;
    }

    merged.sort((a, b) => a[0] - b[0]);

    const converted = convertOHLCData(merged);
    
    console.log(`[CandlestickChart] Updating chart with ${converted.length} candles`);
    
    if (converted.length > 0) {
      candleSeriesRef.current.setData(converted);

      const dataChanged = prevOhlcDataLength.current !== ohlcData.length;

      if (dataChanged || mode === 'historical') {
        chartRef.current?.timeScale().fitContent();
        prevOhlcDataLength.current = ohlcData.length;
      }
    }
  }, [ohlcData, period, liveOhlcv, mode]);

  return (
    <div id="candlestick-chart">
      <div className="chart-header">
        <div className="flex-1">{children}</div>

        <div className="button-group">
          <span className="text-sm mx-2 font-medium text-purple-100/50">Period:</span>
          {PERIOD_BUTTONS.map(({ value, label }) => (
            <button
              key={value}
              className={period === value ? 'config-button-active' : 'config-button'}
              onClick={() => handlePeriodChange(value)}
              disabled={isPending}
            >
              {label}
            </button>
          ))}
        </div>

        {liveInterval && (
          <div className="button-group">
            <span className="text-sm mx-2 font-medium text-purple-100/50">Update Frequency:</span>
            {LIVE_INTERVAL_BUTTONS.map(({ value, label }) => (
              <button
                key={value}
                className={liveInterval === value ? 'config-button-active' : 'config-button'}
                onClick={() => setLiveInterval && setLiveInterval(value)}
                disabled={isPending}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={chartContainerRef} className="chart" style={{ height }} />
    </div>
  );
};

export default CandlestickChart;
