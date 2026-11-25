// XgoDuck web sim: loads MuJoCo (WASM) and the policy, renders with three.js, drives the duck from keys / touch.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DuckSim, CONTROL_DT } from './sim_core.js';

const BG = 0x0b0c0e;
const SKY = 0x78c7f2;
const WHITE = 0xf2f2f0;
const SKY_PARTS = new Set(['trunk_base', 'head_roll', 'left_hip_pitch', 'right_hip_pitch']); // chest, hat, knee plates
const TILE = 0.1; // m
const PUSH = 0.3; // m/s, the size of the training pushes
const RATE = [0.8, 0.6, 3.0]; // command ramp per second (vx, vy, wz)
const $ = id => document.getElementById(id);
const label = s => s[0].toUpperCase() + s.slice(1);
const app = $('app');
const params = new URLSearchParams(location.search);
const touch = matchMedia('(pointer: coarse)').matches;
if (touch) app.classList.add('touch');
if (params.get('poster') === '1') app.classList.add('poster');

// ---------------------------------------------------------------- loading
async function fetchWithProgress(url, onBytes) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
  if (!r.body) { const b = await r.arrayBuffer(); onBytes(b.byteLength); return b; }
  const reader = r.body.getReader(), parts = [];
  let n = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    n += value.length;
    onBytes(value.length);
  }
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) { out.set(p, o); o += p.length; }
  return out.buffer;
}

async function loadFiles(onProgress) {
  const manifest = await (await fetch('manifest.json', { cache: 'no-cache' })).json();
  const total = manifest.files.reduce((s, f) => s + f.bytes, 0);
  let got = 0;
  const files = {};
  await Promise.all(manifest.files.map(async f => {
    files[f.path] = await fetchWithProgress(`${f.path}?v=${f.hash}`, n => { got += n; onProgress(Math.min(got / total, 1), got, total); });
  }));
  return { files, manifest };
}

// ---------------------------------------------------------------- scene
function tileTexture(renderer) {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d'), s = 256;
  const tones = ['#15161a', '#0f1013'];
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    g.fillStyle = tones[(i + j) % 2];
    g.fillRect(i * s, j * s, s, s);
  }
  // a faint sheen gradient inside each tile so the glaze reads under the lights
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    const gr = g.createLinearGradient(i * s, j * s, i * s + s, j * s + s);
    gr.addColorStop(0, 'rgba(255,255,255,0.018)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(i * s, j * s, s, s);
  }
  g.fillStyle = '#2a2c32';
  for (let k = 0; k <= 2; k++) {
    g.fillRect(k * s - 2, 0, 4, 512);
    g.fillRect(0, k * s - 2, 512, 4);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

function studioEnvironment(renderer) {
  // a dark room with two soft boxes, for reflections on the duck's plastic and the glazed tiles
  const room = new THREE.Scene();
  room.add(new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0x0d0e10, side: THREE.BackSide })));
  const box = (w, h, x, y, z, color, intensity) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(x, y, z);
    m.lookAt(0, 0, 0);
    room.add(m);
  };
  box(3.2, 2.0, 2.6, 3.4, 2.2, 0xffffff, 3.2);
  box(2.4, 1.2, -3.2, 2.0, -2.0, 0xbfe3ff, 1.6);
  box(5.0, 0.6, 0, 4.8, -0.5, 0xffffff, 1.2);
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(room, 0.03).texture;
  pm.dispose();
  return env;
}

function buildDuck(model, blob) {
  const root = new THREE.Group(); // MuJoCo frame: z up
  const mat = color => new THREE.MeshStandardMaterial({ color, roughness: color === SKY ? 0.38 : 0.46, metalness: 0, envMapIntensity: 0.55 });
  const sky = mat(SKY), white = mat(WHITE);
  const geos = model.meshes.map(m => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(blob, m.vert_offset, m.vert_count * 3), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(blob, m.normal_offset, m.vert_count * 3), 3));
    g.setIndex(new THREE.BufferAttribute(new Uint32Array(blob, m.face_offset, m.face_count * 3), 1));
    g.computeBoundingSphere();
    return g;
  });
  const bodies = model.bodies.map(() => { const b = new THREE.Group(); root.add(b); return b; });
  for (const g of model.geoms) {
    const mesh = new THREE.Mesh(geos[g.mesh], SKY_PARTS.has(model.meshes[g.mesh].name) ? sky : white);
    mesh.position.set(g.pos[0], g.pos[1], g.pos[2]);
    mesh.quaternion.set(g.quat[1], g.quat[2], g.quat[3], g.quat[0]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    bodies[g.body].add(mesh);
  }
  return { root, bodies, ids: model.body_ids };
}

