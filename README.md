# Solar System Explorer (3D)

Interactive 3D solar system visualization built with `Three.js` for a discovery-show style presentation.

## Features

- 3D solar system scene with the Sun and 8 planets
- Planet selection from the bottom navigation strip
- Smooth zoom/focus transitions to selected planets
- Click selected planet tab again to return to overview mode
- Orbit lines and labels toggle
- Speed control (up to `10x`)
- Right-side data panel for selected planets
- Stylized sci-fi UI for showcase/demo use

## Controls

- `Drag`: rotate camera
- `Scroll`: zoom in/out
- `Click planet`: focus and follow planet
- `Bottom planet list`: select/deselect planets
- `Orbits` / `Labels`: toggle overlays
- `Time slider`: adjust simulation speed

## Run Locally

This project should be served over HTTP (not `file://`).

### Python (quickest)

```powershell
py -m http.server 8000
```

Then open:

`http://localhost:8000/index.html`

## Deploy on GitHub Pages

1. Push this repo to GitHub
2. Go to `Settings` -> `Pages`
3. Under `Build and deployment`:
   - `Source`: `Deploy from a branch`
   - `Branch`: `main`
   - `Folder`: `/ (root)`
4. Save and wait for the Pages URL to appear

## Files

- `index.html` - UI shell and layout
- `styles.css` - visual styling and responsive UI
- `main.js` - Three.js scene, controls, interactions, and data panel logic
