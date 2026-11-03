# Creator Base VR World

> Concept study for a Zyeta experience design exercise. Hypothetical brief; not affiliated with or endorsed by adidas.

Live: https://kari-basavaraj.github.io/creator-base-vr/

A no-build, metre-scale Three.js/WebXR architectural study built from **Creator Base VR World — Build Spec.pdf**, supplied November 1, 2026. Source coordinates use CAD X east, CAD Y north; scene X = CAD X, Z = −CAD Y, Y = height.

## Open

```sh
cd /Users/basavarajkm/code/Adhoc-OneTime-Codex-Playground/creator-base-vr
python3 -m http.server 8088
```

Open http://localhost:8088. No npm install or build step. Three.js 0.180.0 is pinned and vendored with its MIT license; fonts optionally load from Google Fonts, with system fallbacks.

For Quest, serve this folder on an **HTTPS origin with a trusted certificate** and open that address in Quest Browser. A computer's plain HTTP LAN address does not enable immersive WebXR. No public hosting has been configured. Enter VR appears when the browser supports immersive VR.

## Controls

- Start the journey: restores exact spawn at CAD (31.4, 30), eye height 1.6 m, north-facing.
- Desktop: drag to look, WASD / arrows to walk; E or click near a shoe to lift it for 10 seconds.
- Touch: drag to look, hold the up-arrow to walk; journey buttons jump to the four story beats.
- Click the floor map to teleport to a valid position. Explore floor plan hides ceilings for an elevated view.
- Stand on the Arena pad: visitor pins rise over four seconds beside the athlete.
- Quest: left-stick head-relative smooth movement; right-stick 30° snap turn; aim controller at floor and trigger to teleport. Controller proximity lifts shoes.
- Daylight/Dusk and Arena Event/Everyday are independently available.
- Export world downloads the current visible model as `world.glb`. A default-event export is included in this folder. It uses `EXT_mesh_gpu_instancing`; importing tools must support that extension.

## Included model

Proposed floor polygon; core mass with lift-lobby void and staff opening; 15 specified columns; full external glazing perimeter and mullions; partitions; threshold portals; eight plinths and simplified shoes; path material bands; lounge; Fuel Bar; studio and workshop; Arena stage and four tiers; 80 mm-pitch pin field and two running figures; partner suite; 30 desk positions and focus booth; landmark and deterministic city massing. Repeated chairs, pins and static primitives are instanced. Materials have locally generated grain and terrazzo textures.

## Interpretation and limits

- CAD coordinates in the supplied PDF are used directly; original DWG was not supplied. The spec's rendered references establish intent, while this is simplified procedural geometry rather than a photoreal model.
- The spec conflicts on decorative orange. The story's stricter rule wins: overhead Arena ring is warm white; route light stops before the calm Fuel Bar; resting plinths are neutral. Orange marks only active visitor moments.
- Ceiling 3.6 m, floor elevation 40 m and Vidhana Soudha location/massing remain assumptions from the PDF. No extra enclosed rooms are invented.
- Model includes out-of-scope columns/glazing as base-build context, without an enterable out-of-scope floor.
- No logos, brand graphics, TV walls or screens in visitor journey zones.
- Furniture, plants and shoes are low-poly approximations. No people, spatial audio, physical hand tracking, full-screen bloom postprocessing, or server-side seasonal visitor archive. Marks last for the current session.
- Collision prevents desktop/thumbstick travel outside the model and into core, major walls, plinths and tables; it is not a complete physics simulation. Room-scale headset motion cannot be physically constrained.
- Headset frame rate, comfort, sightlines, 80–120-person capacity and exact landmark alignment need on-device/client validation. They are not certified by desktop tests.

## Verification

Live HTTP and browser checks passed: specified spawn, inside/outside and core collision cases, eight plinths and lift interaction, full four-second mark animation, lighting and Arena mode changes, error-free WebGL render, and GLB v2 binary export via the actual download button. About **241,892 triangles**, under the 300,000 target. Static instancing is retained. Draw calls depend on camera and quality mode; the Threshold hero view measures about 63 calls with its desktop reflection, while wider views cost more. Headset behavior remains untested on hardware.

## Dependency security review

Target: official npm `three@0.180.0`; scope: browser-only local modules, no package install or lifecycle execution. Registry identity, canonical `mrdoob/three.js` source, MIT license, manifest, absence of runtime dependencies/install hooks, and consumed module imports were checked. No dynamic evaluation or environment access found in consumed rendering/export modules. Fetch code in Three.js core is loader infrastructure; no model/texture URL loader is used by this app. Package SHA256 and registry integrity are recorded in `review/provenance.json`. Original archive retained under review. Classification: **approved with mitigations** (pinned local files, no shell hooks, no runtime remote code imports). Automated CVE, secret, and deep scanners were not run; this is a bounded manual inspection, not a comprehensive security audit. To stop serving, stop the Python server; there is no global installation or persistence.


## Threshold visual study — November 1, 2026

Open [the visual review](http://localhost:8088/review.html) for equal-camera before/after captures and the supplied PDF target. The new `threshold.js` module adds locally served PBR surface maps, procedural terrazzo, 5,652 leaf cards and 789 branches/stems, a rounded planter bench, a continuous curved route with soft light falloff, warm interior light pools, contact-shadow textures, a directional shadow map, a blurred desktop-only floor reflection, a sunset environment, detailed façade textures and landmark trim. Furniture and room coordinates remain CAD-led.

Use **View: Threshold / Arrival / Landmark** to compare framing. **Hide UI** or H provides an unobstructed view. **Quality: Lightweight** disables the extra planar-reflection render and directional shadow. Entering VR automatically disables those desktop effects; environment materials, contact-shadow textures and instanced foliage remain.

This is an improved real-time material/lighting study, not photoreal parity with the concept renders. Full baked indirect illumination, photo-quality furniture/shoes, scanned plants, crowds, and georeferenced exterior detail remain outside this first Threshold pass. Other zones retain their initial furniture geometry, though shared materials and the exterior benefit globally. PDF image composition differs from the CAD layout; no columns were moved to force an image match. The stated westward Threshold sightline also intersects the specified west-wing column at CAD (3.8, 39.9), so the Landmark review camera is in the Arena rather than claiming that sightline is unobstructed.

Updated `world.glb` contains the default visible geometry and standard materials, including the new botanical instances and local textures. Desktop planar reflections, shader sky, dynamic shadow maps and the viewer's lighting are rendering features and are not baked into the GLB. Imported appearance depends on the destination viewer's environment and support for `EXT_mesh_gpu_instancing`.

Asset provenance and license details are in `assets/README.md`; live check results and camera metadata are in `evidence/verification.json`. Original source snapshot, model and images are retained in `evidence/`.
