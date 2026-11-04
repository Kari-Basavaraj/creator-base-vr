import * as T from 'three';

export function createQuestControls({renderer, scene, rig, viewerPose, isTracking, valid, move, floorHeight, interact, actions, onTurn}) {
  const panelCanvas = document.createElement('canvas');
  panelCanvas.width = 1024;
  panelCanvas.height = 1024;
  const ctx = panelCanvas.getContext('2d');
  const texture = new T.CanvasTexture(panelCanvas);
  texture.colorSpace = T.SRGBColorSpace;
  const panel = new T.Mesh(new T.PlaneGeometry(.85, .85), new T.MeshBasicMaterial({map: texture}));
  panel.visible = false;
  scene.add(panel);

  const marker = new T.Mesh(new T.RingGeometry(.16, .22, 32), new T.MeshBasicMaterial({color: 0x90e9c1, side: T.DoubleSide}));
  marker.rotation.x = -Math.PI / 2;
  marker.visible = false;
  scene.add(marker);

  const raycaster = new T.Raycaster();
  const ground = new T.Plane(new T.Vector3(0, 1, 0));
  const rotation = new T.Matrix4();
  const head = new T.Vector3();
  const heading = new T.Vector3();
  const offset = new T.Vector3();
  const up = new T.Vector3(0, 1, 0);
  let smoothMove = true;
  let smoothTurn = true;
  let haptics = true;
  let teleportOwner = null;
  let hovered = -1;

  const rows = [
    ...actions,
    [() => 'Movement  /  ' + (smoothMove ? 'Stick + teleport' : 'Teleport only'), () => { smoothMove = !smoothMove; }],
    [() => 'Turning  /  ' + (smoothTurn ? 'Smooth' : '30° snap'), () => { smoothTurn = !smoothTurn; }],
    [() => 'Controller vibration  /  ' + (haptics ? 'On' : 'Off'), () => { haptics = !haptics; }],
    ['Close menu', () => { panel.visible = false; }]
  ];

  function drawMenu() {
    ctx.fillStyle = '#17231f';
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.fillStyle = '#f6f0df';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText('CREATOR BASE  /  QUEST', 48, 80);
    ctx.font = '29px sans-serif';
    ctx.fillText('Trigger: interact   ·   Hold grip: aim, release: teleport', 48, 132);
    ctx.fillText('Left stick: move   ·   Right stick: turn   ·   Stick click: menu', 48, 173);
    rows.forEach(([label], i) => {
      const y = 210 + i * 79;
      ctx.fillStyle = i === hovered ? '#426b57' : '#263b31';
      ctx.fillRect(48, y, 928, 68);
      ctx.fillStyle = '#f6f0df';
      ctx.font = '34px sans-serif';
      ctx.fillText(typeof label === 'function' ? label() : label, 76, y + 45);
    });
    texture.needsUpdate = true;
  }

  function toggleMenu() {
    panel.visible = !panel.visible;
    if (!panel.visible) return;
    const view = viewerPose;
    view.getWorldPosition(head);
    view.getWorldDirection(heading);
    heading.y = 0;
    if (heading.lengthSq() < .001) heading.set(0, 0, -1);
    panel.position.copy(head).addScaledVector(heading.normalize(), 1.35);
    panel.lookAt(head);
    panel.updateMatrixWorld(true);
    hovered = -1;
    drawMenu();
  }

  function pulse(state, strength = .25) {
    if (!haptics) return;
    try {
      state.source?.gamepad?.hapticActuators?.[0]?.pulse(strength, 45)?.catch?.(() => {});
    } catch { /* Optional browser capability. */ }
  }

  function aim(state) {
    state.controller.updateWorldMatrix(true, false);
    const matrix = state.controller.matrixWorld;
    raycaster.ray.origin.setFromMatrixPosition(matrix);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(rotation.extractRotation(matrix));
  }

  function menuRow() {
    const hit = raycaster.intersectObject(panel)[0];
    if (!hit) return -1;
    const y = (1 - hit.uv.y) * 1024 - 210;
    const i = Math.floor(y / 79);
    return i >= 0 && i < rows.length && y % 79 < 68 && hit.uv.x > .047 && hit.uv.x < .953 ? i : -1;
  }

  function destination(state) {
    aim(state);
    const point = state.destination;
    const origin = raycaster.ray.origin;
    if (!raycaster.ray.intersectPlane(ground, point)) return false;
    for (let i = 0; i < 3; i++) {
      ground.constant = -floorHeight(point.x, -point.z);
      const hit = raycaster.ray.intersectPlane(ground, point);
      ground.constant = 0;
      if (!hit) return false;
    }
    const distance = origin.distanceTo(point);
    if (distance > 8 || distance < .35 || Math.abs(point.y - floorHeight(point.x, -point.z)) > .05) return false;
    viewerPose.getWorldPosition(head);
    if (!valid(rig.position.x + point.x - head.x, -rig.position.z - point.z + head.z)) return false;
    // Validate the path against the same floor plan used by walking.
    const samples = Math.ceil(distance / .12);
    for (let i = 1; i <= samples; i++) {
      const t = i / samples;
      if (!valid(T.MathUtils.lerp(head.x, point.x, t), -T.MathUtils.lerp(head.z, point.z, t))) return false;
    }
    return true;
  }

  const hands = Array.from({length: 2}, (_, index) => {
    const controller = renderer.xr.getController(index);
    const grip = renderer.xr.getControllerGrip(index);
    rig.add(controller, grip);
    const body = new T.Mesh(new T.CapsuleGeometry(.024, .075, 4, 8), new T.MeshBasicMaterial({color: 0xe3dac8}));
    body.rotation.x = .45;
    grip.add(body);
    const beam = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3(0, 0, -1)]), new T.LineBasicMaterial({color: 0xdad5c9}));
    controller.add(beam);
    const state = {controller, beam, source: null, destination: new T.Vector3(), snapReady: true, buttons: []};
    controller.addEventListener('connected', ({data}) => {
      state.source = data;
      state.snapReady = true;
      state.buttons = data.gamepad?.buttons.map(button => button.pressed) ?? [];
      body.visible = data.targetRayMode === 'tracked-pointer' && !!data.gamepad;
    });
    controller.addEventListener('disconnected', () => {
      state.source = null;
      if (teleportOwner === state) {
        teleportOwner = null;
        marker.visible = false;
      }
    });
    controller.addEventListener('selectstart', () => {
      if (!isTracking() || !state.source || !controller.visible || teleportOwner) return;
      if (panel.visible) {
        aim(state);
        const row = menuRow();
        if (row >= 0) {
          rows[row][1]();
          pulse(state);
          drawMenu();
        }
        return;
      }
      if (interact(controller)) pulse(state);
    });
    controller.addEventListener('squeezestart', () => {
      if (isTracking() && !panel.visible && !teleportOwner && state.source?.gamepad) teleportOwner = state;
    });
    controller.addEventListener('squeezeend', () => {
      if (teleportOwner !== state) return;
      teleportOwner = null;
      marker.visible = false;
      if (isTracking() && !panel.visible && controller.visible && destination(state)) {
        rig.position.x += state.destination.x - head.x;
        rig.position.z += state.destination.z - head.z;
        rig.position.y = state.destination.y;
        rig.updateMatrixWorld(true);
        pulse(state, .5);
      }
    });
    return state;
  });

  function turn(angle) {
    viewerPose.getWorldPosition(head);
    offset.copy(head).sub(rig.position);
    rig.position.add(offset).sub(offset.clone().applyAxisAngle(up, angle));
    rig.rotation.y += angle;
    rig.updateMatrixWorld(true);
    onTurn(rig.rotation.y);
  }

  function tick(dt) {
    let row = -1;
    for (const state of hands) {
      const {source, controller, beam} = state;
      if (!source || !controller.visible) continue;
      const gamepad = source.gamepad;
      if (gamepad?.mapping === 'xr-standard') {
        const pressed = index => !!gamepad.buttons[index]?.pressed;
        const edge = index => pressed(index) && !state.buttons[index];
        const touch = source.profiles.some(profile => /oculus-touch|meta-quest/.test(profile));
        if (edge(3) || (touch && edge(4))) toggleMenu();
        if (touch && edge(5)) {
          panel.visible = false;
          if (teleportOwner === state) teleportOwner = null;
        }
        for (const index of [3, 4, 5]) state.buttons[index] = pressed(index);
        const x = gamepad.axes[2] ?? 0;
        const y = gamepad.axes[3] ?? 0;
        if (Math.abs(x) < .25) state.snapReady = true;
        if (!panel.visible && !teleportOwner) {
          if (source.handedness === 'left' && smoothMove && Math.hypot(x, y) > .2) {
            heading.set(0, 0, -1).applyAxisAngle(up, rig.rotation.y);
            const speed = dt * 1.5 / Math.max(1, Math.hypot(x, y));
            viewerPose.getWorldPosition(head);
            move((-heading.z * x - heading.x * y) * speed, (heading.x * x - heading.z * y) * speed, head);
          }
          if (source.handedness === 'right') {
            if (smoothTurn && Math.abs(x) > .22) turn(-x * dt * 1.35);
            if (!smoothTurn && Math.abs(x) > .72 && state.snapReady) {
              state.snapReady = false;
              turn(-Math.sign(x) * Math.PI / 6);
              pulse(state, .15);
            }
          }
        }
      }
      beam.scale.z = panel.visible ? 3 : 2.8;
      beam.material.color.set(0xdad5c9);
      if (panel.visible) {
        aim(state);
        const target = menuRow();
        if (target >= 0) {
          row = target;
          beam.material.color.set(0x90e9c1);
        }
      }
    }
    marker.visible = false;
    if (teleportOwner?.controller.visible && !panel.visible) {
      const allowed = destination(teleportOwner);
      teleportOwner.beam.material.color.set(allowed ? 0x90e9c1 : 0xff756b);
      if (allowed) {
        marker.visible = true;
        marker.position.copy(teleportOwner.destination);
        marker.position.y += .025;
        teleportOwner.beam.scale.z = raycaster.ray.origin.distanceTo(teleportOwner.destination);
      }
    }
    if (panel.visible && hovered !== row) {
      hovered = row;
      drawMenu();
    }
  }

  function reset() {
    panel.visible = false;
    marker.visible = false;
    teleportOwner = null;
    for (const hand of hands) hand.snapReady = true;
  }

  return {tick, reset};
}
