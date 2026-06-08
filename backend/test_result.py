import requests
r = requests.get("http://localhost:5000/api/indices", timeout=5)
data = r.json()
for k, v in data.items():
    print(f"{k}: price={v['price']}, change={v.get('change')}")
print(f"Total: {len(data)} items")
