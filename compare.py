import urllib.request
import difflib

url = "https://raw.githubusercontent.com/lvwmwm/vendettian-plugins/refs/heads/main/plugins/BringBackTenor/src/index.tsx"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        code1 = response.read().decode('utf-8')
except Exception as e:
    print(f"Error fetching URL: {e}")
    exit(1)

with open('plugins/next-utils/src/patches/TenorGifs.tsx', 'r') as f:
    code2 = f.read()

similarity = difflib.SequenceMatcher(None, code1, code2).ratio()
print(f"Similarity: {similarity * 100:.2f}%")
