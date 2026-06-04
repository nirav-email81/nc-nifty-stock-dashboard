# NC Nifty Stock Dashboard

Real-time stock dashboard for Nifty 50, Nifty Next 50, Nifty Midcap 100, and Nifty Smallcap 100 indices.

## Features
- Live index prices: Gift Nifty, Nifty 50, Next 50, Midcap 100, Smallcap 100
- Stock table with 304 Nifty stocks, filterable by index bucket and searchable by name/symbol
- Sortable columns: Price, Day High/Low, 52W High/Low, EPS, Div%, P/E, P/B
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
