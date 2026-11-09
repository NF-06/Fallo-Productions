"""
Apply site.config.json to the website.

Run it from the project folder after changing site.config.json:

    python tools/apply-config.py

What it does:
  - index.html: updates the share-preview address (og:url), the share image
    (og:image) and the canonical link (tells Google which address is the real one)
  - CNAME: creates it when siteUrl is your own domain (GitHub Pages reads it to
    know your domain), and deletes it when siteUrl is a github.io address
  - robots.txt + sitemap.xml: help Google find the site

Safe to run as many times as you like.
"""

import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent  # the project folder


def main():
    config = json.loads((ROOT / "site.config.json").read_text(encoding="utf-8"))

    site_url = config["siteUrl"].strip()
    if not site_url.endswith("/"):
        site_url += "/"
    parsed = urlparse(site_url)
    if parsed.scheme != "https" or not parsed.netloc:
        sys.exit(f'siteUrl must be a full address starting with https://, for example "https://fallo.no/". Got: {site_url}')

    host = parsed.netloc.lower()
    share_image = site_url + config.get("shareImage", "images/hero.jpg").lstrip("/")

    # ---------- index.html ----------
    index = ROOT / "index.html"
    raw = index.read_bytes().decode("utf-8")
    newline = "\r\n" if "\r\n" in raw else "\n"
    html = raw

    def set_meta(html, prop, value):
        pattern = rf'(<meta property="{re.escape(prop)}" content=")[^"]*(")'
        if not re.search(pattern, html):
            sys.exit(f'Could not find <meta property="{prop}"> in index.html')
        return re.sub(pattern, rf"\g<1>{value}\g<2>", html)

    html = set_meta(html, "og:url", site_url)
    html = set_meta(html, "og:image", share_image)

    canonical = f'<link rel="canonical" href="{site_url}">'
    if '<link rel="canonical"' in html:
        html = re.sub(r'<link rel="canonical" href="[^"]*">', canonical, html)
    else:
        # put it right after the og:url line
        html = re.sub(r'(<meta property="og:url"[^>]*>)', rf"\g<1>{newline}  {canonical}", html, count=1)

    if html != raw:
        index.write_bytes(html.encode("utf-8"))
        print("index.html: updated share preview + canonical address")
    else:
        print("index.html: already up to date")

    # ---------- CNAME (custom domain for GitHub Pages) ----------
    cname = ROOT / "CNAME"
    if host.endswith("github.io"):
        if cname.exists():
            cname.unlink()
            print("CNAME: removed (site is on github.io)")
    else:
        if parsed.path not in ("", "/"):
            sys.exit("A custom domain must be the whole site, e.g. https://fallo.no/ (no /folder at the end).")
        cname.write_text(host + "\n", encoding="utf-8")
        print(f"CNAME: set to {host}")

    # ---------- robots.txt + sitemap.xml ----------
    base_path = parsed.path or "/"  # "/" on your own domain, "/Fallo-Productions/" on github.io
    (ROOT / "robots.txt").write_text(
        "User-agent: *\n"
        f"Disallow: {base_path}login.html\n"
        f"Disallow: {base_path}inventory.html\n"
        f"Sitemap: {site_url}sitemap.xml\n",
        encoding="utf-8",
    )
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"  <url><loc>{site_url}</loc></url>\n"
        "</urlset>\n",
        encoding="utf-8",
    )
    print("robots.txt + sitemap.xml: written")
    print(f"\nDone. The site is set up for {site_url}")


if __name__ == "__main__":
    main()
