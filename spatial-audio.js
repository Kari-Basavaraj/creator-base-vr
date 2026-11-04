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
  let context, master, noise, activeZone, enabled = false, pending = false;
  const channels = new Map();
  let lastX, lastZ, stride = 0, nextStep = 0;
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
    const texture = context.createBufferSource();
    texture.buffer = noise;
    texture.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = cutoff;
    const textureGain = context.createGain();
    textureGain.gain.value = .38;
    const bed = context.createGain();
    bed.gain.value = .25;
    const pulse = context.createOscillator();
    pulse.frequency.value = rate;
    const depth = context.createGain();
    depth.gain.value = .1;
    pulse.connect(depth).connect(bed.gain);
    tone.connect(bed);
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
    bed.connect(gain).connect(pan).connect(master);
    tone.start(); texture.start(); pulse.start();
    const channel = {gain, volume};
    channels.set(key, channel);
    return channel;
  }
  function footstep(zone) {
    const now = context.currentTime;
    const soft = ['fuel', 'team', 'studio', 'suite'].includes(zone);
    const scuff = context.createBufferSource();
    scuff.buffer = noise;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = (soft ? 580 : 1900) * (.8 + Math.random() * .4);
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(.001, now);
    envelope.gain.linearRampToValueAtTime(soft ? .08 : .14, now + .012);
    envelope.gain.exponentialRampToValueAtTime(.001, now + .18);
    scuff.connect(filter).connect(envelope).connect(master);
    scuff.start(now, Math.random());
    scuff.stop(now + .19);
    const heel = context.createOscillator();
    const impact = context.createGain();
    heel.frequency.setValueAtTime(115 + Math.random() * 28, now);
    heel.frequency.exponentialRampToValueAtTime(49, now + .075);
    impact.gain.setValueAtTime(soft ? .021 : .04, now);
    impact.gain.exponentialRampToValueAtTime(.001, now + .1);
    heel.connect(impact).connect(master);
    heel.start(now);
    heel.stop(now + .11);
  }
  async function toggle() {
    if (pending) return enabled;
    pending = true;
    try {
      if (!context) init();
      if (!enabled) await context.resume();
      enabled = !enabled;
      master.gain.setTargetAtTime(enabled ? .65 : 0, context.currentTime, .14);
      resetStride();
      return enabled;
    } finally { pending = false; }
  }
  function resetStride() {
    lastX = lastZ = undefined;
    stride = 0;
  }
  function tick(zone, position, direction, dt, walking) {
    if (!enabled) return;
    const now = context.currentTime;
    const listener = context.listener;
    listener.positionX.value = position.x;
    listener.positionY.value = position.y;
    listener.positionZ.value = position.z;
    listener.forwardX.value = direction.x;
    listener.forwardY.value = direction.y;
    listener.forwardZ.value = direction.z;
    if (zone !== activeZone && rooms[zone]) {
      const next = roomChannel(zone);
      for (const channel of channels.values()) {
        channel.gain.gain.setTargetAtTime(channel === next ? channel.volume : 0, now, .56);
      }
      activeZone = zone;
    }
    if (!walking) { resetStride(); return; }
    const distance = lastX === undefined ? 0 : Math.hypot(position.x - lastX, position.z - lastZ);
    lastX = position.x;
    lastZ = position.z;
    if (distance > Math.max(.18, dt * 3.5)) { stride = 0; return; }
    stride += distance;
    if (stride >= .68 && now >= nextStep) {
      stride -= .68;
      nextStep = now + .24;
      footstep(zone);
    }
  }
  return {toggle, tick, resetStride};
}
