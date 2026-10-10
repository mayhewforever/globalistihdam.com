# YouTube channel banner

Final files: `youtube-banner.svg` and `youtube-banner.png`.

The final artwork is a new native SVG layout, exported through Inkscape to an exact **2560 × 1440 pixel** PNG. It is ready for the channel upload/crop review. No YouTube account update has been made by the asset author.

- PNG size: 609,491 bytes (below 6 MB).
- Typography: DejaVu Sans Bold/Regular; the upload PNG contains the rendered text.
- Text: **Globalistihdam** and **Careers • Education • Investment • Robotics**.
- Navy background with restrained cyan, teal, orange and green vector strokes.
- Original logo: `global-istihdam-symbol-turkiye-v4.png`, embedded as a PNG image in the SVG without modifying its source bytes.
- Embedded logo SHA-256: `e1c76a04e11f000273ef4f4b692481de7f6b5db5d2ab1b4ca9ca1fc5b6b2a74f`.
- No contact information, new insignia or generated replacement logo.

## Crop verification

The standard centre-safe rectangle is x=507–2053, y=508.5–931.5 (1546 × 423 px). The logo is placed within x=620–948, y=556–884. Title and subtitle begin at x=1002/1008 and remain comfortably inside the safe rectangle. The complete logo and both text lines are visible in the central crop.

The whole 2560 × 1440 PNG and a separate 1546 × 423 SVG-rendered QA view were inspected with `view_image`. The QA crop is a scratch review artifact; it is not the upload file. YouTube's own device previews should still be reviewed during channel upload.

## Provenance

An earlier AI-generated concept is retained separately as `youtube-banner-ai-concept.png`. It is 1672 × 941 px and is not the final upload artwork. The final SVG/PNG does not edit, resize or reuse that generated bitmap; it uses the unchanged original brand mark and native vector shapes/text.

Export command used:

```sh
inkscape social/branding/youtube-banner.svg --export-type=png --export-filename=social/branding/youtube-banner.png --export-width=2560 --export-height=1440
```