// ---------------------------------------------------------------- inputs view
function inputGroups(n) {  // 119 or 122 inputs (122: a 15-D last action and the beak track)
  const g = [['IMU (gyro, gravity)', 6], ['joint angles', 14], ['joint speeds', 14], ['last action', n === 122 ? 15 : 14], ['walk command', 3],
    ['head reference', 4], ['trunk reference', 6], ['emotion one-hot', 21], ['phase', 2], ['standing gate', 1], ['leg + sole reference', 12],
    ['reference 0.2 s ahead', 22]];
  if (n === 122) g.push(['beak reference', 2]);
  let at = 0;
  return g.map(([name, k]) => { const r = [name, at, k]; at += k; return r; });
}

function drawInputs(canvas, sim) {
  const dpr = Math.min(devicePixelRatio || 1, 2), cssW = canvas.clientWidth || 440;
  const GROUPS = inputGroups(sim.obs.length);
  const rowH = 17, rows = GROUPS.length + 1, cssH = rows * rowH + 8;
  if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.height = `${cssH}px`;
  }
  const g = canvas.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, cssW, cssH);
  const x0 = Math.min(150, cssW * 0.36), cw = (cssW - x0) / 22;
  const norm = sim.policy.bufs[0]; // the normalized observation the network just saw
  g.font = '11px ui-sans-serif, -apple-system, Segoe UI, sans-serif';
  g.textBaseline = 'middle';
  const cell = (x, y, v, active) => {
    const t = Math.tanh(v / 2.5), a = Math.min(1, Math.abs(t) * 1.1);
    g.fillStyle = 'rgba(255,255,255,0.05)';
    g.fillRect(x, y, cw - 2, rowH - 5);
    g.fillStyle = t >= 0 ? `rgba(120,199,242,${a})` : `rgba(240,164,106,${a})`;
    g.fillRect(x, y, cw - 2, rowH - 5);
    if (active) { g.strokeStyle = '#e9edf1'; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, cw - 3, rowH - 6); }
  };
  GROUPS.forEach(([name, at, n], r) => {
    const y = 4 + r * rowH;
    g.fillStyle = name.startsWith('emotion') ? '#e9edf1' : '#8d97a4';
    g.fillText(name, 0, y + (rowH - 5) / 2);
    for (let i = 0; i < n; i++) cell(x0 + i * cw, y, norm[at + i], name.startsWith('emotion') && i === sim.ref.cls);
  });
  const y = 4 + GROUPS.length * rowH;
  g.fillStyle = '#e9edf1';
  const nOut = sim.action ? sim.action.length : 10;
  g.fillText(nOut === 15 ? 'output: every servo (15)' : 'output: 10 leg targets', 0, y + (rowH - 5) / 2);
  for (let i = 0; i < nOut; i++) cell(x0 + i * cw, y, sim.action ? sim.action[i] * 6 : 0, false);
}

