# VAJRON AI Inspection Drone

Product website for the VAJRON autonomous inspection drone, laid out for iPad
presentation at exhibitions (portrait and landscape) and scaling to booth screens.

- Single static page (`index.html`): markup, styles and scripts, no build step.
  Type is Manrope and IBM Plex Mono from Google Fonts.
- Every specification figure comes from the VAJRON product deck.
- Product imagery, the film and the video loops are rendered from a procedural
  3D model of the aircraft (`tools/uas.js`, three.js) built from the deck's
  reference images. The system kit and edge-computer photos come from the deck.
- Reveals, counters and video playback use IntersectionObserver; videos load
  lazily and only play while on screen. `?expo` (or the E key) enlarges type
  for a booth display. The datasheet prints to A4.

## Running locally

```bash
python3 -m http.server 4191
```

Then open <http://localhost:4191>.

## Re-rendering media

`tools/render.html` holds the shots; `node tools/capture.mjs <jobs.json>` drives
headless Chrome to save frames, which are then encoded with ffmpeg.
`tools/` is excluded from deployment (`.vercelignore`).

(c) VAJRON Global Tech Pvt. Ltd.
