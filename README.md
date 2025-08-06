[![CI](https://github.com/Cdaprod/nextjs-visreq-pdf/actions/workflows/ci.yml/badge.svg)](https://github.com/Cdaprod/nextjs-visreq-pdf/actions/workflows/ci.yml)

# Next.js Visual Regression to PDF

#### By: [Cdaprod](https://github.com/Cdaprod)

A Docker-based GitHub Action that builds your Next.js App‑Router project into a Docker image, runs the resulting container, crawls every internal page, renders them into a single PDF, and commits the newest N PDFs back for easy review.

## Why this exists

Keeping visual snapshots of your app across commits helps you track UI drift without manual screenshot updates. This Action automates:
- Building your app's Docker image from any context directory
- Discovering every internal route up to a configurable depth
- Rendering each page into a combined PDF
- Saving that PDF under `docs/visual-regression/<commit>.pdf`
- Pruning older files so only the last X remain

### Getting started
1. In your workflow YAML, add a step that uses `Cdaprod/nextjs-visreg-pdf@v1`.
2. Provide inputs such as `context` (Docker build context), optional `dockerfile`, `port`, `depth`, `output_dir`, `keep`, and optional `commit` to disable pushing.
3. On each push to your main branch, you’ll get an updated PDF in `docs/visual-regression/` and only the latest N versions will linger.

### Key inputs
- `context`: folder containing your app's Dockerfile (e.g. `docker/web-app`)
- `dockerfile`: Dockerfile name within that context (default `Dockerfile`)
- `port`: port exposed by the container (default `3000`)
- `depth`: crawler link depth (default `2`)
- `keep`: number of historical PDFs to preserve (default `5`)
- `output_dir`: path in the repo where PDFs are saved (default `docs/visual-regression`)
- `commit`: set to `false` to skip committing in CI examples

### How it works
1. Build image: `docker build` is run against the provided context and Dockerfile.
2. Run container: the image starts detached and the action waits for the port to open.
3. Crawl & render: all internal routes are followed up to the given depth and merged into a PDF.
4. Commit & prune: the PDF is placed into `output_dir` with the current commit SHA, older files beyond `keep` are removed, and the change is optionally pushed.

#### Example usage

_In your `.github/workflows/visreg.yml`, include:_

```yaml
uses: Cdaprod/nextjs-visreg-pdf@v1
with:
  context: docker/web-app
  dockerfile: Dockerfile
  port: 3000
  keep: 5
  output_dir: public/visual-regression
```

That’s it—on each push to main you’ll end up with a shareable PDF of your whole app, and your repo will always contain only the last five visual-regression artifacts.

⸻

Built and maintained by Cdaprod. Feel free to open issues or pull requests!

