// =====================================================================
// VAJRON Inspection UAS: procedural model for the website renders
// Built from the aircraft reference images: grey chamfered body with the
// VAJRON mark, a faceted top dome on four posts with a white sensor collar,
// RTK mast and upward sensors on the dome, dark olive carbon arms in an X
// with red end caps and root clamps, white motors, two-blade props, a
// ribbed black belly with a dual-lens downward sensor, a 3-axis gimbal
// camera under the nose, a battery tray and four retractable legs.
// Units: metres. Axes: +X forward, +Y up, +Z right.
// =====================================================================

export const LAYOUT = {
  R: 0.4,                           // centre to motor axis
  propR: 0.2,
  armAngles: [45, 135, -135, -45],  // degrees from +X towards +Z
  footY: -0.272,
};

export function buildUAS(THREE) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const root = new THREE.Group(); root.name = 'VAJRON-UAS';
  const M = makeMaterials(THREE);
  const parts = { rotors: [], legs: [], gimbal: null };
  const mesh = (g, m, name) => { const o = new THREE.Mesh(g, m); o.castShadow = true; o.receiveShadow = true; if (name) o.name = name; return o; };
  const deg = (d) => d * Math.PI / 180;

  // rounded, bevelled box built from an extruded rounded rectangle (XZ footprint, extruded along Y)
  function rbox(w, d, h, r, bevel, mat) {
    const s = new THREE.Shape(), x = w / 2 - r, z = d / 2 - r;
    s.moveTo(-x, -d / 2); s.lineTo(x, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, -z); s.lineTo(w / 2, z);
    s.quadraticCurveTo(w / 2, d / 2, x, d / 2); s.lineTo(-x, d / 2); s.quadraticCurveTo(-w / 2, d / 2, -w / 2, z);
    s.lineTo(-w / 2, -z); s.quadraticCurveTo(-w / 2, -d / 2, -x, -d / 2);
    const g = new THREE.ExtrudeGeometry(s, { depth: h - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 6 });
    g.rotateX(Math.PI / 2); g.translate(0, h / 2 - bevel, 0);
    return mesh(g, mat);
  }
  function rod(a, b, r, mat, seg = 20) {
    const m = mesh(new THREE.CylinderGeometry(r, r, a.distanceTo(b), seg), mat);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize());
    return m;
  }
  function lens(r, depth, at, dir, ring = M.silver) {
    const g = new THREE.Group();
    const barrel = mesh(new THREE.CylinderGeometry(r * 1.18, r * 1.25, depth, 40), M.blackGloss); g.add(barrel);
    const rim = mesh(new THREE.TorusGeometry(r * 1.08, r * 0.1, 10, 40), ring); rim.rotation.x = Math.PI / 2; rim.position.y = depth / 2; g.add(rim);
    const glass = mesh(new THREE.SphereGeometry(r, 40, 16, 0, Math.PI * 2, 0, Math.PI * 0.32), M.glass); glass.position.y = depth / 2 - r * 0.86; g.add(glass);
    g.position.copy(at); g.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
    return g;
  }

  // ---------------------------------------------------------------
  // body, belly and logo
  // ---------------------------------------------------------------
  const body = rbox(0.2, 0.156, 0.058, 0.03, 0.009, M.body); body.position.y = -0.012; root.add(body);
  {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128;
    const c = cv.getContext('2d');
    c.fillStyle = '#3f7fe0'; c.font = 'italic 800 86px Manrope, "Helvetica Neue", Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.save(); c.transform(1, 0, -0.12, 1, 0, 0); c.fillText('VAJRON', 268, 68); c.restore();
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.025), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.4 }));
    logo.position.set(0.1 + 0.009 + 0.0007, -0.012, 0); logo.rotation.y = Math.PI / 2; root.add(logo);
  }
  const belly = rbox(0.19, 0.13, 0.042, 0.022, 0.005, M.belly); belly.position.y = -0.054; root.add(belly);
  // dual-lens downward sensor in the belly
  [-1, 1].forEach((s) => { root.add(lens(0.011, 0.006, V(-0.03, -0.0765, s * 0.016), V(0, -1, 0), M.black)); });
  { const pad = rbox(0.036, 0.062, 0.004, 0.006, 0.001, M.black); pad.position.set(-0.03, -0.0765, 0); root.add(pad); }
  // small forward vision sensor on the belly front
  root.add(lens(0.008, 0.006, V(0.1025, -0.054, 0), V(1, 0, 0)));
  // battery tray at the rear of the belly
  { const tray = rbox(0.06, 0.12, 0.036, 0.008, 0.003, M.blackSoft); tray.position.set(-0.122, -0.045, 0); root.add(tray);
    const slot = mesh(new THREE.BoxGeometry(0.002, 0.012, 0.09), M.hole); slot.position.set(-0.1556, -0.045, 0); root.add(slot); }

  // ---------------------------------------------------------------
  // top: posts, white sensor collar, faceted dome, RTK mast, upward sensors
  // ---------------------------------------------------------------
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => root.add(rod(V(sx * 0.047, 0.044, sz * 0.047), V(sx * 0.047, 0.088, sz * 0.047), 0.0085, M.black)));
  {
    const collar = mesh(new THREE.CylinderGeometry(0.05, 0.052, 0.034, 48), M.white); collar.position.y = 0.064; root.add(collar);
    const band = mesh(new THREE.CylinderGeometry(0.0525, 0.0525, 0.003, 48), M.glowPurple); band.position.y = 0.049; root.add(band);
    const win = mesh(new THREE.BoxGeometry(0.01, 0.012, 0.052), M.blackGloss); win.position.set(0.049, 0.068, 0); root.add(win);
    const g1 = mesh(new THREE.SphereGeometry(0.0045, 16, 12), M.glowGreen); g1.position.set(0.054, 0.068, -0.013); root.add(g1);
    const g2 = mesh(new THREE.SphereGeometry(0.0045, 16, 12), M.glowBlue); g2.position.set(0.054, 0.068, 0.013); root.add(g2);
  }
  {
    const prof = [[0.0, 0.086], [0.098, 0.086], [0.1, 0.092], [0.1, 0.168], [0.094, 0.184], [0.074, 0.203], [0.03, 0.209], [0.0, 0.209]].map(([r, y]) => new THREE.Vector2(r, y));
    const dome = mesh(new THREE.LatheGeometry(prof, 8, Math.PI / 8, Math.PI * 2), M.dome, 'dome');
    root.add(dome);
    // raised vertical ribs on the eight facet joints
    for (let i = 0; i < 8; i++) {                         // on the facet joints
      const a = Math.PI / 8 + i * Math.PI / 4;
      const rib = mesh(new THREE.BoxGeometry(0.008, 0.074, 0.011), M.dome); rib.position.set(Math.cos(a) * 0.1, 0.13, Math.sin(a) * 0.1); rib.rotation.y = -a; root.add(rib);
    }
    // front lens on the dome
    root.add(lens(0.0095, 0.008, V(0.0965, 0.15, 0), V(1, 0, 0)));
    // RTK mast on top
    root.add(rod(V(-0.012, 0.209, 0), V(-0.012, 0.236, 0), 0.0115, M.black, 28));
    const cap = mesh(new THREE.SphereGeometry(0.0115, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.black); cap.position.set(-0.012, 0.236, 0); root.add(cap);
    // upward dual-lens LiDAR module and a small vision window
    const up = rbox(0.022, 0.05, 0.012, 0.004, 0.002, M.black); up.position.set(0.045, 0.207, 0); root.add(up);
    [-1, 1].forEach((s) => root.add(lens(0.0072, 0.004, V(0.045, 0.2155, s * 0.013), V(0, 1, 0), M.black)));
    root.add(lens(0.005, 0.003, V(-0.05, 0.207, 0.035), V(0, 1, 0)));
  }

  // ---------------------------------------------------------------
  // arms, motors, props
  // ---------------------------------------------------------------
  function blade(radius, rootR, chord) {
    const N = 16, prof = [], pos = [], idx = [];
    for (let i = 0; i <= 10; i++) { const x = (1 - Math.cos(Math.PI * i / 10)) / 2; prof.push([x, 0.06 * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4) * 5]); }
    const P2 = prof.slice().reverse().concat(prof.slice(1, -1).map(([x, y]) => [x, -y * 0.4]));
    for (let i = 0; i <= N; i++) {
      const k = i / N, r = rootR + (radius - rootR) * k, ch = chord * (0.7 + 0.8 * k - 1.05 * k * k) + 0.006;
      const tw = deg(16 - 10 * k), cd = V(0, -Math.sin(tw), Math.cos(tw)), td = V(0, Math.cos(tw), Math.sin(tw));
      const sweep = 0.02 * k * k;
      const o = V(r, 0, -ch * 0.35 + sweep);
      for (const [x, y] of P2) { const p = o.clone().addScaledVector(cd, x * ch).addScaledVector(td, y * ch); pos.push(p.x, p.y, p.z); }
    }
    const P = P2.length;
    for (let s = 0; s < N; s++) for (let i = 0; i < P; i++) { const a = s * P + i, b = s * P + (i + 1) % P, c = a + P, d = b + P; idx.push(a, c, b, b, c, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  const bladeG = blade(LAYOUT.propR, 0.02, 0.034);
  const bladeGM = bladeG.clone(); bladeGM.applyMatrix4(new THREE.Matrix4().makeScale(1, 1, -1));
  { const ix = bladeGM.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } bladeGM.computeVertexNormals(); }
  function blurDisc(r) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const c = cv.getContext('2d'); const gr = c.createRadialGradient(128, 128, 10, 128, 128, 128);
    gr.addColorStop(0, 'rgba(70,72,76,0)'); gr.addColorStop(0.12, 'rgba(70,72,76,.3)'); gr.addColorStop(0.6, 'rgba(90,92,96,.16)');
    gr.addColorStop(0.95, 'rgba(120,122,126,.14)'); gr.addColorStop(1, 'rgba(120,122,126,0)');
    c.fillStyle = gr; c.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 64), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.renderOrder = 2; return m;
  }

  LAYOUT.armAngles.forEach((a, k) => {
    const d = V(Math.cos(deg(a)), 0, Math.sin(deg(a))), side = V(-d.z, 0, d.x);
    const P = (r, y = 0) => d.clone().multiplyScalar(r).setY(y);
    // olive arm bracket at the body corner
    const br = rbox(0.05, 0.034, 0.03, 0.006, 0.003, M.olive); br.position.copy(P(0.098, -0.004)); br.rotation.y = -deg(a); root.add(br);
    root.add(rod(P(0.1), P(LAYOUT.R + 0.035), 0.0125, M.carbon));
    // red root clamp and red end cap
    const clamp = mesh(new THREE.CylinderGeometry(0.0158, 0.0158, 0.022, 28), M.red); clamp.position.copy(P(0.175)); clamp.quaternion.setFromUnitVectors(V(0, 1, 0), d); root.add(clamp);
    const endc = mesh(new THREE.CylinderGeometry(0.0172, 0.0172, 0.03, 28), M.red); endc.position.copy(P(LAYOUT.R + 0.028)); endc.quaternion.setFromUnitVectors(V(0, 1, 0), d); root.add(endc);
    const endHole = mesh(new THREE.CircleGeometry(0.0105, 24), M.hole); endHole.position.copy(P(LAYOUT.R + 0.0435)); endHole.lookAt(endHole.position.clone().add(d)); root.add(endHole);
    const endRing = mesh(new THREE.TorusGeometry(0.0138, 0.0034, 10, 28), M.red); endRing.position.copy(P(LAYOUT.R + 0.0432)); endRing.lookAt(endRing.position.clone().add(d)); root.add(endRing);
    // motor mount block, white motor with black bands, black top cap
    const mp = P(LAYOUT.R);
    const mount = rbox(0.05, 0.04, 0.016, 0.008, 0.002, M.black); mount.position.copy(mp).add(V(0, 0.01, 0)); mount.rotation.y = -deg(a); root.add(mount);
    const motor = mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.03, 40), M.motorWhite); motor.position.copy(mp).add(V(0, 0.033, 0)); root.add(motor);
    [0.024, 0.041].forEach((y) => { const b = mesh(new THREE.CylinderGeometry(0.0263, 0.0263, 0.004, 40), M.black); b.position.copy(mp).add(V(0, y, 0)); root.add(b); });
    const top = mesh(new THREE.CylinderGeometry(0.021, 0.025, 0.006, 40), M.black); top.position.copy(mp).add(V(0, 0.051, 0)); root.add(top);
    const prop = new THREE.Group(); prop.position.copy(mp).add(V(0, 0.058, 0));
    const hub = mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.01, 24), M.black); prop.add(hub);
    const cw = k % 2 === 0;
    [0, Math.PI].forEach((r) => { const b = mesh(cw ? bladeGM : bladeG, M.blade); b.rotation.y = r; b.castShadow = false; prop.add(b); });
    const disc = blurDisc(LAYOUT.propR * 1.01); disc.position.copy(prop.position);
    root.add(prop, disc);
    parts.rotors.push({ prop, disc, blades: prop.children.slice(1), dir: cw ? -1 : 1, angle: k * 0.9 + 0.4, speed: 0 });
  });

  // ---------------------------------------------------------------
  // 3-axis gimbal camera under the nose, with a sensor block below it
  // ---------------------------------------------------------------
  {
    const g = new THREE.Group(); g.position.set(0.045, -0.075, 0);
    const plate = rbox(0.05, 0.05, 0.008, 0.008, 0.002, M.black); plate.position.y = 0.0; g.add(plate);
    const yawRing = mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.014, 28), M.blackGloss); yawRing.position.y = -0.009; g.add(yawRing);
    const yoke = new THREE.Group(); yoke.position.y = -0.017; g.add(yoke);
    const bar = rbox(0.03, 0.116, 0.008, 0.004, 0.002, M.blackGloss); yoke.add(bar);
    [-1, 1].forEach((s) => { const arm = rbox(0.03, 0.01, 0.062, 0.004, 0.002, M.blackGloss); arm.position.set(0, -0.031, s * 0.054); yoke.add(arm); });
    const tilt = new THREE.Group(); tilt.position.y = -0.05; yoke.add(tilt);
    const cam = rbox(0.1, 0.092, 0.084, 0.022, 0.008, M.cam); cam.position.set(0.005, 0, 0); tilt.add(cam);
    tilt.add(lens(0.03, 0.026, V(0.058, 0, 0), V(1, 0, 0), M.blackGloss));
    const small = rbox(0.05, 0.07, 0.02, 0.006, 0.003, M.greyBox); small.position.set(0.0, -0.121, 0); g.add(small);
    root.add(g);
    parts.gimbal = { g, yoke, tilt };
  }

  // ---------------------------------------------------------------
  // retractable landing gear: four olive legs with black knees and feet
  // ---------------------------------------------------------------
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
    const pivot = new THREE.Group(); pivot.position.set(sx * 0.055, -0.06, sz * 0.058); root.add(pivot);
    const foot = V(sx * 0.075, LAYOUT.footY + 0.06 + 0.012, sz * 0.085);    // relative to the pivot
    pivot.add(rod(V(0, 0, 0), foot, 0.0095, M.olive, 16));
    const knee = mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.026, 18), M.black); knee.position.copy(foot).multiplyScalar(0.32); knee.quaternion.setFromUnitVectors(V(0, 1, 0), foot.clone().normalize()); pivot.add(knee);
    const cap = mesh(new THREE.CapsuleGeometry(0.0125, 0.03, 6, 16), M.rubber); cap.position.copy(foot).add(foot.clone().normalize().multiplyScalar(0.01)); cap.quaternion.setFromUnitVectors(V(0, 1, 0), foot.clone().normalize()); pivot.add(cap);
    const hinge = mesh(new THREE.BoxGeometry(0.03, 0.02, 0.03), M.black); pivot.add(hinge);
    parts.legs.push({ pivot, sx, sz });
  });

  let mode = 'parked';
  const SPIN = 38;
  function setGear(k) {           // 1 deployed, 0 retracted (legs swing up and outwards)
    parts.legs.forEach(({ pivot, sx, sz }) => { const t = (1 - k) * deg(62); pivot.rotation.set(-sz * t * 0.72, 0, sx * t * 0.72); });
  }
  function aimGimbal(pan, tilt) { parts.gimbal.yoke.rotation.y = pan; parts.gimbal.tilt.rotation.z = tilt; }
  function spin(speed, dt) {
    parts.rotors.forEach((r) => {
      r.speed = speed; r.angle += r.dir * SPIN * speed * dt; r.prop.rotation.y = r.angle;
      r.disc.material.opacity = Math.min(1, Math.max(0, (speed - 0.25) / 0.5)) * 0.8;
      r.blades.forEach((b) => { b.material = speed > 0.6 ? M.bladeFade : M.blade; });
    });
  }
  return { group: root, parts, materials: M, setGear, aimGimbal, spin, get mode() { return mode; } };
}

