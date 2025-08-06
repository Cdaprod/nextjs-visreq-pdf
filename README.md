# Next.js Visual Regression to PDF

#### By: [Cdaprod](https://github.com/Cdaprod)

A simple GitHub Action that builds any Next.js App-Router project, crawls all internal pages, renders them into a single PDF, and commits the newest N PDFs back into your repo for easy public review.

## Why this exists

Keeping visual snapshots of your app across commits helps you track UI drift without manual screenshot updates. This Action automates:
- Building your Next.js app from any subdirectory
- Discovering every internal route up to a configurable depth
- Rendering each page into a combined PDF
- Saving that PDF under `docs/visual-regression/<commit>.pdf`
- Pruning older files so only the last X remain

### Getting started
1. In your workflow YAML, add a step that uses `Cdaprod/nextjs-visreg-pdf@v1`.
2. Provide inputs such as `workdir`, `build_cmd`, `start_cmd`, `port`, `keep` (how many PDFs to keep), `pdf_dir` (where to store them) and optional `commit` to disable pushing.
3. On each push to your main branch, you’ll get an updated PDF in `docs/visual-regression/` and only the latest N versions will linger.

### Key inputs
- `workdir`: subfolder where your Next.js project lives (e.g. `docker/web-app`)
- `build_cmd`: command to build your site (e.g. `pnpm run build`)
- `start_cmd`: command to launch the production server (e.g. `pnpm run start`)
- `port`: port that the server listens on (default `3000`)
- `keep`: number of historical PDFs to preserve (default `5`)
- `pdf_dir`: path in the repo where PDFs are saved (default `docs/visual-regression`)
- `commit`: set to `false` to skip committing in CI examples

### How it works
1. Install & build: runs your install and build steps in the specified `workdir`.
2. Start server: boots the production build and waits for the port to open.
3. Crawl & render: automatically follows links up to the given depth, captures each page into a PDF buffer, then merges them.
4. Commit & prune: places the new PDF into `pdf_dir` with the current commit SHA, deletes any beyond the newest `keep`, and pushes the change back.

#### Example usage

_In your `.github/workflows/visreg.yml`, include:_

```yaml
uses: Cdaprod/nextjs-visreg-pdf@v1
with:
  workdir: docker/web-app
  build_cmd: pnpm run build
  start_cmd: pnpm run start
  port: 3000
  keep: 5
  pdf_dir: public/visual-regression
```

That’s it—on each push to main you’ll end up with a shareable PDF of your whole app, and your repo will always contain only the last five visual-regression artifacts.

⸻

Built and maintained by Cdaprod. Feel free to open issues or pull requests!

