#!/usr/bin/env bash
# entrypoint.sh - build and crawl a Dockerized Next.js app
# Usage: entrypoint.sh <context> <dockerfile> <port> <depth> <output_dir> <keep> <commit>
# Example: entrypoint.sh docker/web-app Dockerfile 3000 2 public/visreg 5 false
set -euo pipefail

ctx=${1:-.}
dfile=${2:-Dockerfile}
port=${3:-3000}
depth=${4:-2}
outdir=${5:-docs/visual-regression}
keep=${6:-5}
commit=${7:-true}

# Build app image
if ! docker build -t visreg-app -f "$ctx/$dfile" "$ctx"; then
  echo "image build failed" >&2
  exit 1
fi

# Run container
if docker ps -q --filter name=visreg-run; then
  docker rm -f visreg-run >/dev/null 2>&1 || true
fi
docker run -d --rm -p "$port:$port" --name visreg-run visreg-app
npx wait-port "$port"

# Crawl and render
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium node scripts/crawl2pdf.mjs "http://localhost:$port" "$depth" visreg.pdf

docker stop visreg-run

# Move & prune
mkdir -p "$outdir"
cp visreg.pdf "$outdir/${GITHUB_SHA:-local}.pdf"
cd "$outdir"
ls -t *.pdf | tail -n +$((keep+1)) | xargs -r rm --

if [ "$commit" = "true" ]; then
  git config user.name "visreg-bot"
  git config user.email "visreg-bot@users.noreply.github.com"
  git add .
  if git diff --cached --quiet; then
    echo "nothing to commit"
  else
    git commit -m "chore(visreg): update PDF for ${GITHUB_SHA:-local}"
    git push
  fi
fi
