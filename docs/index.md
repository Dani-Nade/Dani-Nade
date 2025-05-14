<style>
.pacman-container {
  /* fill the full viewport width */
  width: 100vw;
  /* calculate height so the full 7/35 ratio fits */
  height: calc(100vw * 7 / 35);
  overflow: hidden;           /* hide any overshoot */
  margin: 2rem auto;          /* center with some top/bottom space */
}

.pacman-container iframe {
  border: 4px solid #FFD700;
  box-shadow: 0 0 30px rgba(255,215,0,0.6);
  width: 100%;
  height: 100%;
  display: block;
  overflow: hidden;
}
</style>

## 🎮 Repo-Eater Pac-Man Demo

<div class="pacman-container">
  <iframe
    src="./pacman-repo/index.html"
    title="Repo-Eater Pac-Man"
    scrolling="no"
  ></iframe>
</div>
