---
layout: default
title: "Dani-Nade Portfolio"
---

<style>
.pacman-container {
  /* fill the full width of the page */
  width: 100%;
  /* cap at your game’s native pixel width if you like, e.g. 840px */
  max-width: 840px;
  margin: 2rem auto;
}

.pacman-container iframe {
  /* make the iframe scale to exactly the container’s width */
  width: 100%;
  /* height auto preserves the aspect ratio */
  height: auto;

  /* styling to match your canvas border/glow */
  border: 4px solid #FFD700;
  box-shadow: 0 0 30px rgba(255,215,0,0.6);
  display: block;

  /* no internal scrollbars */
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
