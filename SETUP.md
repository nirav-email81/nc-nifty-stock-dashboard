# NC Nifty Stock Dashboard — Beginner's Setup Guide

## What is this?

A real-time stock dashboard that shows live prices for Nifty indices and all Nifty 500 constituent stocks with fundamentals (PE, PB, EPS, etc.).

## Step 1: Download from GitHub

1. Make sure you have Git installed: https://git-scm.com/downloads
2. Open **Command Prompt** or **PowerShell**
3. Run:
   ```
   git clone https://github.com/nirav-email81/nc-nifty-stock-dashboard.git
   cd nc-nifty-stock-dashboard
   ```

## Step 2: Install Required Software

### Python (for the backend)
1. Go to https://www.python.org/downloads/
2. Download Python **3.10 or later**
3. During installation, **check "Add Python to PATH"**
4. Verify: Open a new terminal and run `python --version`

### Node.js (for the frontend)
1. Go to https://nodejs.org/
2. Download the **LTS** version (18.x or 20.x)
3. Install with default options
4. Verify: Open a new terminal and run `node --version` and `npm --version`

## Step 3: Start the Backend

This is the server that fetches stock data from the internet.

```
cd backend
python -m pip install -r requirements.txt
python app.py
```

**Expected output (after ~15-30 seconds):**
```
[bg] Fetching indices...
[bg] Batch fetching prices for 304 stocks...
[bg] Fetching fundamentals for 304 stocks...
[bg] Refresh complete: 304 stocks
```

Leave this terminal window **open** — the backend must keep running.

## Step 4: Start the Frontend (in a NEW terminal)

Open a **second** terminal window.

```
cd frontend
npm install
npm run dev
```

**Expected output:**
```
VITE v5.4.21  ready in 2s
➜  Local:   http://localhost:5173/
```

## Step 5: Open the Dashboard

- Open your web browser
- Go to: **http://localhost:5173**
- You should see:
  - 5 index cards at the top (Gift Nifty, Nifty 50, etc.)
  - A table of stocks with prices, PE ratios, and more
  - Filter buttons (Nifty 50, Next 50, Midcap, Smallcap)
  - A search box to find stocks by name

## How to Use

| Feature | How to use |
|---|---|
| **View stocks** | Scroll through the table |
| **Filter by index** | Click "Nifty 50", "Nifty Midcap", etc. |
| **Search** | Type a stock name or symbol in the search box |
| **Sort** | Click any column header (Price, PE, etc.) |
| **Dark mode** | Click the sun/moon icon in the top-right |
| **Auto-refresh** | Data updates every 10 minutes automatically |

## Troubleshooting

### "No module named flask"
Run: `python -m pip install flask flask-cors yfinance pandas requests`

### "npm not recognized"
Install Node.js from https://nodejs.org/ and restart your terminal.

### Dashboard shows no data
1. Make sure the backend terminal is still running
2. Check port 5000 isn't blocked by a firewall
3. Wait ~30 seconds for the first data fetch to complete

### "Address already in use" on port 5000
Another program is using port 5000. Close it or change the port in `backend/app.py`.

## Files Explained

| File | Purpose |
|---|---|
| `backend/app.py` | The Python server that fetches and serves stock data |
| `backend/nifty_utils.py` | Stock data fetching logic (NSE + yfinance) |
| `frontend/src/App.jsx` | Main dashboard page |
| `frontend/src/components/IndexCards.jsx` | The 5 index price cards |
| `frontend/src/components/StockTable.jsx` | The filterable stock table |
| `DESIGN.md` | Technical design document |
| `TEST.md` | How to test the application |
