import * as T from 'three';

// Small posed figures for scale and occupancy, built from shared geometry.
export function addVisitors(world) {
  const oval = new T.SphereGeometry(1, 12, 8);
  const limb = new T.CapsuleGeometry(1, 1, 3, 8);
  const material = color => new T.MeshStandardMaterial({color, roughness: .9});
  const hair = material('#26201b');
  const shoe = material('#ded7c8');
  const iris = material('#332720');
  const skin = ['#a97150', '#704932', '#bd8966', '#966041'].map(material);
  const outfits = ['#626e57', '#baa990', '#37454a', '#7e5751'].map(material);
  const trousers = ['#343739', '#514f43', '#293034', '#433c39'].map(material);

  function figure(name, x, y, heading, index) {
    const person = new T.Group();
    person.name = name;
    person.position.set(x, 0, -y);
    person.rotation.y = heading;
    world.add(person);
    function shape(geometry, mat, x, y, z, w, h, d, tilt = 0) {
      const mesh = new T.Mesh(geometry, mat);
      mesh.position.set(x, y, z);
      mesh.scale.set(w, h, d);
      mesh.rotation.z = tilt;
      person.add(mesh);
    }
    const tone = skin[index], top = outfits[index], pants = trousers[index];
    shape(oval, pants, 0, .89, 0, .15, .16, .102);
    shape(oval, top, 0, 1.17, 0, .185, .245, .106);
    shape(limb, tone, 0, 1.419, 0, .047, .041, .046);
    shape(oval, tone, 0, 1.55, .007, .083, .113, .083);
    shape(oval, hair, 0, 1.596, -.018, .086, .081, .076);
    shape(oval, tone, 0, 1.541, .079, .019, .027, .021);
    for (const side of [-1, 1]) {
      shape(oval, tone, side * .079, 1.549, 0, .013, .025, .018);
      shape(oval, iris, side * .032, 1.567, .079, .009, .005, .004);
      shape(limb, top, side * .18, 1.225, 0, .059, .084, .062, side * .21);
      shape(limb, tone, side * .227, 1.02, .015, .035, .09, .035, side * .08);
      shape(oval, tone, side * .234, .879, .02, .035, .059, .027);
      shape(limb, pants, side * .078, .65, 0, .071, .161, .069, side * .025);
      shape(limb, pants, side * .087, .31, 0, .055, .149, .053);
      shape(oval, shoe, side * .089, .051, .048, .058, .05, .111);
    }
  }

  figure('Welcome lounge host', 42.2, 39.0, -1.0, 0);
  figure('Discovery Lab visitor', 26.4, 38.1, 2.9, 1);
  figure('Co-Create workshop visitor', 17, 32.4, -1.2, 2);
  figure('Fuel Bar visitor', 11.1, 38.0, .4, 3);
}