function makeMaterials(THREE) {
  const carbonTex = (() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d');
    c.fillStyle = '#262c21'; c.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 8) for (let x = 0; x < 64; x += 8) { c.fillStyle = ((x + y) / 8) % 2 ? '#2c3326' : '#20251c'; c.fillRect(x, y, 8, 8); }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 40); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const bellyTex = (() => {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const c = cv.getContext('2d');
    c.fillStyle = '#16171a'; c.fillRect(0, 0, 256, 128);
    for (let x = 6; x < 256; x += 12) { c.fillStyle = '#0b0b0d'; c.fillRect(x, 10, 5, 108); c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(x + 5, 10, 1, 108); }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(0.1, 0.1); return t;
  })();
  const body = new THREE.MeshPhysicalMaterial({ color: 0x5b5e63, roughness: 0.5, metalness: 0.08, clearcoat: 0.25, clearcoatRoughness: 0.5 });
  const dome = new THREE.MeshPhysicalMaterial({ color: 0x4d5055, roughness: 0.55, metalness: 0.06, clearcoat: 0.2, clearcoatRoughness: 0.55, flatShading: true });
  const belly = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: bellyTex, roughness: 0.6, metalness: 0.2 });
  const black = new THREE.MeshPhysicalMaterial({ color: 0x141517, roughness: 0.5, metalness: 0.1 });
  const blackSoft = new THREE.MeshPhysicalMaterial({ color: 0x1b1c1f, roughness: 0.62, metalness: 0.05 });
  const blackGloss = new THREE.MeshPhysicalMaterial({ color: 0x0e0f11, roughness: 0.28, metalness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const cam = new THREE.MeshPhysicalMaterial({ color: 0x151619, roughness: 0.38, metalness: 0.15, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const greyBox = new THREE.MeshPhysicalMaterial({ color: 0x55585d, roughness: 0.5, metalness: 0.1 });
  const carbon = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: carbonTex, roughness: 0.4, metalness: 0.2, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const olive = new THREE.MeshPhysicalMaterial({ color: 0x2a3124, roughness: 0.45, metalness: 0.1, clearcoat: 0.4, clearcoatRoughness: 0.35 });
  const red = new THREE.MeshPhysicalMaterial({ color: 0xd8342a, roughness: 0.35, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const white = new THREE.MeshPhysicalMaterial({ color: 0xe9eaec, roughness: 0.32, metalness: 0.02, clearcoat: 0.6 });
  const motorWhite = new THREE.MeshPhysicalMaterial({ color: 0xe4e6e8, roughness: 0.3, metalness: 0.35, clearcoat: 0.5 });
  const silver = new THREE.MeshStandardMaterial({ color: 0xc9cdd3, roughness: 0.22, metalness: 1 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x0b0a14, roughness: 0.04, metalness: 0.2, clearcoat: 1, iridescence: 1, iridescenceIOR: 1.8, iridescenceThicknessRange: [250, 600] });
  const hole = new THREE.MeshStandardMaterial({ color: 0x040405, roughness: 0.5 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 0.85 });
  const blade = new THREE.MeshPhysicalMaterial({ color: 0x35373b, roughness: 0.4, metalness: 0.1, clearcoat: 0.5, side: THREE.DoubleSide });
  const bladeFade = blade.clone(); bladeFade.transparent = true; bladeFade.opacity = 0.14; bladeFade.depthWrite = false;
  const glowGreen = new THREE.MeshBasicMaterial({ color: 0x5cff8a });
  const glowBlue = new THREE.MeshBasicMaterial({ color: 0x3f7bff });
  const glowPurple = new THREE.MeshBasicMaterial({ color: 0x9b7bff });
  return { body, dome, belly, black, blackSoft, blackGloss, cam, greyBox, carbon, olive, red, white, motorWhite, silver, glass, hole, rubber, blade, bladeFade, glowGreen, glowBlue, glowPurple };
}
