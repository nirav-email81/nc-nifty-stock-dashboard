import requests, yfinance as yf

# Test metals.live API
r = requests.get("https://api.metals.live/v1/spot/gold", timeout=10)
print(f"metals.live: {r.status_code}")
if r.status_code == 200:
    data = r.json()
    print(f"Gold spot data: {data[:200] if isinstance(data, list) else data}")

# Check alternative endpoints
r2 = requests.get("https://api.metals.live/v1/spot/gold/usd", timeout=10)
print(f"\n/usd: {r2.status_code}")
if r2.status_code == 200:
    print(r2.text[:200])

# Try goldpriceindia scraping
r3 = requests.get("https://www.goldpriceindia.com/", timeout=10, headers={
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
})
print(f"\ngoldpriceindia: {r3.status_code}")
if r3.status_code == 200:
    # Check for Hyderabad price
    if "Hyderabad" in r3.text:
        print("Found Hyderabad reference")
    print(r3.text[:1000])
