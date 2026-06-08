import yfinance as yf

gc = yf.Ticker("GC=F")
data = gc.history(period="2d")
print("GC=F Close:", data["Close"].tolist() if not data.empty else "empty")

usdinr = yf.Ticker("USDINR=X")
data2 = usdinr.history(period="2d")
print("USDINR Close:", data2["Close"].tolist() if not data2.empty else "empty")

for sym in ["GOLDBEES.NS", "HDFCGOLD.NS"]:
    try:
        t = yf.Ticker(sym)
        d = t.history(period="2d")
        if not d.empty:
            print(f"{sym}: {d['Close'].tolist()}")
    except Exception as e:
        print(f"{sym}: {e}")
