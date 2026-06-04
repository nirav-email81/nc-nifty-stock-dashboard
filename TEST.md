# NC Nifty Stock Dashboard — Test Document

## 1. Prerequisites
- Python 3.x with pip
- Node.js 18+ with npm
- Internet connection (for NSE and Yahoo Finance APIs)

## 2. Setup & Launch

### Backend
```bash
cd NC-Nifty-Dashboard/backend
pip install -r requirements.txt
python app.py
# Server starts at http://localhost:5000
```

### Frontend
```bash
cd NC-Nifty-Dashboard/frontend
npm install
npm run dev
# Dev server starts at http://localhost:5173
```

## 3. Test Cases

### 3.1 Backend API Tests

#### TC-01: Index Prices Endpoint
- **Action**: `GET /api/indices`
- **Expected**: JSON with 5 index entries (Gift Nifty, Nifty 50, Next 50, Midcap 100, Nifty SML 100)
- **Validation**: Each entry has `price`, `change`, `changePercent` fields
- **Status**: ✅

#### TC-02: Stocks Endpoint — All Stocks
- **Action**: `GET /api/stocks`
- **Expected**: Array of ~304 stock objects
- **Validation**: Each has `symbol`, `bucket`, `currentPrice`, `peRatio`, etc.
- **Status**: ✅

#### TC-03: Stocks Endpoint — Filter by Bucket
- **Action**: `GET /api/stocks?bucket=Nifty%2050`
- **Expected**: 50 stocks, all with `bucket: "Nifty 50"`
- **Status**: ✅

#### TC-04: Stocks Endpoint — Text Search
- **Action**: `GET /api/stocks?search=RELIANCE`
- **Expected**: Only RELIANCE stock returned
- **Status**: ✅

#### TC-05: CORS Headers
- **Action**: Check response headers
- **Expected**: `Access-Control-Allow-Origin: *` present
- **Status**: ✅

### 3.2 Frontend Tests

#### TC-06: Index Cards Display
- **Action**: Open `http://localhost:5173`
- **Expected**: 5 index cards visible at top with prices and change %
- **Status**: ✅

#### TC-07: Stock Table Load
- **Action**: Wait for Nifty 50 stocks to load
- **Expected**: Table shows symbol, price, face value, day range, 52-week range, fundamentals
- **Status**: ✅

#### TC-08: Filter by Bucket
- **Action**: Click "Nifty 50" / "Nifty Midcap" filter buttons
- **Expected**: Table filters to show only stocks in that index
- **Status**: ✅

#### TC-09: Text Search
- **Action**: Type "INFY" in search box
- **Expected**: Table filters to show only INFOSYS/INFY
- **Status**: ✅

#### TC-10: Column Sorting
- **Action**: Click column headers (Price, PE, Face Value, Div%, etc.)
- **Expected**: Table sorts ascending/descending, sort indicator shown
- **Status**: ✅

#### TC-11: Dark Mode Toggle
- **Action**: Click moon/sun icon in header
- **Expected**: Page theme toggles between light and dark
- **Status**: ✅

#### TC-12: Live Header Clock
- **Action**: Observe top-right corner of header
- **Expected**: Live timestamp (date + time) displayed, updating every second
- **Status**: ✅

#### TC-13: Face Value Column
- **Action**: Scroll stock table horizontally
- **Expected**: "Face Value" column visible after Price, showing integer values (e.g. ₹10, ₹5, ₹1)
- **Status**: ✅

#### TC-14: Add to Favourites
- **Action**: Click the ☆ (hollow star) on any stock row
- **Expected**: Star fills (★), stock appears in green "Favourites" section at top of table
- **Status**: ✅

#### TC-15: Remove from Favourites
- **Action**: Click the ★ (filled star) on a favourite stock
- **Expected**: Star returns to ☆, stock removed from Favourites section
- **Status**: ✅

#### TC-16: Favourites Max 3 with FIFO
- **Action**: Star 4 different stocks
- **Expected**: Only 3 favourites shown; the 1st starred stock is automatically evicted
- **Status**: ✅

#### TC-17: Favourites Persistence
- **Action**: Star a stock, then refresh the page (F5)
- **Expected**: Starred stock remains in Favourites section after reload
- **Status**: ✅

#### TC-18: 1Y Momentum Bar
- **Action**: Observe rightmost column "1Y Momentum"
- **Expected**: Each row shows a filled range bar from 52W Low to 52W High with a colored fill (green/amber/red) proportional to current price position, plus percentage label
- **Status**: ✅

#### TC-19: Symbol Tooltip
- **Action**: Hover mouse over any stock symbol
- **Expected**: Native browser tooltip shows the full company name
- **Status**: ✅

#### TC-20: Vertical Column Separator
- **Action**: Examine column headers and rows between Day Low and 52W High
- **Expected**: A vertical 2px line separates the Day High/Low group from the 52W High/Low group
- **Status**: ✅

#### TC-21: Responsive Layout
- **Action**: Resize browser window
- **Expected**: Cards reflow (5→3→2 columns), table scrolls horizontally
- **Status**: ✅

## 4. Known Issues / Limitations
- **Yahoo Finance rate limiting**: Fetching all 304 stocks may take 90-120s on first load due to API rate limits. Subsequent refreshes use a fresh cache.
- **Gift Nifty data**: Fetched from NSE Market Status API (may not work during non-market hours for some values, but last price is generally available).
- **Market hours**: Most up-to-date data available when Indian markets are open (Mon-Fri 9:15 AM - 3:30 PM IST).
- **NSE Archive CSVs**: Constituent lists are semi-static; NSE updates them quarterly. They may not reflect intra-quarter changes.
- **Face Value source**: Fetched from NSE Securities CSV (`EQUITY_L.csv`); covers all NSE-listed stocks, refreshed every 10 minutes alongside other data.

## 5. Browser Compatibility
- Chrome 90+ ✅
- Firefox 90+ ✅
- Edge 90+ ✅
- Safari 15+ ✅
