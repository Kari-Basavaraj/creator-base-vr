// Each room has its own frequency, texture and slow pulse.
const rooms = {
  lobby: [55, 160, .032, .24], threshold: [82, 480, .047, .46],
  lounge: [110, 760, .033, .31], lab: [165, 1100, .030, .8],
  path: [98, 640, .044, .65], fuel: [73, 330, .035, .19],
  arena: [49, 570, .060, .92], imprint: [130, 870, .042, .23],
  workshop: [146, 1450, .036, .71], studio: [65, 235, .019, .16],
  suite: [92, 300, .016, .13], team: [61, 210, .018, .12]
};

export function createSpatialAudio(zones) {
  let context, master, noise, activeZone, enabled = false, requested = false, revision = 0;
  const channels = new Map();
  function init() {
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  }
  function roomChannel(key) {
    if (channels.has(key)) return channels.get(key);
    const [frequency, cutoff, volume, rate] = rooms[key];
    const tone = context.createOscillator();
    tone.frequency.value = frequency;
    const overtone = context.createOscillator();
    overtone.frequency.value = frequency * 3;
    const overtoneGain = context.createGain();
    overtoneGain.gain.value = .28;
    const texture = context.createBufferSource();
    texture.buffer = noise;
    texture.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = cutoff;
    const textureGain = context.createGain();
    textureGain.gain.value = .38;
    const bed = context.createGain();
    bed.gain.value = .55;
    const pulse = context.createOscillator();
    pulse.frequency.value = rate;
    const depth = context.createGain();
    depth.gain.value = .1;
    pulse.connect(depth).connect(bed.gain);
    tone.connect(bed);
    overtone.connect(overtoneGain).connect(bed);
    texture.connect(filter).connect(textureGain).connect(bed);
    const gain = context.createGain();
    gain.gain.value = 0;
    const pan = context.createPanner();
    const [x, y] = zones[key].point;
    pan.positionX.value = x + 1.5;
    pan.positionY.value = 1.7;
    pan.positionZ.value = -y - 2;
    pan.rolloffFactor = .35;
    pan.refDistance = 2;
    // Keep a room-wide bed audible while the emitter adds directional detail.
    const roomBed = context.createGain();
    roomBed.gain.value = .7;
    bed.connect(gain);
    gain.connect(roomBed).connect(master);
    gain.connect(pan).connect(master);
    tone.start(); overtone.start(); texture.start(); pulse.start();
    const channel = {gain, volume};
    channels.set(key, channel);
    return channel;
  }
  async function setEnabled(target, zone) {
    requested = target;
    const request = ++revision;
    if (!context) init();
    if (target && context.state !== 'running') await context.resume();
    if (request !== revision) return enabled;
    enabled = target && context.state === 'running';
    master.gain.setTargetAtTime(enabled ? 2.4 : 0, context.currentTime, .14);
    if (enabled) selectRoom(zone);
    return enabled;
  }
  function selectRoom(zone) {
    if (zone === activeZone || !rooms[zone]) return;
    const next = roomChannel(zone);
    for (const channel of channels.values()) {
      channel.gain.gain.setTargetAtTime(channel === next ? channel.volume : 0, context.currentTime, .56);
    }
    activeZone = zone;
  }
  function tick(zone, position, direction) {
    if (!enabled) return;
    const listener = context.listener;
    listener.positionX.value = position.x;
    listener.positionY.value = position.y;
    listener.positionZ.value = position.z;
    listener.forwardX.value = direction.x;
    listener.forwardY.value = direction.y;
    listener.forwardZ.value = direction.z;
    selectRoom(zone);
  }
  return {
    toggle: zone => setEnabled(context?.state === 'running' ? !requested : true, zone),
    enable: zone => setEnabled(true, zone),
    tick
  };
}
