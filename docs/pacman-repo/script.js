const canvas = document.getElementById('game');
const ctx    = canvas.getContext('2d');

const TILE   = 24, ROWS = 7, DAY_MS = 24*60*60*1000;
let COLS, dots = [], path = [], frame = 0, gameOver = false, overTime = 0;

let verticalWalls, horizontalWalls;
let pac = {gridX:0,gridY:0,px:0,py:0,mouth:true,moving:false,tx:0,ty:0};

// setup
const today = new Date(), past = new Date(today);
past.setFullYear(past.getFullYear() - 1);
past.setDate(past.getDate() - ((past.getDay()+6)%7));
COLS = Math.ceil(((Date.now() - past)/DAY_MS +1)/7);

canvas.width = COLS*TILE;
canvas.height = ROWS*TILE;
canvas.style.imageRendering = 'pixelated';

function generateMaze(r,c){
  const vert=Array.from({length:r},()=>Array(c+1).fill(true));
  const horz=Array.from({length:r+1},()=>Array(c).fill(true));
  const vis=Array.from({length:r},()=>Array(c).fill(false));
  const stack=[{x:0,y:0}]; vis[0][0]=true;
  while(stack.length){
    const {x,y}=stack[stack.length-1],nbrs=[];
    if(x>0) nbrs.push({x:x-1,y,dir:'W'});
    if(x<c-1) nbrs.push({x:x+1,y,dir:'E'});
    if(y>0) nbrs.push({x,y:y-1,dir:'N'});
    if(y<r-1) nbrs.push({x,y:y+1,dir:'S'});
    const avail=nbrs.filter(n=>!vis[n.y][n.x]);
    if(avail.length){
      const n=avail[Math.floor(Math.random()*avail.length)];
      if(n.dir==='W') vert[y][x]=false;
      if(n.dir==='E') vert[y][x+1]=false;
      if(n.dir==='N') horz[y][x]=false;
      if(n.dir==='S') horz[y+1][x]=false;
      vis[n.y][n.x]=true; stack.push(n);
    } else stack.pop();
  }
  return {vertical:vert,horizontal:horz};
}

function scatterWithRepos(repos){
  repos.sort((a,b)=>a.name.localeCompare(b.name));
  const stars=repos.map(r=>r.stargazers_count),minS=Math.min(...stars),maxS=Math.max(...stars)||1;
  dots=repos.map(r=>{
    const d=new Date(r.created_at),col=Math.floor((d-past)/DAY_MS/7),row=(d.getDay()+6)%7;
    const norm=(r.stargazers_count-minS)/(maxS-minS),g=100+Math.floor(norm*155);
    return {x:col,y:row,phase:Math.random()*Math.PI*2,color:`rgb(0,${g},0)`};
  });
}

function findPath(){
  const vis=Array.from({length:ROWS},()=>Array(COLS).fill(false));
  const q=[{x:pac.gridX,y:pac.gridY,path:[{x:pac.gridX,y:pac.gridY}]}];
  vis[pac.gridY][pac.gridX]=true;
  while(q.length){
    const {x,y,path:p}=q.shift();
    if(dots.find(d=>d.x===x&&d.y===y)) return p;
    // E
    if(x+1<COLS&&!verticalWalls[y][x+1]&&!vis[y][x+1]){
      vis[y][x+1]=true; q.push({x:x+1,y,path:p.concat({x:x+1,y})});
    }
    // W
    if(x-1>=0&&!verticalWalls[y][x]&&!vis[y][x-1]){
      vis[y][x-1]=true; q.push({x:x-1,y,path:p.concat({x:x-1,y})});
    }
    // S
    if(y+1<ROWS&&!horizontalWalls[y+1][x]&&!vis[y+1][x]){
      vis[y+1][x]=true; q.push({x,y:y+1,path:p.concat({x,y:y+1})});
    }
    // N
    if(y-1>=0&&!horizontalWalls[y][x]&&!vis[y-1][x]){
      vis[y-1][x]=true; q.push({x,y:y-1,path:p.concat({x,y:y-1})});
    }
  }
  return [];
}

