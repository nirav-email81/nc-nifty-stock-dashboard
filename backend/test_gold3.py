import yfinance as yf
gc = yf.Ticker("GC=F").history(period="1d")["Close"].iloc[-1]
inr = yf.Ticker("USDINR=X").history(period="1d")["Close"].iloc[-1]
oz_to_g = 31.1035
gold_per_10g = (gc * inr / oz_to_g) * 10
print(f"GC=F: ${gc:.2f}/oz")
print(f"USD/INR: Rs {inr:.2f}")
print(f"24K Gold: Rs {gold_per_10g:.0f}/10g")
