#!/usr/bin/env node
/**
 * Crawl a website and generate a merged PDF of all internal pages.
 *
 * Usage:
 *   node crawl2pdf.mjs <baseUrl> [depth] [output]
 *
 * Example:
 *   node crawl2pdf.mjs http://localhost:3000 2 visreg.pdf
 */
import { URL } from 'url';
import { writeFile } from 'fs/promises';

const [base, depthStr = '2', outFile = 'visreg.pdf'] = process.argv.slice(2);

if (!base) {
  console.error('Usage: node crawl2pdf.mjs <baseUrl> [depth] [output]');
  process.exit(1);
}

const maxDepth = Number(depthStr);
const [{ default: puppeteer }, { PDFDocument }] = await Promise.all([
  import('puppeteer'),
  import('pdf-lib')
]);

async function crawl() {
  const launchOpts = {
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const browser = await puppeteer.launch(launchOpts);
  const seen = new Set();
  const queue = [{ url: base, depth: 0 }];
  const pdfBuffers = [];

  while (queue.length) {
    const { url, depth } = queue.shift();
    if (seen.has(url) || depth > maxDepth) continue;
    seen.add(url);

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    pdfBuffers.push(
      await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
        displayHeaderFooter: true,
        headerTemplate:
          `<style>*{font-size:8px;margin:0}</style><span style="margin-left:10mm">${url}</span>`,
        footerTemplate:
          '<style>*{font-size:8px;margin:0}</style><span style="margin-left:10mm">© visreg</span>'
      })
    );

    const anchors = await page.$$eval('a[href]', nodes =>
      nodes.map(n => n.getAttribute('href'))
    );
    const root = new URL(base);
    anchors.forEach(href => {
      try {
        const u = new URL(href, root);
        if (u.origin === root.origin) {
          queue.push({ url: u.href, depth: depth + 1 });
        }
      } catch {
        /* ignore */
      }
    });

    await page.close();
  }

  const merged = await PDFDocument.create();
  for (const buf of pdfBuffers) {
    const src = await PDFDocument.load(buf);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }
  const bytes = await merged.save();
  await writeFile(outFile, Buffer.from(bytes));
  await browser.close();
}

crawl().catch(err => {
  console.error(err);
  process.exit(1);
});
