#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

python3 <<'PY'
from pathlib import Path

root = Path(".")
out = root / "Ciencia-Catastrofes-tablet-standalone.html"

css = (root / "styles.css").read_text(encoding="utf-8")
css += """

/* Standalone / tablet: toques mais confortáveis */
@media (pointer: coarse) {
  .cta, .back-btn, .home-tab, .mode-switch button { min-height: 48px; align-items: center; }
  .card { -webkit-tap-highlight-color: transparent; }
  input[type=range].chunky { min-height: 44px; }
  input[type=range].chunky::-webkit-slider-thumb { width: 36px; height: 36px; margin-top: -14px; }
  input[type=range].chunky::-moz-range-thumb { width: 36px; height: 36px; }
}
"""
data = (root / "data.js").read_text(encoding="utf-8")
icons = (root / "icons.jsx").read_text(encoding="utf-8")
scenes = (root / "scenes.jsx").read_text(encoding="utf-8")
app = (root / "app.jsx").read_text(encoding="utf-8")


def esc_script(s: str) -> str:
    return s.replace("</script>", "<\\/script>")


html = f"""<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="theme-color" content="#FFF6E0" />
  <title>Ciência vs. Catástrofes — Simulador (standalone)</title>
  <!-- Ficheiro único: copia para o tablet e abre no Safari/Chrome com Wi‑Fi (carrega React e Babel da Internet). -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@600;700;800;900&display=swap" />
  <style>
{css}
  </style>
</head>
<body>
  <div id="root"></div>

  <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js" crossorigin="anonymous"></script>

  <script>
{esc_script(data)}
  </script>
  <script type="text/babel">
{esc_script(icons)}
  </script>
  <script type="text/babel">
{esc_script(scenes)}
  </script>
  <script type="text/babel">
{esc_script(app)}
  </script>
</body>
</html>
"""

out.write_text(html, encoding="utf-8")
print(f"Wrote {out.resolve()} ({out.stat().st_size} bytes)")
PY
