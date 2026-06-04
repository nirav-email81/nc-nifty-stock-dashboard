# NC Nifty Stock Dashboard — Design Document

## 1. Overview

A real-time stock dashboard that displays Nifty index data and constituent stock details. The application fetches live data from NSE India and Yahoo Finance, providing filtering, sorting, and dark mode capabilities.

## 2. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)               │
│  ┌───────────┐  ┌───────────────┐  ┌──────────────────┐ │
│  │IndexCards  │  │  StockTable    │  │  Dark Mode       │ │
│  │(5 indices) │  │  (filterable,  │  │  Toggle          │ │
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
| Constituents | NSE Archive CSVs | Nifty 50/Next 50/Midcap/Smallcap lists |

## 4. Data Sources

### 4.1 Nifty Index Constituents
- **Source**: NSE India archive CSV files
  - `https://archives.nseindia.com/content/indices/ind_nifty50list.csv`
  - `https://archives.nseindia.com/content/indices/ind_niftynext50list.csv`
  - `https://archives.nseindia.com/content/indices/ind_niftymidcap100list.csv`
  - `https://archives.nseindia.com/content/indices/ind_niftysmallcap100list.csv`
- **Total coverage**: 304 stocks (50 + 54 + 100 + 100)

### 4.2 Index Live Prices

| Index | yfinance Symbol | Notes |
|---|---|---|
| Nifty 50 | `^NSEI` | |
| Nifty Next 50 | `^NSMIDCP` | Yahoo labels as NIFTY NEXT 50 |
| Nifty Midcap 100 | `NIFTY_MIDCAP_100.NS` | |
| Nifty Smallcap 100 | `^CNXSC` | |
| Gift Nifty | NSE Market Status API | Fetched from `nseindia.com/api/marketStatus` |

### 4.3 Stock-Level Data
- **Source**: yfinance (Yahoo Finance)
- **Fields**: currentPrice, dayHigh, dayLow, fiftyTwoWeekHigh, fiftyTwoWeekLow, trailingEps, dividendYield, trailingPE, priceToBook

## 5. API Endpoints

| Endpoint | Method | Parameters | Returns |
|---|---|---|---|
| `/api/indices` | GET | — | Live prices for all 5 indices |
| `/api/stocks` | GET | `bucket` (optional), `search` (optional) | Stock list with all fields, filterable |

## 6. Frontend Components

### 6.1 IndexCards
- Displays 5 index cards in a responsive grid
- Each card shows: name, current price, absolute change, percentage change
- Color-coded green (positive) / red (negative)

### 6.2 StockTable
- **Filters**: Index bucket selector (All / Nifty 50 / Next 50 / Midcap / Smallcap), text search (by symbol or name)
- **Sorting**: Click any column header to sort ascending/descending
- **Columns**: Symbol, Index bucket, Price, Day High, Day Low, 52W High, 52W Low, EPS, Div%, P/E, P/B
- Bucket tags are color-coded: blue (Nifty 50), purple (Next 50), amber (Midcap), green (Smallcap)

### 6.3 Dark Mode
- Toggle button in the header
- Respects system preference on first load
- Uses CSS custom properties for theming

## 7. Performance
- In-memory cache with 120s TTL for stock data
- 30s TTL for index prices
- Concurrent fetching with 3 worker threads
- Random delays (300-800ms) between yfinance requests to avoid rate limiting

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
└── README.md                 # Project overview
```
