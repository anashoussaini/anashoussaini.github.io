// The XgoDuck unified policy in the browser: MuJoCo (WASM) physics, the HLS1910 servo law, the emotion reference player
// and the policy network in plain JS. No DOM here, so node runs the same file in the test against the Python oracle
// (ref_sim.py), which mirrors every line below.
//
//   const sim = await DuckSim.create(mujoco, fetchBytes);   // fetchBytes(path) -> ArrayBuffer, relative to assets/
//   sim.setEmotion('happy'); sim.setCommand(vx, vy, wz);
//   sim.tick();                                              // one 20 ms control step (4 physics steps of 5 ms)

export const HEAD_REF = [5, 6, 7, 8];
export const LEG_REF = [0, 1, 2, 3, 4, 9, 10, 11, 12, 13];
export const CONTROL_DT = 0.02;

export function mulberry32(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const quintic = u => {
  u = Math.min(Math.max(u, 0), 1);
  return u * u * u * (10 + u * (-15 + 6 * u));
};

// 21 emotion classes x 4 looping takes, planned for this robot. Per frame: 14 joint offsets from HOME, 6 trunk
// (height, roll, pitch, ...), 2 sole terms; int16 x 1e-4. The mouth opening is a uint8 track next to it.
export class Library {
  constructor(meta, buf) {
    const [nClip, nFrame, nDim] = meta.shape;
    Object.assign(this, { nClip, nFrame, nDim, scale: meta.scale, classes: meta.classes, joints: meta.joints });
    this.motion = new Int16Array(buf, 0, nClip * nFrame * nDim);
    this.mouth = new Uint8Array(buf, meta.mouth_offset, nClip * nFrame);
    this.lengths = Int32Array.from(meta.lengths);
    this.takes = meta.classes.map((_, k) => meta.class_id.flatMap((c, i) => (c === k ? [i] : [])));
    this.home = Float64Array.from(meta.joints, n => meta.home[n]);
  }

  sample(clip, frame, out) {
    const base = (clip * this.nFrame + (frame % this.lengths[clip])) * this.nDim;
    for (let i = 0; i < this.nDim; i++) out[i] = this.motion[base + i] * this.scale;
  }

  mouthAt(clip, frame) {
    return this.mouth[clip * this.nFrame + (frame % this.lengths[clip])] / 255;
  }
}

// UnifiedReference (xgoduck_rl/src/mjlab_microduck/unified_reference.py): take switching each cycle, 0.5 s quintic
// crossfades on emotion changes, and the 0.4 s standing <-> walking gate on the leg, trunk and sole targets.
export class Reference {
  constructor(lib, seed = 1, { lookahead = 10, transitionFrames = 25, gateSeconds = 0.4 } = {}) {
    this.lib = lib;
    this.rand = mulberry32(seed);
    this.lookahead = lookahead;
    this.tf = transitionFrames;
    this.gateRate = CONTROL_DT / gateSeconds;
    this.cls = lib.classes.indexOf('normal');
    this.clip = lib.takes[this.cls][0];
    this.frame = 0;
    this.prevClip = this.clip;
    this.prevFrame = 0;
    this.fade = this.tf;
    this.gate = 1;
    const n = lib.nDim;
    this._cur = new Float64Array(n);
    this._old = new Float64Array(n);
    this.target = new Float64Array(n);
    this.future = new Float64Array(n);
  }

  choose(takes) {
    return takes[Math.floor(this.rand() * takes.length)];
  }

  setEmotion(name) {
    const k = this.lib.classes.indexOf(name);
    if (k < 0 || k === this.cls) return;
    this.prevClip = this.clip;
    this.prevFrame = this.frame;
    this.fade = 0;
    this.cls = k;
    this.clip = this.choose(this.lib.takes[k]);
    this.frame = 0;
  }

  _blend(off, out) {
    this.lib.sample(this.clip, this.frame + off, out);
    if (this.fade < this.tf) {
      this.lib.sample(this.prevClip, this.prevFrame + off, this._old);
      const w = quintic((this.fade + off) / this.tf);
      for (let i = 0; i < out.length; i++) out[i] = this._old[i] + w * (out[i] - this._old[i]);
    }
    for (const j of LEG_REF) out[j] *= this.gate;
    for (let i = 14; i < 22; i++) out[i] *= this.gate;
  }

  mouth(off = 0) {
    let cur = this.lib.mouthAt(this.clip, this.frame + off);
    if (this.fade < this.tf) {
      const old = this.lib.mouthAt(this.prevClip, this.prevFrame + off);
      cur = old + quintic((this.fade + off) / this.tf) * (cur - old);
    }
    return cur;
  }

  tick(twist) {
    const standing = Math.sqrt(twist[0] * twist[0] + twist[1] * twist[1] + twist[2] * twist[2]) < 1e-4 ? 1 : 0;
    this.gate += Math.min(Math.max(standing - this.gate, -this.gateRate), this.gateRate);
    this.frame += 1;
    this.prevFrame += 1;
    this.fade = Math.min(this.fade + 1, this.tf);
    if (this.frame >= this.lib.lengths[this.clip]) {
      this.prevClip = this.clip;
      this.prevFrame = this.frame;
      this.fade = 0;
      this.clip = this.choose(this.lib.takes[this.cls]);
      this.frame = 0;
    }
    this._blend(0, this.target);
    this._blend(this.lookahead, this.future);
    this.phase = (2 * Math.PI * this.frame) / this.lib.lengths[this.clip];
  }

  // the 63 reference inputs, in the order of the observation (after the twist)
  write(obs, at) {
    const t = this.target;
    for (const j of HEAD_REF) obs[at++] = t[j];
    for (let i = 14; i < 20; i++) obs[at++] = t[i];
    for (let k = 0; k < this.lib.classes.length; k++) obs[at++] = k === this.cls ? 1 : 0;
    obs[at++] = Math.sin(this.phase);
    obs[at++] = Math.cos(this.phase);
    obs[at++] = this.gate;
    for (const j of LEG_REF) obs[at++] = t[j];
    obs[at++] = t[20];
    obs[at++] = t[21];
    for (let i = 0; i < this.future.length; i++) obs[at++] = this.future[i];
    return at;
  }
}

// MLP policy (policy.json kind "mlp"): observation normalizer + 512-256-128 ELU MLP.
export class Policy {
  constructor(meta, buf) {
    const get = name => new Float32Array(buf, meta[name].offset, meta[name].shape.reduce((a, b) => a * b, 1));
    this.mean = get('obs_mean');
    this.std = get('obs_std');
    this.eps = meta.eps;
    this.layers = meta.layers.map(i => ({ w: get(`w${i}`), b: get(`b${i}`), out: meta[`w${i}`].shape[0], in: meta[`w${i}`].shape[1] }));
    this.bufs = [new Float64Array(meta.obs_dim), ...this.layers.map(l => new Float64Array(l.out))];
  }

  forward(obs) {
    let x = this.bufs[0];
    for (let i = 0; i < x.length; i++) x[i] = (obs[i] - this.mean[i]) / (this.std[i] + this.eps);
    this.layers.forEach((l, li) => {
      const y = this.bufs[li + 1], last = li === this.layers.length - 1;
      for (let r = 0; r < l.out; r++) {
        let s = l.b[r];
        const row = r * l.in;
        for (let c = 0; c < l.in; c++) s += l.w[row + c] * x[c];
        y[r] = last || s > 0 ? s : Math.expm1(s);
      }
      x = y;
    });
    return x;
  }
}

// The end-to-end FlashSAC actor, deterministic path (build_assets.py --flashsac): 122 inputs -> 15 outputs.
export class FlashSACPolicy {
  constructor(meta, buf) {
    const get = name => new Float32Array(buf, meta[name].offset, meta[name].shape.reduce((a, b) => a * b, 1));
    this.m = meta;
    this.get = get;
    this.blocks = meta.blocks;
    this.hidden = meta.emb_w.shape[0];
    this.wide = meta.b0_w1.shape[0];
    this.mean = get('emb_bn_running_mean');  // the inputs view reads mean/std like the MLP's normalizer
    this.std = Float32Array.from(get('emb_bn_running_var'), v => Math.sqrt(v + meta.bn_eps));
    this.bufs = [new Float64Array(meta.obs_dim), new Float64Array(this.hidden), new Float64Array(this.wide), new Float64Array(this.hidden), new Float64Array(meta.act_dim)];
  }

  bn(x, p) {
    const w = this.get(`${p}_weight`), b = this.get(`${p}_bias`), rm = this.get(`${p}_running_mean`), rv = this.get(`${p}_running_var`), e = this.m.bn_eps;
    for (let i = 0; i < x.length; i++) x[i] = ((x[i] - rm[i]) / Math.sqrt(rv[i] + e)) * w[i] + b[i];
  }

  static linear(W, x, y) {
    const n = x.length;
    for (let r = 0; r < y.length; r++) {
      let s = 0;
      const row = r * n;
      for (let c = 0; c < n; c++) s += W[row + c] * x[c];
      y[r] = s;
    }
  }

  forward(obs) {
    const [xin, x, h, h2, out] = this.bufs, L = FlashSACPolicy.linear;
    xin.set(obs);
    this.bn(xin, 'emb_bn');
    L(this.get('emb_w'), xin, x);
    for (let b = 0; b < this.blocks; b++) {
      L(this.get(`b${b}_w1`), x, h);
      this.bn(h, `b${b}_bn1`);
      for (let i = 0; i < h.length; i++) h[i] = Math.max(h[i], 0);
      L(this.get(`b${b}_w2`), h, h2);
      this.bn(h2, `b${b}_bn2`);
      for (let i = 0; i < x.length; i++) x[i] += Math.max(h2[i], 0);
    }
    let ss = 0;
    for (let i = 0; i < x.length; i++) ss += x[i] * x[i];
    const rms = Math.sqrt(ss / x.length + this.m.rms_eps), rw = this.get('rms_w');
    for (let i = 0; i < x.length; i++) x[i] = (x[i] / rms) * rw[i];
    L(this.get('mean_w'), x, out);
    const mb = this.get('mean_b'), sc = this.get('act_scale'), bi = this.get('act_bias');
    for (let i = 0; i < out.length; i++) out[i] = sc[i] * Math.tanh(out[i] + mb[i]) + bi[i];
    return out;
  }
}

// The duck runtime's heading hold (xgoduck_runtime_arduino/python/heading.py).
export class HeadingHold {
  static KP = 1.5;
  static MAX_WZ = 0.3;
  static DEADBAND = (3 * Math.PI) / 180;
  static LEVEL_COS = Math.cos((5 * Math.PI) / 180);

  constructor() { this.reset(); }
  release() { this.target = null; this.correction = 0; }
  reset() { this.yaw = null; this.t = null; this.release(); }

  observe(grav, gyro, t) {
    if (this.yaw === null) {
      if (-grav[2] >= HeadingHold.LEVEL_COS) { this.yaw = 0; this.t = t; }
      return;
    }
    const dt = t - this.t;
    this.t = t;
    const den = grav[1] * grav[1] + grav[2] * grav[2];
    if (!(dt > 0 && dt <= 0.1) || den < 0.01) { this.reset(); return; }
    this.yaw -= ((gyro[1] * grav[1] + gyro[2] * grav[2]) / den) * dt;
  }

  command(twist) {
    if (this.yaw === null || twist[2] !== 0 || (twist[0] === 0 && twist[1] === 0)) { this.release(); return twist[2]; }
    if (this.target === null) this.target = this.yaw;
    const err = this.target - this.yaw;
    this.correction = Math.abs(err) > HeadingHold.DEADBAND ? Math.max(-HeadingHold.MAX_WZ, Math.min(HeadingHold.MAX_WZ, HeadingHold.KP * err)) : 0;
    return this.correction;
  }
}

export class DuckSim {
  // mujoco: the loaded WASM module. fetchBytes(relPath) -> Promise<ArrayBuffer> for files under assets/.
  static async create(mujoco, fetchBytes, { seed = 1 } = {}) {
    const text = async p => new TextDecoder().decode(await fetchBytes(p));
    const [xml, lstl, rstl, servo, pmeta, pbin, lmeta, lbin] = await Promise.all([
      text('physics/xgoduck_web.xml'), fetchBytes('physics/left_ankle.stl'), fetchBytes('physics/right_ankle.stl'), text('servo.json'),
      text('policy.json'), fetchBytes('policy.bin'), text('library.json'), fetchBytes('library.bin')]);
    const dir = '/xgoduck';
    try { mujoco.FS.mkdir(dir); } catch (_) { /* exists */ }
    mujoco.FS.writeFile(`${dir}/xgoduck_web.xml`, xml);
    mujoco.FS.writeFile(`${dir}/left_ankle.stl`, new Uint8Array(lstl));
    mujoco.FS.writeFile(`${dir}/right_ankle.stl`, new Uint8Array(rstl));
    const model = mujoco.MjModel.from_xml_path(`${dir}/xgoduck_web.xml`);
    const pm = JSON.parse(pmeta);
    const policy = pm.kind === 'flashsac' ? new FlashSACPolicy(pm, pbin) : new Policy(pm, pbin);
    return new DuckSim(mujoco, model, JSON.parse(servo), policy, new Library(JSON.parse(lmeta), lbin), seed);
  }

  constructor(mujoco, model, servo, policy, lib, seed) {
    Object.assign(this, { mujoco, model, S: servo, policy, lib });
    this.e2e = policy instanceof FlashSACPolicy;  // end to end: every servo from the network (14 joints + the beak)
    this.data = new mujoco.MjData(model);
    const id = (type, name) => {
      const i = mujoco.mj_name2id(model, mujoco.mjtObj[type].value, name);
      if (i < 0) throw new Error(`no ${type} ${name}`);
      return i;
    };
    const J = lib.joints;
    this.act = J.map(n => id('mjOBJ_ACTUATOR', n));
    const jq = model.jnt_qposadr, jd = model.jnt_dofadr;
    this.qadr = J.map(n => jq[id('mjOBJ_JOINT', n)]);
    this.dof = J.map(n => jd[id('mjOBJ_JOINT', n)]);
    this.blQadr = J.map(n => jq[id('mjOBJ_JOINT', `passive_${n}_backlash`)]);
    this.blDof = J.map(n => jd[id('mjOBJ_JOINT', `passive_${n}_backlash`)]);
    this.trunk = id('mjOBJ_BODY', 'trunk_base');
    this.kd = servo.kp * 0.166 * servo.error_gain_ratio;
    this.ktr = servo.kt / servo.R;
    this.seed = seed;
    this.obs = new Float64Array(this.e2e ? policy.m.obs_dim : policy.mean.length);
    this.qEnc = new Float64Array(14);
    this.vEnc = new Float64Array(14);
    this.prevVel = new Float64Array(14);
    this.lastAction = new Float64Array(this.e2e ? 15 : 14);
    this.beak = 0;
    this.prevTau = new Float64Array(14);
    this.target = new Float64Array(14);
    this.grav = new Float64Array(3);
    this.gyro = new Float64Array(3);
    this.command = [0, 0, 0];
    this.emotion = 'normal';
    this.headingHold = true;
    this.reset();
  }

  setEmotion(name) { if (this.lib.classes.includes(name)) this.emotion = name; }
  setCommand(vx, vy, wz) { this.command = [vx, vy, wz]; }

  encoder() {
    const q = this.data.qpos, v = this.data.qvel;
    for (let i = 0; i < 14; i++) {
      this.qEnc[i] = q[this.qadr[i]] + q[this.blQadr[i]];
      this.vEnc[i] = v[this.dof[i]] + v[this.blDof[i]];
    }
  }

  reset({ x = 0, y = 0, yaw = 0, seed } = {}) {
    const { mujoco, model, data, lib } = this;
    mujoco.mj_resetData(model, data);
    const q = data.qpos;
    q[0] = x; q[1] = y; q[2] = this.S.stand_z;
    q[3] = Math.cos(yaw / 2); q[4] = 0; q[5] = 0; q[6] = Math.sin(yaw / 2);
    for (let i = 0; i < 14; i++) q[this.qadr[i]] = lib.home[i];
    mujoco.mj_forward(model, data);
    this.ref = new Reference(lib, seed ?? this.seed);
    this.ref.setEmotion(this.emotion);
    this.hold = new HeadingHold();
    this.ticks = 0;
    this.queue = Array.from({ length: this.S.delay_steps + 1 }, () => Float64Array.from(lib.home));
    this.prevTau.fill(0);
    this.lastAction.fill(0);
    this.beak = 0;
    this.encoder();
    this.prevVel.set(this.vEnc);
    this.fallenFor = 0;
  }

  servoStep(target) {
    const { mujoco, model, data, S } = this;
    this.queue.push(Float64Array.from(target));
    this.queue.shift();
    const cmd = this.queue[0];
    this.encoder();
    let sumTau = 0;
    for (let i = 0; i < 14; i++) sumTau += Math.abs(this.prevTau[i]);
    const vin = Math.max(S.vin - S.vin_drop_gain * sumTau, S.vin_min);
    const qvel = data.qvel, ctrl = data.ctrl, fl = model.dof_frictionloss;
    for (let i = 0; i < 14; i++) {
      const w = qvel[this.dof[i]];
      const duty = Math.min(Math.max((cmd[i] - this.qEnc[i]) * this.kd, -S.duty_max), S.duty_max);
      ctrl[this.act[i]] = this.ktr * (vin * duty - S.kt * w);
      fl[this.dof[i]] = S.friction_base + Math.exp(-Math.pow(Math.abs(w) / S.dtheta_stribeck, S.alpha)) * S.friction_stribeck;
    }
    mujoco.mj_step(model, data);
    const fa = data.qfrc_actuator;
    for (let i = 0; i < 14; i++) this.prevTau[i] = fa[this.dof[i]];
  }

  readImu() {
    const R = this.data.xmat, b = 9 * this.trunk, v = this.data.qvel;
    this.grav[0] = -R[b + 6]; this.grav[1] = -R[b + 7]; this.grav[2] = -R[b + 8];
    this.gyro[0] = v[3]; this.gyro[1] = v[4]; this.gyro[2] = v[5];
  }

  // One 20 ms control tick: heading hold, reference, observation, policy, 4 servo/physics steps.
  tick() {
    this.readImu();
    this.hold.observe(this.grav, this.gyro, this.ticks * CONTROL_DT);
    this.ticks += 1;
    const tw = this.command.slice();
    if (this.headingHold) tw[2] = this.hold.command(tw);
    this.twist = tw;
    this.ref.setEmotion(this.emotion);
    this.ref.tick(tw);
    this.encoder();
    const o = this.obs, home = this.lib.home;
    let k = 0;
    for (let i = 0; i < 3; i++) o[k++] = this.gyro[i];
    for (let i = 0; i < 3; i++) o[k++] = this.grav[i];
    for (let i = 0; i < 14; i++) o[k++] = this.qEnc[i] - home[i];
    for (let i = 0; i < 14; i++) o[k++] = this.prevVel[i];
    for (let i = 0; i < this.lastAction.length; i++) o[k++] = this.lastAction[i];
    for (let i = 0; i < 3; i++) o[k++] = tw[i];
    k = this.ref.write(o, k);
    if (this.e2e) { o[k++] = this.ref.mouth(0); o[k++] = this.ref.mouth(this.ref.lookahead); }
    if (k !== o.length) throw new Error(`observation is ${k}, policy wants ${o.length}`);
    this.prevVel.set(this.vEnc);
    const a = this.policy.forward(o);
    const t = this.target, ref = this.ref.target;
    t.set(home);
    if (this.e2e) {  // every servo from the network
      for (let j = 0; j < 14; j++) t[j] += a[j];
      this.beak = Math.min(Math.max(a[14], 0), 1);
      this.lastAction.set(a);
    } else {
      LEG_REF.forEach((j, i) => { t[j] += a[i]; this.lastAction[j] = a[i]; });
      for (const j of HEAD_REF) { t[j] = home[j] + ref[j]; this.lastAction[j] = ref[j]; }
    }
    for (let s = 0; s < this.S.decimation; s++) this.servoStep(t);
    this.action = a;
    this.mouth = this.e2e ? this.beak : this.ref.mouth();
    this.fallenFor = this.fallen ? this.fallenFor + CONTROL_DT : 0;
  }

  get fallen() { return this.data.xmat[9 * this.trunk + 8] < Math.cos((70 * Math.PI) / 180); }

  push(vx, vy) { const v = this.data.qvel; v[0] += vx; v[1] += vy; }

  get yaw() {
    const q = this.data.qpos;
    return Math.atan2(2 * (q[3] * q[6] + q[4] * q[5]), 1 - 2 * (q[5] * q[5] + q[6] * q[6]));
  }
}
