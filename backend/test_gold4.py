import yfinance as yf

# Try to get spot gold
for ticker in ["GLD", "IAU", "XAUUSD=X"]:
    try:
        t = yf.Ticker(ticker)
        d = t.history(period="1d")
        if not d.empty:
            print(f"{ticker}: ${d['Close'].iloc[-1]:.2f}")
    except Exception as e:
        print(f"{ticker}: error")

# Also try with GC=F more carefully
gc = yf.Ticker("GC=F")
d = gc.history(period="5d")
if not d.empty:
    print(f"\nGC=F history:")
    print(d[["Close"]])
