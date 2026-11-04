# Creator Base VR World — Experience v3

> Concept study for a Zyeta experience design exercise. Hypothetical brief; not affiliated with or endorsed by adidas.

[Walk the live world](https://kari-basavaraj.github.io/creator-base-vr/) · [Inspect the exported GLB](https://kari-basavaraj.github.io/creator-base-vr/glb-preview.html) · [Brief alignment and storyboards](docs/brief-alignment.md)

A no-build Three.js/WebXR concept model in metres. CAD X maps to scene X, CAD Y to scene −Z, height to scene Y. The fixed architectural shell and columns follow the supplied derived build coordinates; the original DWG was not available for independent verification.

## Run locally

```sh
python3 -m http.server 8089
```

Open `http://localhost:8089/`. No package install or build is required. For Quest use the HTTPS GitHub Pages address and choose **Enter VR** when the browser supports immersive VR. Actual Quest hardware behaviour, frame rate and comfort remain untested.

## What is implemented

- **Four audience journeys:** Kabir, Arjun, Riya and Meera, with before/after context, intended emotional arcs and planned stops. Times are targets, not measured outcomes.
- **Three signature demonstrations:** a step-triggered arrival trace; timed lifted-product construction stories; an illustrative pin-wall visit mark with browser-local history and a take-home PNG.
- **Product decisions:** eight clearly labelled concept narratives, up to three shortlisted concepts, a private comparison table and a downloadable comparison note. No real adidas specifications or orders are represented.
- **Participation:** material choices and a browser-local community contribution wall. There is no shared cloud archive or actual hand-drawing capture.
- **Seasonal refresh:** two replaceable content bundles, changed from Host controls without rebuilding geometry. A previous season's saved marks return when that season is selected again.
- **Functional room identity:** maker tools/material library, a camera-ready studio with a 20-second no-capture rehearsal, a discreet AV rack, a privacy door/screened partner suite, café details and a quieter office treatment for 30 modeled desk positions.
- **Arena:** five arrangements—launch, athlete talk, partner presentation, run club and everyday. Six tiers contain 84 audience seats, with two proposed step-free floor positions. These are design proposals, not certified capacity, occupied sightlines, evacuation or accessibility.
- **Local ambience:** shared exterior time, different interior light/material/activity character, quiet neutral route cues and opt-in abstract room tone/footsteps. Orange is reserved for visitor marks; the overhead Arena ring is warm white.
- **Branding:** two inward-facing entrance wordmarks plus Lab, stage and partner-suite marks; “CREATOR BASE” overhead. Real vector geometry is embedded in the GLB.
- **Layout corrections:** traversable core-side staff interface, a stage clear of the fixed column footprint, and a visitor route checked at 428 centre-line samples against the current collision model.

## Controls

- **Start the journey:** exact lobby spawn at CAD `(31.4,30)`, 1.6 m desktop eye height, facing north. Meera's route begins at the assumed core-side staff interface.
- Drag to look; WASD/arrows to move; E or a short click to interact. Dragging does not accidentally activate a nearby object.
- Lift a nearby shoe; story layers unfold over 0/5/20 seconds and reset after 30 seconds. **Journey → Product** exposes detailed text and shortlisting.
- Interact near the maker bench, production table or comparison table for that activity. Step on the Imprint pad for an illustrative mark.
- **Journey:** choose a persona, review the intended arc, or inspect any space. Jump controls are inspection aids; they do not prove a timed continuous visit.
- **Host:** season, five Arena arrangements, maker material, recording rehearsal, Imprint replay, take-home mark and reset. Reset retains saved local history.
- **Sound:** starts off. Use the Sound button or the Quest menu to enable spatial room tones with gradual crossfades. Footsteps follow horizontal walking distance and sound softer in quiet rooms.
- **Route and visitors:** after crossing the start line, alternating orange sole marks guide the next few steps along the lit route. Four posed, stylized 3D figures populate the lounge, Lab, Workshop and Fuel Bar. Figures are embedded in the showcase GLB. Room audio and live route effects run in the walkthrough.
- **Quest Touch:** left thumbstick walks. Right thumbstick turns in 30° steps by default. Hold either grip to aim at the floor and release over a green marker to teleport. Aim and pull the trigger to interact. Click either thumbstick, or press A/X on recognized Touch controllers, to open the in-world menu. B/Y closes the menu or cancels an active teleport. The menu offers room shortcuts, teleport-only movement, smooth turning and optional controller vibration. Physical room-scale motion can cross virtual walls.
- **H / Hide UI:** unobstructed inspection. **Brand** cycles through marks; **View** includes the entrance, landmark and back tier.
- Daylight/Dusk is independent of Arena mode. **Lightweight** disables the desktop planar reflection and directional shadow; immersive VR automatically uses that lighter path.

## Export and import

**Export showcase** downloads `Creator-Base-Experience-v3.glb`. It temporarily arranges the visual model for interpretation: event seating, one lifted construction demonstration, an illustrative relief and example comparison props. It then restores the ongoing browser state. `world.glb` is the checked-in showcase export.

The GLB contains geometry, standard materials, interpretation graphics, five wordmarks and instanced repetitions. It does **not** contain the app's interaction scripts, audio engine, local archive, shader sky, live lighting/shadow maps or desktop reflection render. Imported appearance depends on the viewer's lighting. Viewers need `EXT_mesh_gpu_instancing` support.

`glb-preview.html` independently loads the actual binary, with named views for entry, Lab, Imprint, workshop, studio, team space, recovery and a seated-eye back-tier inspection. This provides rendered re-import evidence, not only a count of source-scene nodes.

## Files and content

- `app.js`: shell, fixed geometry, locomotion and wiring.
- `threshold.js`: tactile material pass, arrival trace and desktop rendering quality.
- `programme.js`: room equipment, privacy door, Arena arrangements and local light setup.
- `experience.js`: interactions, journeys, local persistence, take-home exports and host reset.
- `season-data.js`: editable seasons, concept-product narratives and persona/zone definitions.
- `branding.js`: official-site wordmark geometry and neutral architectural labels.
- `tests/browser-checks.js`: browser behaviour assertions using an existing Playwright page; no new package installation is required by the app.
- `scripts/check-source.py`: dependency-free source/import, asset-integrity and exported-binary checks.
- `validation/`: machine-readable results and screenshots of the actual prototype/import.

## Verification and limitations

Run the built-in checks with:

```sh
python3 scripts/check-source.py
```

The browser test function takes an existing Playwright page already navigated to this project. It checks spawn, line crossing, products, two-concept comparison, privacy door, contributions, rehearsal trigger, five Arena modes, persistent marks, season isolation, host reset, mobile fit and WebGL state. The 20-second product checkpoint is accelerated in the test; the pin animation and recording rehearsal were also observed through real elapsed waits.

The current model is about **261K triangles**, under the 300K design target. See `validation/experience-v3.json` and `validation/source-check.json` for the current exported model and check results. No claim is made of photoreal parity, headset readiness, universal collision physics, measured journey success, or professional building-code compliance.

The service recess, 3.6 m ceiling, 40 m upper-floor datum, city and assumed Vidhana Soudha location still need source/site verification. Product and visitor-relief data is illustrative, not biomechanics or commercial performance evidence. Persistence holds at most 30 local marks and 30 contributions and can be unavailable in private/restricted storage contexts.

The optional prototype is not the complete assignment submission. The final 16:9 PDF, maximum 20 slides, still needs the user's reviewed reasoning and AI-tool disclosure. The six required sections and current evidence are mapped in `docs/brief-alignment.md`.

## Assets, provenance and dependency scope

Three.js **0.180.0** is pinned and locally vendored under its MIT license; package identity/integrity is in `vendor/provenance.json`. This revision introduces no package installation, lifecycle hook, auth service or backend. The SVG and GLTF loaders/utilities are from the same reviewed package; the GLTF loader's utility import is adjusted for the vendor layout and one upstream SVG-loader comment has normalized indentation. The static checker also verifies local references.

Local wood, concrete and sunset HDR assets are from Poly Haven under CC0; URLs and SHA256 hashes are in `assets/provenance.json`. Surface maps are regraded in the browser to suit the material study. Procedural leaf, terrazzo, poster, contact-shadow and façade textures are created in code. Google Fonts is optional, with system fallbacks.

The adidas wordmark comes from the official annual-report header; `assets/adidas-wordmark-provenance.json` records its source/hash. It remains an adidas trademark, is not covered by CC0, and does not imply client approval or affiliation. Logos were added after the user's explicit instruction superseded the initial no-logo concept restriction.

This is a bounded manual dependency review, not a completed automated CVE/malware audit. No private brief, CAD, personal pitch materials or credentials are published in the repository.

## XR detail v4

See [detail pass and review views](docs/DETAIL-V4.md). Includes original procedural footwear, clearer Imprint relief, culture-night mode, seating storage proposal and maker/studio details. Use `?view=lab&v=detail-v4` or `?view=culture&v=detail-v4` to inspect. The export is now named `Creator-Base-Detail-v4.glb`; the checked-in file remains `world.glb`. Presentation files are managed separately.

## Vidhana Soudha exterior v5

[Reference-led landmark model](docs/LANDMARK-V5.md) replaces the earlier rough massing. Review `?view=landmark&v=landmark-v5`; exported filename is `Creator-Base-Landmark-v5.glb`. The exterior is an assumed concept outlook, not a surveyed site reconstruction.
