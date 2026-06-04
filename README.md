# NC Nifty Stock Dashboard

Real-time stock dashboard for Nifty 50, Nifty Next 50, Nifty Midcap 100, and Nifty SML 100 indices.

## Features
- Live index prices: Gift Nifty, Nifty 50, Next 50, Midcap 100, Nifty SML 100
- Stock table with 304 Nifty stocks, filterable by index bucket (Nifty 50 / Next 50 / Midcap / SML) and searchable by name/symbol
- Sortable columns: Price, Face Value, Day High/Low, 52W High/Low, EPS, Div%, P/E, P/B, 1Y Momentum
- **1Y Momentum** — filled range bar showing current price position within 52-week range with percentage
- **Favourites**: up to 3 starred stocks pinned to top, persistence via localStorage
- **Symbol tooltip**: hover for full company name
- Live header clock with date and time
- Dark mode toggle
- Responsive design

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Tech Stack
- Backend: Python Flask, yfinance, NSE India APIs
- Frontend: React 18, Vite 5, Tailwind CSS 4
