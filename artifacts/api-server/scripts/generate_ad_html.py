#!/usr/bin/env python3
"""
Generate WeasyPrint-native print HTML for a BDE Farm Trac ad.

CLI usage:
  python3 generate_ad_html.py --format horizontal|portrait
                              --out /tmp/xxx/print.html
                              --src-dir /path/to/ad-templates/
                              [--bg-url URL]

- Downloads and base64-embeds Inter + Playfair Display from Google Fonts
- Downloads and base64-embeds the background image
- Extracts logo + QR from the original template HTML in src-dir
- All dimensions in mm (original design was 10 px/mm)
"""
import argparse, base64, re, sys, urllib.request
from pathlib import Path

# ── Google Font URLs (TTF) ────────────────────────────────────────────────────
FONT_URLS = {
    ("Inter", "normal", "400"):
        "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
    ("Inter", "normal", "500"):
        "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fMZg.ttf",
    ("Inter", "normal", "600"):
        "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf",
    ("Inter", "normal", "700"):
        "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf",
    ("Inter", "normal", "800"):
        "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYMZg.ttf",
    ("Inter", "normal", "900"):
        "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuBWYMZg.ttf",
    ("Playfair Display", "normal", "700"):
        "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf",
    ("Playfair Display", "italic", "700"):
        "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFRD-vYSZviVYUb_rj3ij__anPXDTnCjmHKM4nYO7KN_k-UbtY.ttf",
}

DEFAULT_BG = {
    "horizontal": "https://images.pexels.com/photos/943700/pexels-photo-943700.jpeg?auto=compress&cs=tinysrgb&w=1920",
    "portrait":   "https://images.pexels.com/photos/442116/pexels-photo-442116.jpeg?auto=compress&cs=tinysrgb&w=1200",
}

TEMPLATE_FILE = {
    "horizontal": "ad-viticulture-halfpage.html",
    "portrait":   "ad-viticulture-portrait.html",
}


# ── helpers ───────────────────────────────────────────────────────────────────

def fetch(url: str, label: str = "") -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    if label:
        print(f"  {label}: {len(data)//1024}KB", file=sys.stderr)
    return data


def b64uri(data: bytes, mime: str) -> str:
    return f"data:{mime};base64,{base64.b64encode(data).decode()}"


def build_font_css(font_uris: dict) -> str:
    lines = []
    for (family, style, weight), uri in font_uris.items():
        lines.append(f"""@font-face {{
  font-family: '{family}';
  font-style: {style};
  font-weight: {weight};
  font-display: swap;
  src: url('{uri}') format('truetype');
}}""")
    return "\n".join(lines)


def extract_b64_src(html_path: Path, alt_text: str) -> str | None:
    html = html_path.read_bytes().decode("utf-8", errors="replace")
    m = re.search(
        r'<img[^>]*alt="' + re.escape(alt_text) + r'"[^>]*src="(data:[^"]+)"'
        r'|<img[^>]*src="(data:[^"]+)"[^>]*alt="' + re.escape(alt_text) + r'"',
        html,
    )
    return (m.group(1) or m.group(2)) if m else None


# ── ad templates ──────────────────────────────────────────────────────────────

DEFAULT_HEADLINE_H = "Your vineyard.<br><em>Audit-ready.</em>"
DEFAULT_BODY_H = (
    "Vine register, phenology, harvest chemistry, spray logs,\n"
    "          PDO&nbsp;/&nbsp;PGI records and excise duty — all in one place, accessible anywhere."
)
DEFAULT_HEADLINE_P = "Your<br>vineyard.<br><em>Audit-<br>ready.</em>"
DEFAULT_BODY_P = (
    "Vine register, phenology, harvest chemistry, spray logs,\n"
    "      PDO&nbsp;/&nbsp;PGI records and excise duty — all in one place."
)
DEFAULT_ACCENT = "#C49A6C"
DEFAULT_ACCENT_DARK = "#B8894A"
DEFAULT_ACCENT_LIGHT = "#E8C98A"
DEFAULT_GREEN = "#2D6A2E"


