# Asset sources and licences

Every image, model, font and library used by the site is listed here. Nothing is hot-linked: all files are served from this repository, and loading a page makes no third-party requests.

**Before adding any new image or asset, add a row here with its source and licence.** Only use images that you took yourself, images made for this site, or stock images whose licence allows commercial website use. Never use images found through Google Images or copied from other websites.

## Photos: `assets/img/shop/`

| File(s) | Subject | Source | Licence / permission | Changes |
|---|---|---|---|---|
| `blue-front-finished-*.webp` | Blue front end after paint | Art's Autobody's own photo, from the previous website's media library (`storage.googleapis.com/msgsndr/mAUF9kp1ZDrWIivMUhQc/media/6765a14ffb63bc6da3692c3b.jpeg`) | Owned by the business. **Owner to confirm.** | Resized, WebP, metadata stripped |
| `bumper-prep-masked-*.webp` | Blue bumper masked for paint | Same library, `6765a14f771611e4e861680e.jpeg` | Owned by the business. **Owner to confirm.** | Resized, WebP, metadata stripped |
| `primer-bumper-masked-*.webp` | Blue bumper in yellow masking tape | Same library, `6765a14f05c6f0a24b6fd6e4.jpeg` | Owned by the business. **Owner to confirm.** | Resized, WebP, metadata stripped |
| `coupe-booth-masking-*.webp` | Blue coupe masked in the booth | Same library, `6765a14f05c6f0faa86fd6e5.jpeg` | Owned by the business. **Owner to confirm.** | Resized, WebP, metadata stripped |
| `blue-coupe-finished-*.webp` | Blue coupe after paint | Same library, `6765a14fa6635c9d4424e543.jpeg` | Owned by the business. **Owner to confirm.** | Resized, WebP, metadata stripped |
| `infiniti-g-coupe-*.webp` | Red Infiniti G coupe | Same library, `6765a14f3209f6632745f689.jpeg` | Owned by the business. **Owner to confirm.** | Licence plate blurred, resized, WebP, metadata stripped |
| `maserati-front-*.webp` | Black Maserati GranTurismo, front | Same library, `6765a14f9eeee593b189a275.jpeg` | Owned by the business. **Owner to confirm.** | Licence plate blurred, resized, WebP, metadata stripped |
| `maserati-rear-*.webp` | Black Maserati GranTurismo, rear | Same library, `6765a15046935134a351b52a.jpeg` | Owned by the business. **Owner to confirm.** | Licence plate blurred, resized, WebP, metadata stripped |
| `mercedes-c-class-*.webp` | Red Mercedes-Benz C-Class | Same library, `6765a150fb63bcf757692c3d.jpeg` | Owned by the business. **Owner to confirm.** | Licence plate blurred, resized, WebP, metadata stripped |

Notes:
- These photos came from the business's previous website. The owner should confirm that the business took them, or has the photographer's permission to use them.
- Customer licence plates were blurred. EXIF metadata, which can include GPS location, was removed from every photo.
- Vehicle brand names and badges appear only because they're on the photographed cars. That's not a claim of affiliation, and the Terms of Use say so.

## 3D model: `src/models/car-concept.glb` (embedded as `assets/models/car-concept.glb.js`)

| | |
|---|---|
| Title | Car Concept |
| Author | Eric Chadwick |
| Owner | Darmstadt Graphics Group GmbH |
| Source | https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept |
| Licence | [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/) |
| Origin | Derived from a public-domain (CC0) model by "Unity Fan", as stated in the source README |
| Changes | Khronos and 3D Commerce logos removed (their trademarks are excluded from the licence); licence-plate mesh deleted; the logo textures replaced with plain colour and the tyre sidewall normal map flattened; compressed with glTF-Transform (Meshopt geometry, WebP textures at 1024 px max). 11.8 MB → 2.5 MB. |
| Attribution | Shown in the footer of `index.html` and in `terms.html`, as CC BY 4.0 requires. **Keep it if you edit the footer.** |

To rebuild the model from the original, see "Rebuilding the 3D model" in `README.md`.

## Fonts: `assets/fonts/`

| Font | Source | Licence |
|---|---|---|
| Syne (700, 800) | [@fontsource/syne](https://www.npmjs.com/package/@fontsource/syne) | SIL Open Font License 1.1 |
| Inter (variable) | [@fontsource-variable/inter](https://www.npmjs.com/package/@fontsource-variable/inter) | SIL Open Font License 1.1 |
| JetBrains Mono (500) | [@fontsource/jetbrains-mono](https://www.npmjs.com/package/@fontsource/jetbrains-mono) | SIL Open Font License 1.1 |

## Code libraries (bundled into `assets/js/app.js`)

| Library | Version | Licence |
|---|---|---|
| three.js (core, GLTFLoader, OrbitControls, RoomEnvironment, BufferGeometryUtils, meshopt decoder) | 0.160.0 | MIT: see `LICENSES/three.js.txt`. The meshopt decoder is also MIT (© Arseny Kapoulkine). |
| GSAP + ScrollTrigger (scroll animation) | 3.15 | GSAP Standard "No Charge" License: free, including commercial use (https://gsap.com/standard-license). |
| Lenis (smooth scrolling) | 1.3 | MIT |
| Tailwind CSS (build-time only; not shipped as a runtime) | 4.x | MIT |
| esbuild (build-time only) | 0.25 | MIT |

## Graphics made for this site

The logo mark, favicon, icons, the 3D studio floor and the damage markers are original SVG, CSS or canvas graphics created for this site. The logo mark is a placeholder; replace it with the shop's real logo if there is one.
