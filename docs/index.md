---
layout: default
title: "Dani-Nade Portfolio"
---

<style>
.pacman-container {
  /* fill the parent width completely */
  width: 100%;
  /* aspect ratio = columns / rows; here example is 35 cols by 7 rows */
  aspect-ratio: 35 / 7;
  margin: auto;
  overflow: hidden;               /* hide any scrollbar */
}

.pacman-container iframe {
  border: 4px solid #FFD700;
  box-shadow: 0 0 30px rgba(255,215,0,0.6);
  display: block;
  width: 100%;                    /* fill horizontally */
  height: 100%;                   /* fill vertically per aspect-ratio */
  overflow: hidden;               /* no scrollbars inside */
}
</style>

## 🎮 Repo-Eater Pac-Man Demo

<div class="pacman-container">
  <iframe
    src="./pacman-repo/index.html"
    title="Repo-Eater Pac-Man"
    scrolling="no"
    allowfullscreen
  ></iframe>
</div>