def accent_dark(accent: str) -> str:
    """When the accent is the default gold, return the darker shade; otherwise use the accent itself."""
    return DEFAULT_ACCENT_DARK if accent == DEFAULT_ACCENT else accent


def accent_light(accent: str) -> str:
    """When the accent is the default gold, return the lighter shade; otherwise use the accent itself."""
    return DEFAULT_ACCENT_LIGHT if accent == DEFAULT_ACCENT else accent


def build_horizontal(font_css: str, logo_uri: str, qr_uri: str, bg_uri: str,
                     headline: str = "", body: str = "", accent: str = "") -> str:
    hl  = headline.strip() or DEFAULT_HEADLINE_H
    bd  = body.strip()     or DEFAULT_BODY_H
    ac  = accent.strip()   or DEFAULT_ACCENT
    acd = accent_dark(ac)
    acl = accent_light(ac)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>BDE Farm Trac — Half Page Horizontal — CMYK</title>
<style>
{font_css}

@page {{ size: 190mm 133mm; margin: 0; }}
*, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{ width: 190mm; height: 133mm; overflow: hidden;
  font-family: 'Inter', sans-serif; }}

.ad {{ position: relative; width: 190mm; height: 133mm; overflow: hidden; }}

.bg {{ position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('{bg_uri}');
  background-size: cover; background-position: center 38%; }}

.overlay {{ position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(105deg,
    rgba(10,7,5,0.88) 0%, rgba(12,9,6,0.70) 48%, rgba(10,7,5,0.28) 100%); }}

.top-bar {{ position: absolute; top: 0; left: 0; right: 0; height: 0.7mm;
  background: linear-gradient(90deg, {acd} 0%, {acl} 50%, {acd} 100%);
  z-index: 4; }}

.left-rule {{ position: absolute; left: 0; top: 0; bottom: 0; width: 1.2mm;
  background: {DEFAULT_GREEN}; z-index: 4; }}

.inner {{ position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  display: flex; padding: 9mm 10mm 8.4mm 11mm; gap: 6mm; z-index: 3; }}

.left {{ width: 105mm; flex-shrink: 0; display: flex;
  flex-direction: column; justify-content: space-between; }}

.logo {{ display: block; height: 8mm; width: auto; max-width: 44mm; }}

.copy {{ display: flex; flex-direction: column; gap: 2.2mm;
  flex: 1; justify-content: center; }}

.eyebrow {{ font-size: 2.2mm; font-weight: 600; color: {ac};
  letter-spacing: 0.16em; text-transform: uppercase; }}

