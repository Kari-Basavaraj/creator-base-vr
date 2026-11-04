// Filter frequency, level and slow modulation for each section.
const rooms = {
  lobby: [180, .055, .19], threshold: [480, .083, .24],
  lounge: [760, .069, .21], lab: [1100, .065, .28],
  path: [640, .074, .26], fuel: [330, .059, .14],
  arena: [570, .095, .32], imprint: [870, .075, .17],
  workshop: [1450, .078, .31], studio: [235, .039, .12],
  suite: [300, .036, .11], team: [210, .040, .10]
};

function startMusic(context, output) {
  // Original four-chord pad. Overlapping envelopes carry the last chord into the first.
  const chords = [[48, 55, 59, 62], [45, 52, 55, 59], [41, 48, 52, 55], [43, 50, 57, 62]];
  const rate = 16000;
  const chordSeconds = 8;
  const duration = chords.length * chordSeconds;
  const buffer = context.createBuffer(1, rate * duration, rate);
  const samples = buffer.getChannelData(0);
  for (const [index, chord] of chords.entries()) {
    const frequencies = chord.map(note => 440 * 2 ** ((note - 69) / 12));
    for (let i = 0; i < 10 * rate; i++) {
      const time = i / rate;
      const envelope = Math.min(1, time / 2, (10 - time) / 2);
      const weight = .5 - .5 * Math.cos(Math.PI * envelope);
      let sample = 0;
      for (const frequency of frequencies) {
        const phase = 2 * Math.PI * frequency * time;
        sample += Math.sin(phase) + .15 * Math.sin(2 * phase);
      }
      samples[(index * chordSeconds * rate + i) % samples.length] += sample * weight * .008;
    }
  }
  const music = context.createBufferSource();
  music.buffer = buffer;
  music.loop = true;
  const gain = context.createGain();
  gain.gain.value = .46;
  music.connect(gain).connect(output);
  music.start();
}

export function createSpatialAudio(zones) {
  let context, master, noise, activeZone, enabled = false, requested = false, revision = 0;
  const channels = new Map();
  function init() {
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    startMusic(context, master);
    noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  }
  function roomChannel(key) {
    if (channels.has(key)) return channels.get(key);
    const [cutoff, volume, rate] = rooms[key];
    const texture = context.createBufferSource();
    texture.buffer = noise;
    texture.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = cutoff;
    filter.Q.value = .45;
    const textureGain = context.createGain();
    textureGain.gain.value = 1;
    const bed = context.createGain();
    bed.gain.value = .55;
    const pulse = context.createOscillator();
    pulse.frequency.value = rate;
    const depth = context.createGain();
    depth.gain.value = .1;
    pulse.connect(depth).connect(bed.gain);
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
    texture.start(); pulse.start();
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
    master.gain.setTargetAtTime(enabled ? 1.5 : 0, context.currentTime, .14);
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