function initGame(){
  frame=0;gameOver=false;pac.moving=false;pac.mouth=true;
  const mz=generateMaze(ROWS,COLS);
  verticalWalls=mz.vertical; horizontalWalls=mz.horizontal;
  fetch(`https://api.github.com/users/${process.env.GITHUB_REPOSITORY_OWNER}/repos?per_page=100`)
    .then(r=>r.json()).then(scatterWithRepos)
    .catch(_=>{const dummy=Array.from({length:ROWS*COLS},(_,i)=>({
      created_at:new Date(past.getTime()+i*DAY_MS).toISOString(),stargazers_count:0
    }));scatterWithRepos(dummy);})
    .then(()=>{
      pac.gridX=Math.floor(COLS/2);pac.gridY=Math.floor(ROWS/2);
      pac.px=pac.gridX*TILE;pac.py=pac.gridY*TILE;
      dots=dots.filter(d=>!(d.x===pac.gridX&&d.y===pac.gridY));
      path=findPath();requestAnimationFrame(loop);
    });
}

function loop(){
  frame++;
  if(!gameOver&&dots.length===0){gameOver=true;overTime=performance.now();}
  if(gameOver){drawScene();drawOverlay();
    if(performance.now()-overTime>5000) initGame();return;}
  if(!pac.moving){
    if(path.length<=1) path=findPath();
    if(path.length>1){
      path.shift();const n=path[0];
      pac.gridX=n.x;pac.gridY=n.y;pac.tx=n.x*TILE;pac.ty=n.y*TILE;pac.moving=true;
    }
  } else {
    const dx=pac.tx-pac.px,dy=pac.ty-pac.py,d=Math.hypot(dx,dy);
    if(d<=1){pac.px=pac.tx;pac.py=pac.ty;pac.moving=false;
      const idx=dots.findIndex(d=>d.x===pac.gridX&&d.y===pac.gridY);
      if(idx>=0) dots.splice(idx,1);
    } else {pac.px+=dx/d;pac.py+=dy/d;}
  }
  if(frame%15===0) pac.mouth=!pac.mouth;
  drawScene();requestAnimationFrame(loop);
}

function drawScene(){
  const bg=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  bg.addColorStop(0,'#050027');bg.addColorStop(1,'#2e0057');
  ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height);
  // walls
  ctx.strokeStyle='#fff';ctx.lineWidth=3;
  verticalWalls.forEach((row,y)=>row.forEach((w,x)=>{if(w){
    const px=x*TILE,y0=y*TILE,y1=y0+TILE;
    ctx.beginPath();ctx.moveTo(px,y0);ctx.lineTo(px,y1);ctx.stroke();}}));
  horizontalWalls.forEach((row,y)=>row.forEach((w,x)=>{if(w){
    const py=y*TILE,x0=x*TILE,x1=x0+TILE;
    ctx.beginPath();ctx.moveTo(x0,py);ctx.lineTo(x1,py);ctx.stroke();}}));
  ctx.lineWidth=1;
  // dots
  dots.forEach(d=>{
    const cx=d.x*TILE+TILE/2;
    const cy=d.y*TILE+TILE/2+Math.sin(frame*0.02+d.phase)*2;
    ctx.fillStyle=d.color;ctx.beginPath();
    ctx.arc(cx,cy,TILE/4,0,2*Math.PI);ctx.fill();
  });
  // Pac-Man
  const mx=pac.px+TILE/2,my=pac.py+TILE/2,r=TILE/2-2;
  let ang=pac.moving?Math.atan2(pac.ty-pac.py,pac.tx-pac.px):0;
  const m=pac.mouth?0.25:0.05;
  ctx.fillStyle='#FFFF00';ctx.beginPath();
  ctx.moveTo(mx,my);ctx.arc(mx,my,r,ang+m,ang+2*Math.PI-m);ctx.fill();
}

function drawOverlay(){
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,canvas.width,canvas.height);
  const txt='GAME OVER',cols=['#f97583','#7ee787','#bb9af7','#58a6ff',
    '#ff7b72','#3fb950','#ffab70','#b1bac4','#'];
  ctx.font='bold 48px monospace';ctx.textBaseline='middle';
  let total=0;const ws=txt.split('').map(c=>{const w=ctx.measureText(c).width; total+=w; return w;});
  let x=(canvas.width-total)/2,y=canvas.height/2;
  txt.split('').forEach((c,i)=>{ctx.fillStyle=cols[i]||'#c9d1d9';
    ctx.fillText(c,x+ws[i]/2,y);x+=ws[i];});
}

initGame();
