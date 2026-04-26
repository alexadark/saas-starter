#!/bin/bash
set -euo pipefail
RIFF_DIR="${RIFF_DIR:-$HOME/DEV/frameworks/riff}"
TEMPLATES="$RIFF_DIR/templates"

if [ ! -d "$TEMPLATES" ]; then
  echo "ERROR: RIFF templates not found at $TEMPLATES"
  echo "Set RIFF_DIR env var or clone RIFF to ~/DEV/frameworks/riff"
  exit 1
fi

echo "Syncing tooling config from $TEMPLATES..."

for f in biome.json vitest.config.ts vitest.setup.ts drizzle.config.ts playwright.config.ts tsconfig.json components.json vite.config.ts .semgrep.yml .gitleaks.toml; do
  if [ -f "$TEMPLATES/$f" ]; then
    cp "$TEMPLATES/$f" "./$f"
    echo "  ok $f"
  fi
done

mkdir -p .github/workflows
for f in ci.yml e2e.yml; do
  if [ -f "$TEMPLATES/github-workflows/$f" ]; then
    cp "$TEMPLATES/github-workflows/$f" ".github/workflows/$f"
    echo "  ok .github/workflows/$f"
  fi
done

echo "Sync complete."
