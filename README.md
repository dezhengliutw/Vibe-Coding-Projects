# Solar System Explorer (3D)

Interactive 3D solar system visualization built with `Three.js` for a discovery-show style presentation.

## Live Demo

Direct access to the deployed project:

`https://dezhengliutw.github.io/Vibe-Coding-Projects/`

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

## Files

- `index.html` - UI shell and layout
- `styles.css` - visual styling and responsive UI
- `main.js` - Three.js scene, controls, interactions, and data panel logic
