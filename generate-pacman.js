// generate-pacman.js
// Launch a headless browser, record the game, and output a looping GIF.

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const GIFEncoder = require('gifencoder');

(async () => {
  // Configure viewport to match your canvas size
  const TILE = 24, ROWS = 7;
  const past = new Date();
  past.setFullYear(past.getFullYear() - 1);
  const DAY_MS = 24*60*60*1000;
  const COLS = Math.ceil(((Date.now() - past) / DAY_MS + 1) / 7);
  const WIDTH  = COLS * TILE;
  const HEIGHT = ROWS * TILE;

  const browser = await puppeteer.launch({
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });

  const [user, repo] = process.env.GITHUB_REPOSITORY.split('/');
  const url = `https://${user}.github.io/${repo}/pacman-repo/`;
  console.log(`Loading ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Prepare GIF encoder
  const encoder = new GIFEncoder(WIDTH, HEIGHT);
  const outPath = path.resolve('dist/pacman-demo.gif');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const stream = fs.createWriteStream(outPath);
  encoder.createReadStream().pipe(stream);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(200);
  encoder.setQuality(10);

  // Capture frames
  for (let i = 0; i < 50; i++) {
    const img = await page.screenshot({ type: 'png' });
    encoder.addFrame(img);
    await page.waitForTimeout(200);
  }

  encoder.finish();
  await browser.close();
  console.log(`GIF written to ${outPath}`);
})();
