#!/usr/bin/env node
import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import { URL } from 'url';

const [base, maxDepthStr, outFile] = process.argv.slice(2);
const maxDepth = Number(maxDepthStr || '2');

async function crawl() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const seen = new Set();
  const queue = [{ url: base, depth: 0 }];
  const pdfBuffers = [];

  while (queue.length) {
    const { url, depth } = queue.shift();
    if (seen.has(url) || depth > maxDepth) continue;
    seen.add(url);

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // snapshot → buffer
    pdfBuffers.push(await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
      displayHeaderFooter: true,
      headerTemplate:
        `<style>*{font-size:8px;margin:0}</style><span style="margin-left:10mm">${url}</span>`,
      footerTemplate:
        '<style>*{font-size:8px;margin:0}</style><span style="margin-left:10mm">© Cdaprods</span>'
    }));

    // enqueue internal links
    const anchors = await page.$$eval('a[href]', nodes =>
      nodes.map(n => n.getAttribute('href')));
    const root = new URL(base);
    anchors.forEach(href => {
      try {
        const u = new URL(href, root);
        if (u.origin === root.origin) queue.push({ url: u.href, depth: depth + 1 });
      } catch {/* ignore */}
    });

    await page.close();
  }

  // merge
  const merged = await PDFDocument.create();
  for (const buf of pdfBuffers) {
    const src = await PDFDocument.load(buf);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }
  await Deno.writeFile(outFile, merged.saveSync());
  await browser.close();
}

crawl().catch(e => { console.error(e); process.exit(1); });