.headline {{ font-family: 'Playfair Display', serif; font-size: 11.6mm;
  font-weight: 700; line-height: 1.0; color: #ffffff; }}
.headline em {{ font-style: italic; color: {ac}; }}

.subline {{ font-size: 3mm; color: rgba(255,255,255,0.68);
  line-height: 1.5; font-weight: 400; max-width: 92mm; }}

.features {{ display: flex; flex-wrap: wrap; gap: 1.6mm 5.2mm; margin-top: auto; }}
.feat {{ display: flex; align-items: center; gap: 1.4mm;
  font-size: 2.4mm; font-weight: 500; color: rgba(255,255,255,0.78);
  white-space: nowrap; }}
.feat::before {{ content: ''; display: inline-block;
  width: 0.8mm; height: 0.8mm; border-radius: 50%;
  background: {ac}; flex-shrink: 0; }}

.right {{ flex: 1; display: flex; flex-direction: column;
  justify-content: space-between; }}

.glass-card {{ background: rgba(255,255,255,0.10);
  border: 0.1mm solid rgba(196,154,108,0.35); border-radius: 1.4mm;
  padding: 4.6mm 5.2mm; display: flex; flex-direction: column; }}

.card-title {{ font-family: 'Playfair Display', serif; font-style: italic;
  font-size: 2.8mm; color: {ac}; font-weight: 700;
  line-height: 1.2; margin-bottom: 2.4mm; }}

.card-item {{ padding: 2mm 0;
  border-bottom: 0.1mm solid rgba(255,255,255,0.09); }}
.card-item:last-child {{ border-bottom: none; padding-bottom: 0; }}

.card-item-title {{ font-size: 2.4mm; font-weight: 700;
  color: rgba(255,255,255,0.90); margin-bottom: 0.6mm; }}
.card-item-desc {{ font-size: 1.9mm; color: rgba(255,255,255,0.50);
  line-height: 1.35; }}

.cta-row {{ display: flex; align-items: flex-end; gap: 3.2mm; }}
.cta-block {{ flex: 1; display: flex; flex-direction: column; gap: 1mm; }}

.cta {{ display: block; background: transparent; color: {ac};
  font-weight: 800; font-size: 2.6mm; padding: 2.2mm 0;
  border-radius: 0.8mm; border: 0.2mm solid {ac};
  text-decoration: none; text-align: center; letter-spacing: 0.01em; }}

.url {{ font-size: 1.8mm; color: rgba(255,255,255,0.28);
  letter-spacing: 0.05em; text-align: center; }}

.qr-wrap {{ display: flex; flex-direction: column; align-items: center;
  gap: 1mm; flex-shrink: 0; }}
.qr-wrap img {{ display: block; width: 13mm; height: 13mm;
  border-radius: 0.6mm; }}
.qr-label {{ font-size: 1.6mm; color: rgba(255,255,255,0.30);
  letter-spacing: 0.04em; white-space: nowrap; }}
</style>
</head>
<body>
<div class="ad">
  <div class="bg"></div>
  <div class="overlay"></div>
  <div class="top-bar"></div>
  <div class="left-rule"></div>
  <div class="inner">
    <div class="left">
      <img class="logo" src="{logo_uri}" alt="BDE Farm Trac"/>
      <div class="copy">
        <div class="eyebrow">Viticulture · Cloud-based · UK vineyards</div>
        <div class="headline">{hl}</div>
        <div class="subline">{bd}</div>
      </div>
      <div class="features">
        <span class="feat">Vine register &amp; phenology</span>
        <span class="feat">PDO &amp; PGI compliance</span>
        <span class="feat">Spray &amp; scouting logs</span>
        <span class="feat">Harvest &amp; must chemistry</span>
        <span class="feat">Organic viticulture</span>
        <span class="feat">Excise &amp; duty records</span>
      </div>
    </div>
    <div class="right">
      <div class="glass-card">
        <div class="card-title">Full farm platform included</div>
        <div class="card-item">
          <div class="card-item-title">Red Tractor</div>
          <div class="card-item-desc">Spray logs, staff certs &amp; inspection evidence</div>
        </div>
        <div class="card-item">
          <div class="card-item-title">Organic Certification</div>
          <div class="card-item-desc">Input register &amp; derogation records</div>
        </div>
        <div class="card-item">
          <div class="card-item-title">Cloud Security</div>
          <div class="card-item-desc">Encrypted, auto-backed-up, disaster-recovery ready</div>
        </div>
      </div>
      <div class="cta-row">
        <div class="cta-block">
          <div class="cta">Register your interest</div>
          <div class="url">bdefarmtrac.co.uk</div>
        </div>
        <div class="qr-wrap">
          <img src="{qr_uri}" alt="QR"/>
          <span class="qr-label">Scan to visit</span>
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>"""


def build_portrait(font_css: str, logo_uri: str, qr_uri: str, bg_uri: str,
                   headline: str = "", body: str = "", accent: str = "") -> str:
    hl  = headline.strip() or DEFAULT_HEADLINE_P
    bd  = body.strip()     or DEFAULT_BODY_P
    ac  = accent.strip()   or DEFAULT_ACCENT
    acd = accent_dark(ac)
    acl = accent_light(ac)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>BDE Farm Trac — Half Page Vertical — CMYK</title>
<style>
{font_css}

@page {{ size: 90mm 267mm; margin: 0; }}
*, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
html, body {{ width: 90mm; height: 267mm; overflow: hidden;
  font-family: 'Inter', sans-serif; }}

.ad {{ position: relative; width: 90mm; height: 267mm; overflow: hidden; }}

.bg {{ position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('{bg_uri}');
  background-size: cover; background-position: center 30%; }}

.overlay {{ position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(180deg,
    rgba(8,6,4,0.42) 0%, rgba(8,6,4,0.55) 35%,
    rgba(8,6,4,0.82) 65%, rgba(8,6,4,0.96) 100%); }}

.top-bar {{ position: absolute; top: 0; left: 0; right: 0; height: 1.4mm;
  background: linear-gradient(90deg, {acd} 0%, {acl} 50%, {acd} 100%);
  z-index: 4; }}

.left-rule {{ position: absolute; left: 0; top: 0; bottom: 0; width: 1.6mm;
  background: {DEFAULT_GREEN}; z-index: 4; }}

.inner {{ position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  display: flex; flex-direction: column;
  padding: 7.2mm 7.2mm 7.2mm 10mm; z-index: 3; }}

.logo {{ display: block; height: 12mm; width: auto; max-width: 44mm; }}

.eyebrow {{ margin-top: 16mm; font-size: 2.6mm; font-weight: 600; color: {ac};
  letter-spacing: 0.16em; text-transform: uppercase; line-height: 1.3; }}

.headline {{ font-family: 'Playfair Display', serif; font-size: 14.8mm;
  font-weight: 700; line-height: 0.98; color: #ffffff; margin-top: 3.6mm; }}
.headline em {{ font-style: italic; color: {ac}; display: block; }}

.subline {{ font-size: 3.4mm; color: rgba(255,255,255,0.68);
  line-height: 1.5; font-weight: 400; margin-top: 5.2mm; max-width: 82mm; }}

.divider {{ width: 8mm; height: 0.3mm; background: {ac}; margin: 6mm 0; }}

.features {{ display: flex; flex-direction: column; gap: 2.8mm; }}
.feat {{ display: flex; align-items: center; gap: 2.4mm;
  font-size: 3.2mm; font-weight: 500; color: rgba(255,255,255,0.78); }}
.feat::before {{ content: ''; display: inline-block;
  width: 1.2mm; height: 1.2mm; border-radius: 50%;
  background: {ac}; flex-shrink: 0; }}

.platform-strip {{ margin-top: auto;
  border-top: 0.1mm solid rgba(196,154,108,0.35);
  padding-top: 4.4mm; display: flex; flex-direction: column; gap: 1.8mm; }}
.platform-label {{ font-size: 2.2mm; font-weight: 600; color: {ac};
  letter-spacing: 0.12em; text-transform: uppercase; }}
.platform-items {{ display: flex; flex-direction: column; gap: 1.4mm; }}
.platform-item {{ font-size: 2.6mm; color: rgba(255,255,255,0.60); }}
.platform-item strong {{ color: rgba(255,255,255,0.88); font-weight: 600;
  margin-right: 0.6mm; }}

.cta-row {{ display: flex; align-items: center; gap: 4mm; margin-top: 5.6mm; }}

.cta {{ flex: 1; display: block; background: transparent; color: {ac};
  font-weight: 800; font-size: 3mm; padding: 3.2mm 0;
  border-radius: 1mm; border: 0.25mm solid {ac};
  text-align: center; letter-spacing: 0.01em; }}

.qr-wrap {{ display: flex; flex-direction: column; align-items: center;
  gap: 1.4mm; flex-shrink: 0; }}
.qr-wrap img {{ display: block; width: 18mm; height: 18mm;
  border-radius: 0.8mm; }}
.qr-label {{ font-size: 2mm; color: rgba(255,255,255,0.30);
  letter-spacing: 0.04em; }}

.url {{ font-size: 2.2mm; color: rgba(255,255,255,0.25);
  letter-spacing: 0.05em; text-align: center; margin-top: 1.6mm; }}
</style>
</head>
<body>
<div class="ad">
  <div class="bg"></div>
  <div class="overlay"></div>
  <div class="top-bar"></div>
  <div class="left-rule"></div>
  <div class="inner">
    <img class="logo" src="{logo_uri}" alt="BDE Farm Trac"/>
    <div class="eyebrow">Viticulture · UK Vineyards</div>
    <div class="headline">{hl}</div>
    <div class="subline">{bd}</div>
    <div class="divider"></div>
    <div class="features">
      <span class="feat">Vine register &amp; phenology</span>
      <span class="feat">PDO &amp; PGI compliance</span>
      <span class="feat">Spray &amp; scouting logs</span>
      <span class="feat">Harvest &amp; must chemistry</span>
      <span class="feat">Organic viticulture</span>
      <span class="feat">Excise &amp; duty records</span>
    </div>
    <div class="platform-strip">
      <div class="platform-label">Full farm platform included</div>
      <div class="platform-items">
        <div class="platform-item"><strong>Red Tractor</strong> Spray logs &amp; inspection evidence</div>
        <div class="platform-item"><strong>Organic Cert</strong> Input register &amp; derogation records</div>
        <div class="platform-item"><strong>Cloud Security</strong> Encrypted, auto-backed-up</div>
      </div>
    </div>
    <div class="cta-row">
      <div class="cta">Register your interest</div>
      <div class="qr-wrap">
        <img src="{qr_uri}" alt="QR"/>
        <span class="qr-label">Scan to visit</span>
      </div>
    </div>
    <div class="url">bdefarmtrac.co.uk</div>
  </div>
</div>
</body>
</html>"""


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--format", required=True, choices=["horizontal", "portrait"])
    p.add_argument("--out",    required=True, help="Output HTML file path")
    p.add_argument("--src-dir", required=True, help="Directory containing template HTML files")
    p.add_argument("--bg-url",      default="", help="Override background image URL")
    p.add_argument("--headline",    default="", help="Override headline HTML (supports <em> for italic gold text)")
    p.add_argument("--body",        default="", help="Override body / subline HTML")
    p.add_argument("--accent-color", default="", help="Override accent colour (hex, e.g. #C49A6C)")
    args = p.parse_args()

    fmt     = args.format
    out     = Path(args.out)
    src_dir = Path(args.src_dir)
    bg_url  = args.bg_url or DEFAULT_BG[fmt]

    out.parent.mkdir(parents=True, exist_ok=True)

    # Fonts
    print("Downloading fonts…", file=sys.stderr)
    font_uris = {}
    for key, url in FONT_URLS.items():
        data = fetch(url, f"{key[0]} {key[2]} {key[1]}")
        font_uris[key] = b64uri(data, "font/truetype")
    font_css = build_font_css(font_uris)

    # Logo + QR from template files
    print("Extracting logo & QR…", file=sys.stderr)
    tmpl = src_dir / TEMPLATE_FILE[fmt]
    fallback = src_dir / (TEMPLATE_FILE["portrait"] if fmt == "horizontal" else TEMPLATE_FILE["horizontal"])
    logo_uri = extract_b64_src(tmpl, "BDE Farm Trac") or extract_b64_src(fallback, "BDE Farm Trac") or ""
    qr_uri   = extract_b64_src(tmpl, "QR — bdefarmtrac.co.uk") or extract_b64_src(fallback, "QR — bdefarmtrac.co.uk") or ""
    print(f"  logo: {'ok' if logo_uri else 'MISSING'}", file=sys.stderr)
    print(f"  qr:   {'ok' if qr_uri else 'MISSING'}", file=sys.stderr)

    # Background
    print(f"Fetching background ({bg_url[:60]}…)…", file=sys.stderr)
    bg_uri = b64uri(fetch(bg_url, "bg"), "image/jpeg")

    # Build HTML
    html = build_horizontal(font_css, logo_uri, qr_uri, bg_uri,
                            headline=args.headline, body=args.body, accent=args.accent_color) \
           if fmt == "horizontal" \
           else build_portrait(font_css, logo_uri, qr_uri, bg_uri,
                               headline=args.headline, body=args.body, accent=args.accent_color)
    out.write_text(html, encoding="utf-8")
    print(f"Written: {out} ({out.stat().st_size // 1024}KB)", file=sys.stderr)


if __name__ == "__main__":
    main()
