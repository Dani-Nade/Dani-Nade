const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const TILE = 20;
const ROWS = 20, COLS = 30;
canvas.width = COLS * TILE;
canvas.height = ROWS * TILE;

// Load file list from your repo via GitHub API
async function fetchFiles() {
  const resp = await fetch(
    'https://api.github.com/repos/veneka/veneka/git/trees/main?recursive=1'
  );
  const data = await resp.json();
  return data.tree
    .filter(f => f.type === 'blob')
    .map(f => ({ x: 0, y: 0 }));
}

let dots = []; // dots represent files
let pac = { x: 14, y: 10, dir: 0 }; // 0=→,1=↓,2=←,3=↑

fetchFiles().then(files => {
  // scatter dots randomly
  dots = files.map(() => ({
    x: Math.floor(Math.random() * COLS),
    y: Math.floor(Math.random() * ROWS)
  }));
  requestAnimationFrame(loop);
});

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') pac.dir = 3;
  if (e.key === 'ArrowDown') pac.dir = 1;
  if (e.key === 'ArrowLeft') pac.dir = 2;
  if (e.key === 'ArrowRight') pac.dir = 0;
});

function loop() {
  // move Pac-Man
  if (pac.dir === 0) pac.x++;
  if (pac.dir === 1) pac.y++;
  if (pac.dir === 2) pac.x--;
  if (pac.dir === 3) pac.y--;

  pac.x = (pac.x + COLS) % COLS;
  pac.y = (pac.y + ROWS) % ROWS;

  // eat dots
  dots = dots.filter(d => !(d.x === pac.x && d.y === pac.y));

  // draw
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  // dots
  ctx.fillStyle = '#fff';
  dots.forEach(d => ctx.fillRect(d.x*TILE+8, d.y*TILE+8, 4, 4));
  // Pac-Man
  ctx.fillStyle = '#ff0';
  ctx.beginPath();
  let start = pac.dir * 0.5 * Math.PI + 0.2;
  let end = pac.dir * 0.5 * Math.PI + 1.8;
  ctx.moveTo(pac.x*TILE+TILE/2, pac.y*TILE+TILE/2);
  ctx.arc(pac.x*TILE+TILE/2, pac.y*TILE+TILE/2,
          TILE/2 - 2, start, end);
  ctx.fill();

  // loop
  requestAnimationFrame(loop);
}
