<div align="center">
  <br />
  <h1>CryptoPulse</h1>
  <br />

  <div>
<img src="https://img.shields.io/badge/-Next.js-black?style=for-the-badge&logo=Next.js&logoColor=white" />
<img src="https://img.shields.io/badge/-Typescript-3178C6?style=for-the-badge&logo=Typescript&logoColor=white" />
<img src="https://img.shields.io/badge/-Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/-shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" />
<img src="https://img.shields.io/badge/-CoinMarketCap-171B26?style=for-the-badge&logo=coinmarketcap&logoColor=white" />
<img src="https://img.shields.io/badge/-CoinGecko-06D6A0?style=for-the-badge&logo=coingecko&logoColor=white" />
  </div>

  <h3 align="center">CryptoPulse — Analytics Dashboard</h3>

   <div align="center">
     CryptoPulse — Analytics Dashboard by <b>YappiX / Renat Usmanoff</b>
    </div>
</div>

## 📋 <a name="table">Table of Contents</a>

1. ✨ [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🏗️ [Architecture](#architecture)
5. 🤸 [Quick Start](#quick-start)
6. 🔗 [Links](#links)
7. 🚀 [More](#more)

## 🚨 About

This repository contains a cryptocurrency analytics dashboard built with Next.js and CoinMarketCap API integration by **YappiX / Renat Usmanoff**.

A high-performance platform for tracking crypto markets with real-time data, interactive charts, and comprehensive market analysis.

## <a name="introduction">✨ Introduction</a>

CryptoPulse is a high-performance cryptocurrency analytics dashboard built with Next.js 16, TypeScript, TailwindCSS v4, and shadcn/ui. The platform delivers real-time market intelligence using **CoinMarketCap API** as the primary data source, with intelligent fallback mechanisms to **Binance** and **CoinGecko Public API** for historical OHLCV data when needed.

**Key Highlights:**
- ⚡ Real-time price tracking with polling mechanism (60-second intervals)
- 📊 Interactive TradingView Lightweight Charts for OHLCV visualization
- 🔄 Smart fallback chain: CoinMarketCap → Binance → CoinGecko
- 🎯 Optimized for CoinMarketCap Hobbyist Plan ($35/month)
- 📱 Responsive design with modern UI components
- 🚀 Server-side rendering with Next.js 16 App Router

## <a name="tech-stack">⚙️ Tech Stack</a>

- **[Next.js](https://nextjs.org)** is a powerful React framework for building full-stack web applications. It simplifies development with features like server-side rendering, static site generation, and API routes, enabling developers to focus on building products and shipping quickly.

- **[TypeScript](https://www.typescriptlang.org/)** is a superset of JavaScript that adds static typing, providing better tooling, code quality, and error detection for developers. It is ideal for building large-scale applications and enhances the development experience.

- **[Tailwind CSS](https://tailwindcss.com/)** is a utility-first CSS framework that allows developers to rapidly build modern websites by composing styles directly in their HTML markup, which facilitates highly customized designs and ensures the smallest possible production CSS bundles.

- **[Shadcn/ui](https://ui.shadcn.com/docs)** is a collection of beautifully-designed, accessible React components that you copy and paste directly into your project (it is not a traditional npm library), giving you full source code ownership and total customization control to build your own design system often utilizing Tailwind CSS.

- **[CoinMarketCap API](https://coinmarketcap.com/api/)** is the primary data source for this project. The implementation is optimized for the Hobbyist Plan ($35/month), supporting 30 requests/minute and 110,000 monthly credits. It provides real-time prices, market cap, volume, and comprehensive market data.

- **[CoinGecko Public API](https://www.coingecko.com/en/api)** serves as a fallback source for historical OHLCV data when CoinMarketCap's OHLCV endpoint is unavailable on lower-tier plans. It's free, requires no API key, and provides reliable historical price data.

- **[Binance Public API](https://binance-docs.github.io/apidocs/)** is used as an intermediate fallback for OHLCV data, though it may be unavailable in certain geographic regions (error 451).

- **[TradingView](https://www.tradingview.com/lightweight-charts/)** is a high-performance financial visualization library that provides interactive charting capabilities for rendering complex OHLCV data. It enables the integration of responsive candlestick charts and technical indicators, allowing users to perform professional-grade technical analysis with low-latency updates and surgical precision.

## <a name="features">🔋 Features</a>

### Core Functionality

👉 **Home Dashboard**
- Real-time market overview with global statistics
- Trending coins list (sorted by 24h price change)
- Top categories with market analysis
- All data powered by CoinMarketCap API

👉 **Token Discovery Page** (`/coins`)
- Comprehensive, paginated table of all cryptocurrencies
- Sortable columns: Price, 24h Change, Market Cap Rank
- Real-time data from `/v1/cryptocurrency/listings/latest`
- Optimized pagination for efficient browsing

👉 **Detailed Token Pages** (`/coins/[id]`)
- Complete token information: price, market cap, volume
- Real-time price updates via polling (60-second intervals)
- Market cap rank, circulating supply, and more
- Data from `/v1/cryptocurrency/quotes/latest` and `/v1/cryptocurrency/info`

👉 **Interactive TradingView Charts**
- Multi-timeframe candlestick charts (1D, 1W, 1M, 3M, 6M, 1Y)
- Historical OHLCV data visualization
- **Smart Fallback Chain**: 
  - Primary: CoinMarketCap `/v2/cryptocurrency/ohlcv/historical` (if available)
  - Fallback 1: Binance Public API (if not geo-restricted)
  - Fallback 2: CoinGecko Public API (always available)

👉 **Currency Converter**
- Instant conversion between cryptocurrencies
- Support for multiple fiat and crypto currencies
- Real-time exchange rates from CoinMarketCap

### Technical Features

- ✅ **Server-Side Rendering** with Next.js 16 App Router
- ✅ **Type-Safe** with TypeScript
- ✅ **Responsive Design** with TailwindCSS
- ✅ **API Rate Limiting** optimized for Hobbyist Plan
- ✅ **Error Handling** with comprehensive fallbacks
- ✅ **Caching Strategy** (3 min for CoinMarketCap, 1 min for fallbacks)

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en)
- [npm](https://www.npmjs.com/) (Node Package Manager)

**Cloning the Repository**

```bash
git clone https://github.com/usmanoffcom/coinpulse.git
cd coinpulse
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Create a new file named `.env` in the root of your project and add the following content:

```env
# CoinMarketCap API (Required - Primary Data Source)
COINMARKETCAP_BASE_URL=https://pro-api.coinmarketcap.com
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key_here

# CoinGecko API (Optional - Only used if you want CoinGecko Pro API as additional fallback)
COINGECKO_BASE_URL=https://pro-api.coingecko.com/api/v3
COINGECKO_API_KEY=

# Next.js Public Variables (Optional - Not currently used, kept for compatibility)
NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL=
NEXT_PUBLIC_COINGECKO_API_KEY=
```

**Required:** `COINMARKETCAP_API_KEY` - Get your API key by signing up at [CoinMarketCap API](https://coinmarketcap.com/api/). The project is optimized for **Hobbyist Plan** ($35/month), but will work with any plan tier.

**Note:** CoinGecko variables are optional. The project uses CoinGecko **Public API** (free, no API key required) as a fallback for OHLCV data when CoinMarketCap's historical endpoint is unavailable.

**Running the Project**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.

## <a name="architecture">🏗️ Architecture</a>

### API Integration Strategy

The project uses a **multi-tier fallback system** to ensure data availability:

1. **Primary**: CoinMarketCap API (Hobbyist Plan)
   - Real-time prices, market data, listings
   - Rate limit: 30 requests/minute
   - Cache: 3 minutes

2. **Fallback for OHLCV**: Binance Public API → CoinGecko Public API
   - Used when CoinMarketCap OHLCV endpoint unavailable (403 error)
   - Binance may be geo-restricted (451 error)
   - CoinGecko Public API is always available (free, no API key)

### Project Structure

```
coinpulse/
├── app/                      # Next.js 16 App Router
│   ├── api/                  # API routes
│   │   └── coinmarketcap/    # Proxy routes for client-side requests
│   ├── coins/                # Coin listing and detail pages
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── CandlestickChart.tsx  # TradingView chart wrapper
│   ├── LiveDataWrapper.tsx   # Live data container
│   └── home/                 # Home page components
├── lib/                      # Utilities and API clients
│   └── coinmarketcap.actions.ts  # All CoinMarketCap API calls
├── hooks/                    # React hooks
│   └── useCoinMarketCapPolling.ts  # Polling hook for live data
└── .env                      # Environment variables
```

## <a name="links">🔗 Links</a>

- **Website**: [yappix.studio](https://yappix.studio)
- **GitHub Repository**: [github.com/usmanoffcom/coinpulse](https://github.com/usmanoffcom/coinpulse)
- **Author**: YappiX / Renat Usmanoff

## <a name="more">🚀 More</a>

**Built with ❤️ by YappiX / Renat Usmanoff**

This project demonstrates modern web development practices using Next.js 16, TypeScript, and intelligent API integration with fallback mechanisms for maximum reliability.

Visit [yappix.studio](https://yappix.studio) for more projects and services.
