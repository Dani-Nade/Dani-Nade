// generate-pacman.js
// ▸ Launch a headless browser, point at your Pages‐hosted game,
//   screenshot frames, and encode into a looping GIF.

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const GIFEncoder = require('gifencoder');

(async () => {
  // 1) Launch headless Chrome
  const browser = await puppeteer.launch({
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  // set viewport to match your canvas size
  const WIDTH =  COLS = 24 * 35;   // e.g. 35 columns
  const HEIGHT = ROWS = 24 * 7;    // always 7 rows
  await page.setViewport({ width: WIDTH, height: HEIGHT });
  
  // 2) Navigate to your live Pages URL
  const repo  = process.env.GITHUB_REPOSITORY.split('/')[1];
  const user  = process.env.GITHUB_REPOSITORY_OWNER;
  const url   = `https://${user}.github.io/${repo}/pacman-repo/`;
  console.log(`Loading ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });

  // 3) Prepare GIF encoder
  const encoder = new GIFEncoder(WIDTH, HEIGHT);
  const outPath = path.resolve('dist/pacman-demo.gif');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const stream = fs.createWriteStream(outPath);
  encoder.createReadStream().pipe(stream);
  encoder.start();
  encoder.setRepeat(0);   // loop forever
  encoder.setDelay(200);  // 200ms between frames
  encoder.setQuality(10);

  // 4) Capture ~50 frames (~10s at 200ms/frame)
  for (let i = 0; i < 50; i++) {
    const buffer = await page.screenshot({ type: 'png' });
    encoder.addFrame(buffer);
    await page.waitForTimeout(200);
  }

  encoder.finish();
  await browser.close();
  console.log(`Written GIF to ${outPath}`);
})();
