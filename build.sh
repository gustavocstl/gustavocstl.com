#!/bin/sh

set -eu

site_dir=$(CDPATH= cd "$(dirname "$0")" && pwd)
pandoc_bin=${PANDOC_BIN:-pandoc}
base_url=${BASE_URL:-https://gustavocstl.com}
build_dir="$site_dir/.public.tmp"
output_dir="$site_dir/public"

if ! command -v "$pandoc_bin" >/dev/null 2>&1; then
  echo "Pandoc was not found. Install Pandoc or set PANDOC_BIN to its executable." >&2
  exit 1
fi

rm -rf "$build_dir"
mkdir -p "$build_dir"
cp -R "$site_dir/static/." "$build_dir/"

post_count=0

for post in "$site_dir"/posts/*.md; do
  filename=$(basename "$post")
  slug=${filename%.md}
  post_dir="$build_dir/$slug"

  mkdir -p "$post_dir"

  set -- \
    "$post" \
    --from=markdown+yaml_metadata_block+raw_html+lists_without_preceding_blankline-smart-implicit_figures \
    --to=html5 \
    --standalone \
    --template="$site_dir/templates/post.html" \
    --wrap=none \
    --metadata="canonical:${base_url%/}/$slug/" \
    --output="$post_dir/index.html"

  "$pandoc_bin" "$@"
  post_count=$((post_count + 1))
  echo "$filename"
done

rm -rf "$output_dir"
mv "$build_dir" "$output_dir"

echo "Built $post_count posts in $output_dir"
