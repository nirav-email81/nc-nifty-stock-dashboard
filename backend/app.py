from flask import Flask, jsonify, request
from flask_cors import CORS
from nifty_utils import (
    get_index_prices, build_stock_list, fetch_all_prices,
    fetch_fundamentals, merge_stock_data, fetch_face_value_map
)
import threading
import time

app = Flask(__name__)
CORS(app)

_data = {
    "indices": {},
    "stocks": [],
    "last_refresh": 0,
    "loading": True,
}
_lock = threading.Lock()

def refresh_data():
    global _data
    try:
        print("[bg] Fetching indices...")
        indices = get_index_prices()

        stock_list = build_stock_list()
        all_symbols = [s["symbol"] for s in stock_list]
        bucket_map = {s["symbol"]: s["bucket"] for s in stock_list}

        print(f"[bg] Fetching face value map...")
        face_value_map = fetch_face_value_map()
        print(f"[bg] Got {len(face_value_map)} face values")

        print(f"[bg] Batch fetching prices for {len(all_symbols)} stocks...")
        prices = fetch_all_prices(all_symbols)

        print(f"[bg] Fetching fundamentals for {len(all_symbols)} stocks...")
        funds = fetch_fundamentals(all_symbols)

        stocks = merge_stock_data(prices, funds, bucket_map, face_value_map)

        with _lock:
            _data["indices"] = indices
            _data["stocks"] = stocks
            _data["last_refresh"] = time.time()
            _data["loading"] = False
        print(f"[bg] Refresh complete: {len(stocks)} stocks")
    except Exception as e:
        print(f"[bg] Error: {e}")

def background_loop():
    refresh_data()
    while True:
        time.sleep(600)
        refresh_data()

@app.route("/api/indices")
def indices():
    with _lock:
        return jsonify(_data["indices"])

@app.route("/api/stocks")
def stocks():
    bucket_filter = request.args.get("bucket", "")
    search = request.args.get("search", "").upper()
    with _lock:
        result = _data["stocks"]
    if bucket_filter:
        result = [s for s in result if s["bucket"] == bucket_filter]
    if search:
        result = [s for s in result if search in s.get("symbol", "").upper() or search in s.get("name", "").upper()]
    return jsonify(result)

@app.route("/api/status")
def status():
    with _lock:
        return jsonify({
            "stock_count": len(_data["stocks"]),
            "last_refresh": _data["last_refresh"],
            "loading": _data["loading"],
        })

if __name__ == "__main__":
    t = threading.Thread(target=background_loop, daemon=True)
    t.start()
    app.run(port=5000, debug=False)