// ---------------------------------------------------------------- main
async function main() {
  $('btnStart').disabled = true;
  $('progress').hidden = false;
  $('progressText').hidden = false;
  const setP = (f, got, total) => {
    $('progressFill').style.width = `${(f * 100).toFixed(1)}%`;
    $('progressText').textContent = `Loading physics and policy · ${(got / 1e6).toFixed(1)} / ${(total / 1e6).toFixed(1)} MB`;
  };
  const { files, manifest } = await loadFiles(setP);
  $('progressText').textContent = 'Starting MuJoCo';
  const loadMujoco = (await import(`./mujoco/mujoco.js?v=${manifest.mujoco_js}`)).default;
  const mujoco = await loadMujoco({ wasmBinary: files['mujoco/mujoco.wasm'] });
  const sim = await DuckSim.create(mujoco, async p => files[`assets/${p}`], { seed: (Math.random() * 2 ** 31) | 0 });

  // renderer, scene, camera
  const canvas = $('view');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const TM = { none: THREE.NoToneMapping, agx: THREE.AgXToneMapping, aces: THREE.ACESFilmicToneMapping };
  renderer.toneMapping = TM[params.get('tm') || 'aces'];
  renderer.toneMappingExposure = Number(params.get('exp') || 1.5);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 1.4, 4.6);
  scene.environment = studioEnvironment(renderer);
  const world = new THREE.Group();
  world.rotation.x = -Math.PI / 2; // MuJoCo z-up inside, three.js y-up outside
  scene.add(world);

  const floorTex = tileTexture(renderer);
  const FLOOR = 24;
  floorTex.repeat.set(FLOOR / (2 * TILE), FLOOR / (2 * TILE));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(FLOOR, FLOOR),
    new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.24, metalness: 0, envMapIntensity: 0.35 }));
  floor.receiveShadow = true;
  world.add(floor);

  const duck = buildDuck(JSON.parse(new TextDecoder().decode(files['assets/render/model.json'])), files['assets/render/meshes.bin']);
  world.add(duck.root);
  const bodyName = id => mujoco.mj_id2name(sim.model, mujoco.mjtObj.mjOBJ_BODY.value, id);
  const renderModel = JSON.parse(new TextDecoder().decode(files['assets/render/model.json']));
  const mismatch = duck.ids.filter((id, i) => bodyName(id) !== renderModel.bodies[i]);
  if (mismatch.length) console.warn('render/physics body mismatch', mismatch);

  scene.add(new THREE.HemisphereLight(0xdfe8f2, 0x0b0c0e, 0.55));
  const key = new THREE.DirectionalLight(0xfff6ec, 2.3);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -0.5, right: 0.5, top: 0.5, bottom: -0.5, near: 0.1, far: 6 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.015;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xa9d8ff, 1.3);
  scene.add(rim, rim.target);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 40);
  camera.position.set(0.66, 0.3, -0.46);
  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, { enableDamping: true, dampingFactor: 0.08, enablePan: false, minDistance: 0.32, maxDistance: 2.6, maxPolarAngle: 1.47, rotateSpeed: 0.7 });
  controls.target.set(0, 0.105, 0);
  // embedded in a page: the wheel scrolls the page until the visitor clicks into the view
  controls.enableZoom = false;
  canvas.addEventListener('pointerdown', () => { controls.enableZoom = true; });
  document.documentElement.addEventListener('mouseleave', () => { controls.enableZoom = false; });

  const pushArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 0.2, SKY, 0.06, 0.036);
  pushArrow.traverse(o => { if (o.material) { o.material.depthTest = false; o.material.transparent = true; } o.renderOrder = 10; });
  pushArrow.visible = false;
  scene.add(pushArrow);

  // a soft pool of light on the tiles around the duck
  const pool = new THREE.SpotLight(0xffffff, 5.5, 0, 0.62, 1.0, 2);
  scene.add(pool, pool.target);

  function resize() {
    const w = app.clientWidth, h = app.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w / h < 0.9 ? 46 : 34;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();

  // pose interpolation between control ticks
  const nb = duck.ids.length;
  const pose = { p0: new Float64Array(3 * nb), q0: new Float64Array(4 * nb), p1: new Float64Array(3 * nb), q1: new Float64Array(4 * nb) };
  const snap = (P, Q) => {
    const xp = sim.data.xpos, xq = sim.data.xquat;
    duck.ids.forEach((id, i) => {
      for (let k = 0; k < 3; k++) P[3 * i + k] = xp[3 * id + k];
      for (let k = 0; k < 4; k++) Q[4 * i + k] = xq[4 * id + k];
    });
  };
  snap(pose.p1, pose.q1);
  pose.p0.set(pose.p1);
  pose.q0.set(pose.q1);
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
  function applyPose(alpha) {
    for (let i = 0; i < nb; i++) {
      const b = duck.bodies[i];
      b.position.set(
        pose.p0[3 * i] + (pose.p1[3 * i] - pose.p0[3 * i]) * alpha,
        pose.p0[3 * i + 1] + (pose.p1[3 * i + 1] - pose.p0[3 * i + 1]) * alpha,
        pose.p0[3 * i + 2] + (pose.p1[3 * i + 2] - pose.p0[3 * i + 2]) * alpha);
      qa.set(pose.q0[4 * i + 1], pose.q0[4 * i + 2], pose.q0[4 * i + 3], pose.q0[4 * i]);
      qb.set(pose.q1[4 * i + 1], pose.q1[4 * i + 2], pose.q1[4 * i + 3], pose.q1[4 * i]);
      b.quaternion.slerpQuaternions(qa, qb, alpha);
    }
  }

  // emotions
  const chips = $('chips');
  for (const name of sim.lib.classes) {
    const b = document.createElement('button');
    b.className = 'chip';
    b.type = 'button';
    b.textContent = label(name);
    b.dataset.emotion = name;
    b.setAttribute('aria-pressed', String(name === sim.emotion));
    b.addEventListener('click', () => { setEmotion(name); b.blur(); canvas.focus({ preventScroll: true }); });
    chips.append(b);
  }
  function setEmotion(name) {
    sim.setEmotion(name);
    for (const c of chips.children) c.setAttribute('aria-pressed', String(c.dataset.emotion === name));
    $('hudEmotion').textContent = label(name);
  }

  // toast
  let toastTimer = 0;
  function toast(text, ms = 1400) {
    const t = $('toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }

  // input
  const keys = new Set();
  const stick = { active: false, x: 0, y: 0 };
  let arrowUntil = 0;
  function push() {
    const a = Math.random() * 2 * Math.PI, vx = PUSH * Math.cos(a), vy = PUSH * Math.sin(a);
    sim.push(vx, vy);
    const q = sim.data.qpos;
    pushArrow.position.set(q[0] - 0.3 * Math.cos(a), q[2] + 0.03, -(q[1] - 0.3 * Math.sin(a)));
    pushArrow.setDirection(new THREE.Vector3(Math.cos(a), 0, -Math.sin(a)));
    pushArrow.visible = true;
    arrowUntil = performance.now() + 700;
  }
  function resetDuck(msg) {
    const q = sim.data.qpos;
    sim.reset({ x: q[0], y: q[1], yaw: sim.yaw });
    snap(pose.p1, pose.q1);
    pose.p0.set(pose.p1);
    pose.q0.set(pose.q1);
    if (msg) toast(msg);
  }
  function toggleInputs() {
    const el = $('inspector'), on = el.hidden;
    el.hidden = !on;
    $('btnInputs').setAttribute('aria-pressed', String(on));
  }
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
    if (e.repeat) return;
    keys.add(k);
    if (k === ' ') push();
    if (k === 'r') resetDuck('Reset');
    if (k === 'i') toggleInputs();
  });
  addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
  addEventListener('blur', () => keys.clear());
  $('btnInputs').addEventListener('click', e => { toggleInputs(); e.currentTarget.blur(); });
  $('btnPushTouch').addEventListener('click', push);
  $('btnFull').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else (app.requestFullscreen || app.webkitRequestFullscreen)?.call(app);
  });
  const pad = $('stick'), knob = pad.firstElementChild;
  const padMove = e => {
    const r = pad.getBoundingClientRect(), R = r.width / 2;
    let dx = (e.clientX - r.left - R) / R, dy = (e.clientY - r.top - R) / R;
    const n = Math.hypot(dx, dy);
    if (n > 1) { dx /= n; dy /= n; }
    stick.x = Math.abs(dx) < 0.14 ? 0 : dx;
    stick.y = Math.abs(dy) < 0.14 ? 0 : -dy;
    knob.style.transform = `translate(${dx * R * 0.62}px, ${dy * R * 0.62}px)`;
  };
  pad.addEventListener('pointerdown', e => { stick.active = true; pad.setPointerCapture(e.pointerId); padMove(e); });
  pad.addEventListener('pointermove', e => { if (stick.active) padMove(e); });
  const padUp = () => { stick.active = false; stick.x = stick.y = 0; knob.style.transform = ''; };
  pad.addEventListener('pointerup', padUp);
  pad.addEventListener('pointercancel', padUp);

  const cmd = [0, 0, 0];
  function wanted() {
    let vx = 0, vy = 0, wz = 0;
    if (keys.has('w') || keys.has('arrowup')) vx += keys.has('shift') ? 0.3 : 0.22;
    if (keys.has('s') || keys.has('arrowdown')) vx -= 0.12;
    if (keys.has('a') || keys.has('arrowleft')) wz += 0.7;
    if (keys.has('d') || keys.has('arrowright')) wz -= 0.7;
    if (keys.has('q')) vy += 0.12;
    if (keys.has('e')) vy -= 0.12;
    if (stick.active) {
      vx = stick.y > 0 ? 0.26 * stick.y : 0.12 * stick.y;
      wz = -0.75 * stick.x;
    }
    return [vx, vy, wz];
  }
  function updateCommand(dt) {
    const t = wanted();
    for (let i = 0; i < 3; i++) {
      const m = RATE[i] * dt;
      cmd[i] += Math.max(-m, Math.min(m, t[i] - cmd[i]));
      if (t[i] === 0 && Math.abs(cmd[i]) < 0.015) cmd[i] = 0;
    }
    sim.setCommand(cmd[0], cmd[1], cmd[2]);
  }

  // HUD
  const sgn = v => (v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
  function hud() {
    const parts = [];
    if (cmd[0]) parts.push(`${sgn(cmd[0])} m/s`);
    if (cmd[1]) parts.push(`side ${sgn(cmd[1])}`);
    if (cmd[2]) parts.push(`turn ${sgn(cmd[2])}`);
    $('hudCmd').textContent = parts.length ? parts.join(' · ') : 'standing';
    const gate = sim.ref.gate;
    $('hudGate').textContent = gate > 0.99 ? 'whole body' : gate < 0.01 ? 'head + beak' : 'blending';
    $('gateFill').style.width = `${(gate * 100).toFixed(0)}%`;
    $('beakFill').style.width = `${((sim.mouth ?? 0) * 100).toFixed(0)}%`;
  }

  // loop
  const target = new THREE.Vector3(0, 0.105, 0), want = new THREE.Vector3(), delta = new THREE.Vector3();
  let acc = 0, last = performance.now(), floorCell = [0, 0];
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    acc += dt;
    let n = 0;
    while (acc >= CONTROL_DT && n < 6) {
      updateCommand(CONTROL_DT);
      pose.p0.set(pose.p1);
      pose.q0.set(pose.q1);
      sim.tick();
      snap(pose.p1, pose.q1);
      acc -= CONTROL_DT;
      n++;
    }
    if (n === 6) acc = 0;
    if (sim.fallenFor > 1.4) resetDuck('Fell over. Back on its feet.');
    applyPose(acc / CONTROL_DT);

    // camera follows the trunk, the user orbits
    const tp = duck.bodies[0].position;
    want.set(tp.x, 0.105, -tp.y);
    delta.copy(want).sub(target).multiplyScalar(1 - Math.exp(-dt * 5));
    target.add(delta);
    camera.position.add(delta);
    controls.target.copy(target);
    controls.update();

    // the floor and the lights travel with the duck (floor snapped to the tile pattern)
    const cx = Math.round(tp.x / (2 * TILE)) * 2 * TILE, cy = Math.round(tp.y / (2 * TILE)) * 2 * TILE;
    if (cx !== floorCell[0] || cy !== floorCell[1]) { floor.position.set(cx, cy, 0); floorCell = [cx, cy]; }
    key.position.set(target.x + 0.9, 1.6, target.z + 0.7);
    key.target.position.copy(target);
    rim.position.set(target.x - 1.0, 0.9, target.z - 1.1);
    rim.target.position.copy(target);
    pool.position.set(target.x + 0.15, 1.25, target.z + 0.1);
    pool.target.position.set(target.x, 0, target.z);
    if (pushArrow.visible && now > arrowUntil) pushArrow.visible = false;

    hud();
    if (!$('inspector').hidden) drawInputs($('inspCanvas'), sim);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  setEmotion(params.get('emotion') && sim.lib.classes.includes(params.get('emotion')) ? params.get('emotion') : 'happy');
  if (params.get('inputs') === '1') toggleInputs();
  $('start').classList.add('gone');
  app.classList.add('running');
  canvas.tabIndex = 0;
  canvas.focus({ preventScroll: true });
  window.duck = { sim, setEmotion, push, resetDuck, camera, controls }; // for the console and the page tests
  requestAnimationFrame(t => { last = t; frame(t); });
}

function fail(e) {
  console.error(e);
  $('progressText').hidden = false;
  $('progressText').textContent = `Could not start: ${e.message || e}`;
  $('btnStart').disabled = false;
}

if (!window.WebAssembly) {
  $('btnStart').disabled = true;
  $('progressText').hidden = false;
  $('progressText').textContent = 'This browser has no WebAssembly.';
} else {
  $('btnStart').addEventListener('click', () => main().catch(fail));
  if (params.get('autostart') === '1') main().catch(fail);
}
