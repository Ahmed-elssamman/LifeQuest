# README visuals

These assets are created for publication. Screenshots show only the public homepage in a fresh anonymous browser context; they contain no private account or test-fixture data. The animated tour combines those same public screenshots.

- `hero.svg`: editable MIRHAL vector banner using the established lavender and mint palette.
- `landing.png`: English desktop homepage.
- `arabic-dark.png`: Arabic desktop homepage with dark theme and RTL layout.
- `mobile.png`: English homepage at 390 CSS pixels.
- `product-tour.gif`: animated, locally generated walkthrough with gentle transitions.

From the repository root, with npm dependencies and Playwright Chromium installed:

```sh
node tools/readme/capture.mjs
python tools/readme/animate.py
```

The animation generator requires Python 3 and Pillow (`python -m pip install Pillow`). It uses an installed sans-serif font, with a portable Pillow fallback. `README_ORIGIN` can point the capture script at another running MIRHAL frontend. Existing captures predate the rebrand. Do not replace these images with private screenshots from `.local/`.

The README includes links to all three static previews alongside the animation.
