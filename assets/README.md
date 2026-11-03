# Local visual assets

All runtime assets are served locally. Original downloads and SHA256 hashes are listed in `provenance.json`.

- [Wood Table 001 — Poly Haven](https://polyhaven.com/a/wood_table_001): 1K diffuse, OpenGL normal and roughness maps. Diffuse is regraded in the material setup toward the spec's natural oak; the smoked-oak material uses a darker tint. Roughness is deliberately uniform after swatch review.
- [Concrete Floor 02 — Poly Haven](https://polyhaven.com/a/concrete_floor_02): 1K diffuse, OpenGL normal and roughness maps. Diffuse contrast is reduced to read as smooth microcement; normal strength is reduced. Roughness is uniform to avoid a wet-floor look.
- [Venice Sunset — Poly Haven](https://polyhaven.com/a/venice_sunset), Greg Zaal: 1K HDR. Used for environment reflections/light and a small contribution from the **upper sky only**. Venice's buildings and water are not used as the Bangalore setting.

Poly Haven assets are [CC0](https://polyhaven.com/license). Generated leaf atlas, façade atlas, terrazzo aggregate, contact-shadow and glow textures are created in `threshold.js`.

No npm installation or lifecycle execution was needed. Three.js HDRLoader, Reflector and RoundedBoxGeometry were extracted from the already-pinned official `three@0.180.0` archive. Their imports and code were inspected: Three.js-only dependencies, no dynamic evaluation, environment-variable access, persistence, or installer scripts. Browser asset loading and render-target allocation are their expected capabilities. Classification: approved with mitigations (local pinned modules; planar reflection disabled in XR). Full automated vulnerability and malware scanning was not performed.
