"""
Download Squarespace files from SQSP_CustomFiles_APRIL2026.csv
Run from any terminal:  python download_sqsp_files.py
Requires Python 3 — no extra installs needed.
"""

import os
import urllib.request
import urllib.parse

CSV_FILE   = os.path.join(os.path.dirname(os.path.abspath(__file__)), "SQSP_CustomFiles_APRIL2026.csv")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sqsp_downloads")

def get_urls(csv_path):
    urls = []
    seen = set()
    with open(csv_path, encoding="utf-8") as f:
        for line in f:
            # Grab everything from https:// onward
            idx = line.find("https://")
            if idx == -1:
                continue
            url = line[idx:].strip()
            if url and url not in seen:
                seen.add(url)
                urls.append(url)
    return urls

def download(url, dest_dir):
    filename = urllib.parse.unquote(url.split("/")[-1])
    dest     = os.path.join(dest_dir, filename)

    if os.path.exists(dest):
        print(f"  [skip] {filename}")
        return

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as resp:
            total = int(resp.headers.get("Content-Length", 0))
            done  = 0
            with open(dest, "wb") as out:
                while chunk := resp.read(65536):
                    out.write(chunk)
                    done += len(chunk)
                    if total:
                        print(f"\r  {filename}: {done/total*100:.0f}%", end="", flush=True)
        print(f"\r  [done] {filename}" + " " * 30)
    except Exception as e:
        print(f"\r  [fail] {filename}: {e}")

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    urls = get_urls(CSV_FILE)
    print(f"{len(urls)} files → {OUTPUT_DIR}\n")
    for i, url in enumerate(urls, 1):
        print(f"({i}/{len(urls)})", end=" ")
        download(url, OUTPUT_DIR)
    print("\nAll done.")

if __name__ == "__main__":
    main()
