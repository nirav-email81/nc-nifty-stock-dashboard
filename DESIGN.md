# NC Nifty Stock Dashboard — Design Document

## 1. Overview

A real-time stock dashboard that displays Nifty index data, constituent stock details, USD/INR exchange rate, and 24K gold price. The application fetches live data from NSE India, Yahoo Finance, and IBJA, providing filtering, sorting, and dark mode capabilities.

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)               │
│  ┌───────────┐  ┌───────────────┐  ┌──────────────────┐ │
│  │IndexCards  │  │  StockTable    │  │  Dark Mode       │ │
│  │(7 tiles)   │  │  (filterable,  │  │  Toggle          │ │
│  │            │  │   sortable)    │  │                  │ │
│  └───────────┘  └───────┬───────┘  └──────────────────┘ │
│                          │                               │
│                    ┌─────┴─────┐                         │
│                    │  api.js   │                         │
│                    │  (axios)  │                         │
│                    └─────┬─────┘                         │
└──────────────────────────┼──────────────────────────────┘
                           │  HTTP /api/*
                           │
┌──────────────────────────┼──────────────────────────────┐
│                  Flask Backend (Python)                  │
│  ┌───────────────┐  ┌───┴────────┐  ┌────────────────┐ │
│  │  app.py       │  │nifty_utils │  │  In-memory     │ │
│  │  (routes)     │  │(data fetch)│  │  Cache (TTL)   │ │
│  └───────┬───────┘  └────┬───────┘  └────────────────┘ │
│          │               │                              │
│          ├── NSE Archive CSVs (index constituents)      │
│          ├── NSE Market Status API (Gift Nifty)         │
│          └── Yahoo Finance / yfinance (prices, ratios)  │
└─────────────────────────────────────────────────────────┘
```

## 3. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite 5 | UI rendering and dev tooling |
| Styling | Tailwind CSS 4 | Utility-first responsive design |
| HTTP Client | Axios | API calls from frontend |
| Backend | Python Flask 3 | REST API server |
| Stock Data | yfinance | Real-time prices, fundamentals |
| Index Data | NSE India public APIs | Gift Nifty via market status |
| Constituents | NSE Archive CSVs | Nifty 50/Next 50/Midcap/SML lists |
| Gold (24K) | IBJA API (`ibja-api.vercel.app`) | Benchmark 24K gold price per 10g INR |
| Forex | yfinance | USD/INR via `USDINR=X` |

## 4. Data Sources

### 4.1 Nifty Index Constituents
- **Source**: NSE India archive CSV files
  - `https://archives.nseindia.com/content/indices/ind_nifty50list.csv`
  - `https://archives.nseindia.com/content/indices/ind_niftynext50list.csv`
  - `https://archives.nseindia.com/content/indices/ind_niftymidcap100list.csv`
  - `https://archives.nseindia.com/content/indices/ind_niftysmallcap100list.csv`
- **Total coverage**: 304 stocks (50 + 54 + 100 + 100)
- **Bucket labels**: Nifty 50, Nifty Next 50, Nifty Midcap, Nifty SML

### 4.2 Index / Asset Live Prices

| Asset | Symbol / Source | Notes |
|---|---|---|
| Nifty 50 | `^NSEI` (yfinance) | |
| Nifty Next 50 | `^NSMIDCP` (yfinance) | Yahoo labels as NIFTY NEXT 50 |
| Nifty Midcap 100 | `NIFTY_MIDCAP_100.NS` (yfinance) | |
| Nifty SML 100 | `^CNXSC` (yfinance) | |
| Gift Nifty | NSE Market Status API | Fetched from `nseindia.com/api/marketStatus` |
| Gold 24K | IBJA API (`ibja-api.vercel.app/latest`) | 24K (999 purity) per 10g, INR; uses PM rate, falls back to AM |
| USD/INR | `USDINR=X` (yfinance) | Live exchange rate |

### 4.3 Stock-Level Data
- **Sources**:
  - **yfinance (Yahoo Finance)**: currentPrice, dayHigh, dayLow, fiftyTwoWeekHigh, fiftyTwoWeekLow, trailingEps, dividendYield, trailingPE, priceToBook
  - **NSE Securities CSV**: faceValue (from `EQUITY_L.csv`, 2375+ stocks with face values like ₹10, ₹5, ₹2, ₹1)
- **Fields**: currentPrice, dayHigh, dayLow, fiftyTwoWeekHigh, fiftyTwoWeekLow, trailingEps, dividendYield, trailingPE, priceToBook, faceValue

## 5. API Endpoints

| Endpoint | Method | Parameters | Returns |
|---|---|---|---|
| `/api/indices` | GET | — | Live prices for 5 indices + Gold 24K + USD/INR (7 tiles) |
| `/api/stocks` | GET | `bucket` (optional), `search` (optional) | Stock list with all fields, filterable |

## 6. Frontend Components

### 6.1 IndexCards
- Displays 7 tiles in a responsive grid (2→3→4→7 columns)
- Tiles: Gift Nifty, Nifty 50, Next 50, Midcap 100, SML 100, USD/INR, Gold 24K
- Each card shows: name, source label (where applicable), current price, change, change%
- Color-coded green (positive) / red (negative); Gold/USD show price only (no change)
- Gold 24K sourced from IBJA benchmark, USD/INR from Yahoo Finance

### 6.2 StockTable
- **Filters**: Index bucket selector (All / Nifty 50 / Next 50 / Midcap / SML), text search (by symbol or name)
- **Sorting**: Click any column header to sort ascending/descending
- **Columns**: Star (favourite), Symbol, Index, Price, Face Value (split 2-line header), Day High, Day Low, 52W High, 52W Low, EPS, Div%, P/E, P/B, 1Y Momentum
- **1Y Momentum**: Filled range bar showing position within 52W range (low→current→high), color-coded green (near high), amber (mid), red (near low), with percentage label
- **Vertical separator**: 2px line between Day High/Low and 52W High/Low column groups
- **Symbol tooltip**: Hover shows full company name via `title` attribute
- Bucket tags are color-coded: blue (Nifty 50), purple (Next 50), amber (Midcap), green (SML)
- **Favourites**: Up to 3 starred stocks pinned at top regardless of filter/search, FIFO eviction, localStorage persistence

### 6.3 Header Clock
- Live timestamp displayed top-right, left of dark mode toggle
- Updates every second
- Shows date (dd MMM yyyy) and time (HH:MM:SS AM/PM IST)

### 6.4 Dark Mode
- Toggle button in the header
- Respects system preference on first load
- Uses CSS custom properties for theming

## 7. Performance
- Background thread refreshes all data every 600s (10 minutes)
- Batch price fetch via `yfinance.download()` for 6 batches of ~50 stocks (~15s total)
- Individual fundamental fetches via `yfinance.Ticker.info` with 300ms delay between calls (~90s total)
- NSE Securities CSV fetched once per refresh for face values (~3s)
- Gold 24K fetched from IBJA API (~1s), USD/INR from yfinance Ticker (~1s)
- DUMMY prefix entries filtered from NSE CSV imports to avoid failed fetches
- Initial load completes in ~90-120s; subsequent refreshes use a fresh cache
- In-memory cache served immediately to frontend; background thread updates in-place

## 8. Project Structure

```
NC-Nifty-Dashboard/
├── backend/
│   ├── app.py              # Flask API server
│   ├── nifty_utils.py      # Data fetching logic
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx          # Main app with state management
│   │   ├── api.js           # Axios API client
│   │   ├── index.css        # Tailwind + CSS variables
│   │   ├── main.jsx         # React entry point
│   │   └── components/
│   │       ├── IndexCards.jsx  # Index price cards
│   │       └── StockTable.jsx  # Filterable stock table
│   ├── index.html
│   ├── package.json
│   └── vite.config.js       # Vite config with proxy
├── DESIGN.md                 # This document
├── TEST.md                   # Test document
├── SETUP.md                  # Beginner setup guide
├── prompt.txt                # AI generation prompt
└── README.md                 # Project overview
```
