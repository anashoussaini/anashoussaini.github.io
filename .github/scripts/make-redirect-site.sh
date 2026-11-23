#!/usr/bin/env bash
# Turn a built Hugo site into a redirect-only copy for anashoussaini.github.io.
# Every page becomes a stub that sends visitors (and search engines, via
# rel=canonical) to the same path on the new domain. 404.html catches any
# other old link (PDFs, images, ...) and forwards it with JavaScript.
# RSS/sitemap XML files are copied as-is so feed readers keep working.
# Usage: make-redirect-site.sh <built-site-dir> <output-dir> <new-origin>
set -euo pipefail
src=$(realpath "${1:?built site dir}")
out=$(realpath -m "${2:?output dir}")
new=${3:?new origin, e.g. https://anashoussaini.com}
new=${new%/}
rm -rf "$out" && mkdir -p "$out"

stub() { # $1 = no-JS fallback URL, $2 = JavaScript expression for the target
  cat <<HTML
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved to ${new#https://}</title>
<link rel="canonical" href="$1">
<meta http-equiv="refresh" content="0; url=$1">
<script>location.replace($2)</script>
</head>
<body><p>This site has moved to <a href="$1">$1</a>.</p></body>
</html>
HTML
}

cd "$src"
find . -name '*.html' -print0 | while IFS= read -r -d '' f; do
  rel=${f#./}
  mkdir -p "$out/$(dirname "$rel")"
  if [[ $rel == 404.html ]]; then
    stub "$new/" "'$new' + location.pathname + location.search + location.hash" > "$out/$rel"
  else
    path=/${rel%index.html}
    stub "$new$path" "'$new$path' + location.search + location.hash" > "$out/$rel"
  fi
done
find . -name '*.xml' -print0 | while IFS= read -r -d '' f; do
  rel=${f#./}
  mkdir -p "$out/$(dirname "$rel")" && cp "$f" "$out/$rel"
done
echo "redirect site: $(find "$out" -name '*.html' | wc -l) pages -> $new"
