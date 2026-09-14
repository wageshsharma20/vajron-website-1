# VAJRON Inspection UAS

Technical specification page for the VAJRON autonomous inspection aircraft.

A scroll-driven single page. One aircraft element is held in a fixed layer for
the whole first half of the page, and a scrubbed timeline moves the camera
around it, so the craft never re-mounts as you scroll. At the sensor sequence
the photograph dissolves into an authored SVG schematic of the same airframe,
and seven pinned stops each highlight a component, draw its scan geometry and
anchor a leader line to it.

## Running locally

No build step. Serve the folder over HTTP so the assets resolve:

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Structure

```
index.html      the entire page: markup, styles and choreography
assets/         aircraft renders, component diagram, logos and seals
```

## Notes

- GSAP and ScrollTrigger load from cdnjs; type is Archivo and IBM Plex Mono
  from Google Fonts. Nothing else is fetched at runtime.
- No text on the page depends on an animation to become visible. Reveals are
  CSS classes driven by IntersectionObserver, with a timed failsafe, so a
  throttled tab or a blocked CDN cannot leave content hidden.
- `prefers-reduced-motion` unpins the sensor sequence and renders all seven
  systems as a static stack.
- Every specification figure comes from the VAJRON product deck.

(c) VAJRON Global Tech Pvt. Ltd.
