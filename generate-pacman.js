// generate-pacman.js
const fs         = require('fs');
const path       = require('path');
const puppeteer  = require('puppeteer');
const GIFEncoder = require('gifencoder');

(async () => {
  // Compute canvas size as before...
  const TILE = 24, ROWS = 7;
  const past = new Date();
  past.setFullYear(past.getFullYear() - 1);
  const DAY_MS = 24*60*60*1000;
  const COLS   = Math.ceil(((Date.now() - past)/DAY_MS + 1)/7);
  const WIDTH  = COLS * TILE;
  const HEIGHT = ROWS * TILE;

  // Launch headless Chrome
  const browser = await puppeteer.launch({
    args: ['--no-sandbox','--disable-setuid-sandbox'],
    headless: 'new'   // opt in to the new headless mode
  });
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });

  // Load your Pages‐hosted game
  const [user, repo] = process.env.GITHUB_REPOSITORY.split('/');
  const url = `https://${user}.github.io/${repo}/pacman-repo/`;
  console.log(`Loading ${url}`);
  await page.goto(
    url,
    { 
      // ← change here:
      // waitUntil 'networkidle2' waits for no more than 2 network connections 
      waitUntil: 'networkidle2'  
    }
  );

  // Set up GIF encoder
  const encoder = new GIFEncoder(WIDTH, HEIGHT);
  const outPath = path.resolve('dist/pacman-demo.gif');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  encoder.createReadStream().pipe(fs.createWriteStream(outPath));
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(200);
  encoder.setQuality(10);

  // Capture ~50 frames (~10 s)
  for (let i = 0; i < 50; i++) {
    const buffer = await page.screenshot({ type: 'png' });
    encoder.addFrame(buffer);
    await page.waitForTimeout(200);
  }

  encoder.finish();
  await browser.close();
  console.log(`GIF written to ${outPath}`);
})();
