import yfinance as yf
import pandas as pd
import requests
import csv
import time
from io import StringIO

CSV_URLS = {
    "Nifty 50": "https://archives.nseindia.com/content/indices/ind_nifty50list.csv",
    "Nifty Next 50": "https://archives.nseindia.com/content/indices/ind_niftynext50list.csv",
    "Nifty Midcap": "https://archives.nseindia.com/content/indices/ind_niftymidcap100list.csv",
    "Nifty Smallcap": "https://archives.nseindia.com/content/indices/ind_niftysmallcap100list.csv",
}

INDEX_INFO = {
    "Gift Nifty": {"yfinance": None, "nse_api": True},
    "Nifty 50": {"yfinance": "^NSEI"},
    "Nifty Next 50": {"yfinance": "^NSMIDCP"},
    "Nifty Midcap 100": {"yfinance": "NIFTY_MIDCAP_100.NS"},
    "Nifty Smallcap 100": {"yfinance": "^CNXSC"},
}

_nse_session = None

def _get_nse_session():
    global _nse_session
    if _nse_session is None:
        _nse_session = requests.Session()
        _nse_session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "text/html,application/json,*/*",
        })
        _nse_session.get("https://www.nseindia.com", timeout=10)
    return _nse_session

def get_gift_nifty():
    try:
        session = _get_nse_session()
        resp = session.get("https://www.nseindia.com/api/marketStatus", timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            gn = data.get("giftnifty", {})
            if gn and "LASTPRICE" in gn:
                price = float(gn["LASTPRICE"])
                change = float(gn.get("DAYCHANGE", 0))
                perchange = float(gn.get("PERCHANGE", 0))
                return {"price": price, "change": change, "changePercent": perchange}
        return None
    except Exception:
        return None

def fetch_csv_symbols(url):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    resp = requests.get(url, headers=headers, timeout=15)
    resp.raise_for_status()
    reader = csv.DictReader(StringIO(resp.text))
    return [row["Symbol"] for row in reader]

SECURITIES_CSV = "https://archives.nseindia.com/content/equities/EQUITY_L.csv"

def fetch_face_value_map():
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        resp = requests.get(SECURITIES_CSV, headers=headers, timeout=15)
        resp.raise_for_status()
        content = resp.text
        reader = csv.DictReader(StringIO(content))
        reader.fieldnames = [name.strip() for name in reader.fieldnames]
        face_map = {}
        for row in reader:
            sym = row.get("SYMBOL", "").strip()
            fv = row.get("FACE VALUE", "").strip()
            if sym and fv:
                try:
                    face_map[sym] = float(fv)
                except ValueError:
                    pass
        return face_map
    except Exception:
        return {}

def get_all_stocks():
    stocks = {}
    for bucket_name, url in CSV_URLS.items():
        try:
            symbols = fetch_csv_symbols(url)
            stocks[bucket_name] = [{"symbol": s} for s in symbols]
        except Exception:
            stocks[bucket_name] = []
    return stocks

def build_stock_list():
    buckets = get_all_stocks()
    bucket_map = {}
    for bucket_name, sym_list in buckets.items():
        for s in sym_list:
            bucket_map[s["symbol"]] = bucket_name
    all_symbols = sorted(bucket_map.keys())
    result = []
    for sym in all_symbols:
        result.append({"symbol": sym, "name": "", "bucket": bucket_map.get(sym, "Nifty 500")})
    return result

def get_index_prices():
    results = {}
    for name, info in INDEX_INFO.items():
        sym = info["yfinance"]
        if not sym and info.get("nse_api"):
            gift = get_gift_nifty()
            results[name] = gift or {"price": None, "change": None, "changePercent": None}
            continue
        if not sym:
            results[name] = {"price": None, "change": None, "changePercent": None}
            continue
        try:
            ticker = yf.Ticker(sym)
            data = ticker.history(period="2d")
            if len(data) >= 2:
                close_today = float(data["Close"].iloc[-1])
                close_yesterday = float(data["Close"].iloc[-2])
                change = close_today - close_yesterday
                pct = (change / close_yesterday) * 100
                results[name] = {"price": round(close_today, 2), "change": round(change, 2), "changePercent": round(pct, 2)}
            elif len(data) == 1:
                results[name] = {"price": round(float(data["Close"].iloc[-1]), 2), "change": 0, "changePercent": 0}
            else:
                results[name] = {"price": None, "change": None, "changePercent": None}
        except Exception:
            results[name] = {"price": None, "change": None, "changePercent": None}
        time.sleep(0.3)
    return results

def fetch_all_prices(symbols, batch_size=50):
    yf_symbols = [f"{s}.NS" for s in symbols]
    results = {}
    for i in range(0, len(yf_symbols), batch_size):
        batch = yf_symbols[i:i + batch_size]
        try:
            data = yf.download(batch, period="2d", group_by="ticker", progress=False, auto_adjust=True)
            if data.empty or not isinstance(data.columns, pd.MultiIndex):
                continue
            tickers_in_data = data.columns.get_level_values(0).unique()
            for yfsym in batch:
                sym = yfsym.replace(".NS", "")
                if yfsym not in tickers_in_data:
                    continue
                close = data[yfsym]["Close"]
                high = data[yfsym]["High"]
                low = data[yfsym]["Low"]
                if not close.empty and not pd.isna(close.iloc[-1]):
                    entry = {
                        "currentPrice": round(float(close.iloc[-1]), 2),
                        "dayHigh": round(float(high.iloc[-1]), 2) if not high.empty and not pd.isna(high.iloc[-1]) else None,
                        "dayLow": round(float(low.iloc[-1]), 2) if not low.empty and not pd.isna(low.iloc[-1]) else None,
                    }
                    results[sym] = entry
        except Exception:
            pass
        time.sleep(0.5)
    return results

def fetch_fundamentals(symbols):
    results = {}
    for sym in symbols:
        try:
            ticker = yf.Ticker(f"{sym}.NS")
            info = ticker.info
            results[sym] = {
                "week52High": info.get("fiftyTwoWeekHigh"),
                "week52Low": info.get("fiftyTwoWeekLow"),
                "eps": info.get("trailingEps") or info.get("forwardEps"),
                "dividendYield": info.get("dividendYield"),
                "peRatio": info.get("trailingPE") or info.get("forwardPE"),
                "pbRatio": info.get("priceToBook"),
                "name": info.get("longName") or info.get("shortName") or sym,
            }
            if results[sym]["dividendYield"] is not None:
                results[sym]["dividendYield"] = round(float(results[sym]["dividendYield"]), 2)
            for key in ["week52High", "week52Low", "eps", "peRatio", "pbRatio"]:
                if results[sym].get(key) is not None:
                    results[sym][key] = round(float(results[sym][key]), 2)
        except Exception:
            results[sym] = {"name": sym}
        time.sleep(0.3)
    return results

def merge_stock_data(price_data, fund_data, bucket_map, face_value_map=None):
    stocks = []
    for sym in sorted(bucket_map.keys()):
        p = price_data.get(sym, {})
        f = fund_data.get(sym, {})
        face_val = face_value_map.get(sym) if face_value_map else None
        stocks.append({
            "symbol": sym,
            "name": f.get("name", sym),
            "bucket": bucket_map.get(sym, "Nifty 500"),
            "currentPrice": p.get("currentPrice"),
            "dayHigh": p.get("dayHigh"),
            "dayLow": p.get("dayLow"),
            "week52High": f.get("week52High"),
            "week52Low": f.get("week52Low"),
            "eps": f.get("eps"),
            "dividendYield": f.get("dividendYield"),
            "peRatio": f.get("peRatio"),
            "pbRatio": f.get("pbRatio"),
            "faceValue": face_val,
        })
    return stocks
