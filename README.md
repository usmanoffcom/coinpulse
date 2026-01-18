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
4. 🤸 [Quick Start](#quick-start)
5. 🔗 [Assets](#links)
6. 🚀 [More](#more)

## 🚨 About

This repository contains a cryptocurrency analytics dashboard built with Next.js and CoinMarketCap API integration by **YappiX / Renat Usmanoff**.

A high-performance platform for tracking crypto markets with real-time data, interactive charts, and comprehensive market analysis.

## <a name="introduction">✨ Introduction</a>

CryptoPulse is a high-performance analytics dashboard built with Next.js 16, TailwindCSS v4, and shadcn/ui, delivering real-time market intelligence via CoinMarketCap API with CoinGecko fallback for historical data. It features real-time price tracking, interactive TradingView candlestick charts to visualize OHLCV data, and comprehensive market analysis. From a dynamic homepage showcasing global stats and trending assets to robust token pages with multi-fiat converters and advanced search tables, the platform provides a modular, developer-friendly stack optimized for speed and clarity.

## <a name="tech-stack">⚙️ Tech Stack</a>

- **[Next.js](https://nextjs.org)** is a powerful React framework for building full-stack web applications. It simplifies development with features like server-side rendering, static site generation, and API routes, enabling developers to focus on building products and shipping quickly.

- **[TypeScript](https://www.typescriptlang.org/)** is a superset of JavaScript that adds static typing, providing better tooling, code quality, and error detection for developers. It is ideal for building large-scale applications and enhances the development experience.

- **[Tailwind CSS](https://tailwindcss.com/)** is a utility-first CSS framework that allows developers to rapidly build modern websites by composing styles directly in their HTML markup, which facilitates highly customized designs and ensures the smallest possible production CSS bundles.

- **[Shadcn/ui](https://ui.shadcn.com/docs)** is a collection of beautifully-designed, accessible React components that you copy and paste directly into your project (it is not a traditional npm library), giving you full source code ownership and total customization control to build your own design system often utilizing Tailwind CSS.

- **[CodeRabbit](https://coderabbit.ai/)** is an AI-powered code review platform that integrates into Git workflows (like GitHub and GitLab) to automatically analyze pull requests, identifying issues ranging from readability concerns to logic bugs and security flaws, and offering one-click fixes to help teams ship high-quality code faster.

- **[CoinMarketCap API](https://coinmarketcap.com/api/)** and **[CoinGecko API](https://www.coingecko.com/en/api)** are comprehensive and reliable RESTful APIs that provide real-time and historical cryptocurrency market data, including prices, market capitalization, volume, and exchange information, enabling developers to build crypto tracking, analysis, and portfolio management applications.

- **[TradingView](https://www.tradingview.com/lightweight-charts/)** is a high-performance financial visualization library that provides interactive charting capabilities for rendering complex OHLCV data. It enables the integration of responsive candlestick charts and technical indicators, allowing users to perform professional-grade technical analysis with low-latency updates and surgical precision.

## <a name="features">🔋 Features</a>

👉 **Home Dashboard**: Displays crucial market health indicators like **Total Market Cap** and **BTC & ETH dominance**, alongside a dynamic list of **Trending Tokens**, all retrieved instantly using the CoinMarketCap API.

👉 **Token Discovery Page**: A comprehensive, sortable and searchable table featuring key token metrics (Price, 24h change, Market Cap Rank) for mass market analysis, powered by the CoinMarketCap `/v1/cryptocurrency/listings/latest` REST API and optimized with pagination for efficient browsing.

👉 **Detailed Token Overview**: Provides an immediate summary of any selected token, including its logo, current price, and market cap rank, utilizing the CoinMarketCap `/v1/cryptocurrency/quotes/latest` REST API for core data with polling for continuous, live price monitoring.

👉 **Interactive Candlestick Chart**: Integrates **TradingView Lightweight Charts** to visualize market trends and price action with surgical precision, rendering multi-timeframe OHLCV data fetched from CoinGecko Public API (fallback when CoinMarketCap OHLCV is unavailable).

👉 **Smart Currency Converter**: An interactive tool that allows users to instantly compute coin amounts into dozens of supported fiat and crypto currencies, leveraging real-time exchange rates from CoinMarketCap API.

👉 **Global Search Functionality**: A powerful, unified search bar that allows users to quickly locate any crypto asset by name or symbol, linking directly to the respective Token Detail Page via the CoinMarketCap API.

And many more, including code architecture and reusability.

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
# CoinMarketCap API (Primary)
COINMARKETCAP_BASE_URL=https://pro-api.coinmarketcap.com
COINMARKETCAP_API_KEY=your_api_key_here

# CoinGecko API (Optional - used as fallback for OHLCV data)
COINGECKO_BASE_URL=https://pro-api.coingecko.com/api/v3
COINGECKO_API_KEY=

NEXT_PUBLIC_COINGECKO_WEBSOCKET_URL=
NEXT_PUBLIC_COINGECKO_API_KEY=
```

Replace the placeholder values with your real credentials. You can get these by signing up at: [**CoinMarketCap API**](https://coinmarketcap.com/api/) and [**CoinGecko API**](https://www.coingecko.com/en/api).

**Running the Project**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.

## <a name="links">🔗 Links</a>

- **Website**: [yappix.studio](https://yappix.studio)
- **GitHub**: [github.com/usmanoffcom](https://github.com/usmanoffcom)
- **Author**: YappiX / Renat Usmanoff

## <a name="more">🚀 More</a>

**Built with ❤️ by YappiX / Renat Usmanoff**

This project demonstrates modern web development practices using Next.js, TypeScript, and real-time cryptocurrency market data integration.

Visit [yappix.studio](https://yappix.studio) for more projects and services.
