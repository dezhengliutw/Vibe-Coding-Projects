import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js";

const el = {
  canvas: document.getElementById("scene"),
  speed: document.getElementById("speed"),
  speedReadout: document.getElementById("speedReadout"),
  orbits: document.getElementById("toggleOrbits"),
  labels: document.getElementById("toggleLabels"),
  panel: document.getElementById("planetPanel"),
  tabs: document.getElementById("planetTabs"),
  title: document.getElementById("appTitle"),
  subtitle: document.getElementById("appSubtitle"),
  timeLabel: document.getElementById("timeLabel"),
  langToggle: document.getElementById("langToggle"),
  bootWarning: document.getElementById("bootWarning"),
  leftRail: document.querySelector(".left-rail"),
  planetStrip: document.querySelector(".planet-strip"),
  mobileInfoToggle: document.getElementById("mobileInfoToggle"),
};

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x01040b, 0.0019);

const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 3000);
camera.position.set(-28, 84, 220);

const renderer = new THREE.WebGLRenderer({ canvas: el.canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.34;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 12;
controls.maxDistance = 420;
controls.maxPolarAngle = Math.PI * 0.495;
controls.target.set(0, 0, 0);

scene.add(new THREE.AmbientLight(0x5b82c8, 0.62));
scene.add(new THREE.PointLight(0xffdc9a, 5.4, 0, 1.25));
const rim = new THREE.DirectionalLight(0x6caeff, 0.45);
rim.position.set(-60, 28, -35);
scene.add(rim);
const fill = new THREE.DirectionalLight(0x9fd0ff, 0.48);
fill.position.set(45, 22, 50);
scene.add(fill);

const state = {
  speed: Number(el.speed.value),
  orbits: true,
  labels: true,
  atmosphere: true,
  cityLights: true,
  selected: null,
  holdCamera: 0,
  lang: "en",
  panelHidden: false,
};


const UI_STRINGS = {
  en: {
    title: "SOLAR SYSTEM EXPLORER",
    subtitle: "Interactive Astrophysics Discovery · HD Edition",
    orbits: "Orbits",
    labels: "Labels",
    time: "TIME",
    panelKicker: "Planetary Data",
    notes: "Discovery Notes",
    highlights: "Highlights",
    leftRailAria: "Visualization controls",
    planetStripAria: "Select a planet",
    bootWarning: "Open this with a local server, not <code>file://</code>. Example: <code>python -m http.server</code>",
  },
  zh: {
    title: "太阳系探索器",
    subtitle: "互动天体物理探索 · 高清版",
    orbits: "轨道",
    labels: "标签",
    time: "时间",
    panelKicker: "行星数据",
    notes: "探索笔记",
    highlights: "亮点",
    leftRailAria: "可视化控制",
    planetStripAria: "选择星体",
    bootWarning: "请使用本地服务器打开，而不是 <code>file://</code>。例如：<code>python -m http.server</code>",
  },
};

const STAT_LABEL_ZH = {
  Diameter: "直径",
  Surface: "表面",
  Core: "核心",
  Age: "年龄",
  Gravity: "重力",
  Rotation: "自转",
  Day: "昼长",
  Year: "公转周期",
  Moons: "卫星数",
  Mass: "质量",
  Atmosphere: "大气",
  "Avg Temp": "平均温度",
};

const BODY_ZH = {
  sun: { name: "太阳", cat: "恒星", type: "G型主序星", desc: "太阳占据太阳系绝大部分质量，通过辐射与太阳风为所有行星提供能量。", note: "太阳核心通过核聚变把氢转化为氦；磁暴活动会影响近地航天器、通信与电力系统。", hi: ["太阳系光与热的来源", "日球层延伸到冥王星轨道之外"] },
  mercury: { name: "水星", cat: "类地行星", type: "岩石行星", desc: "一颗布满陨石坑、几乎无大气的行星，昼夜温差极大。", note: "水星只有极稀薄外逸层，但在极地永久阴影陨石坑中存在水冰。", hi: ["铁核占比极高", "离太阳最近的行星"] },
  venus: { name: "金星", cat: "类地行星", type: "岩石行星", desc: "浓密二氧化碳大气与硫酸云层造成强烈温室效应，是最炽热的行星。", note: "金星自转缓慢且为逆行自转，在其表面太阳会从西边升起。", hi: ["失控温室效应世界", "地表气压约为地球的92倍"] },
  earth: { name: "地球", cat: "类地行星", type: "海洋世界 / 岩石行星", desc: "地球拥有液态水、活跃地质与保护性大气层，是目前已知唯一孕育生命的世界。", note: "磁场可屏蔽高能带电粒子并帮助保留大气层，也产生极光等现象。", hi: ["已知唯一有生命的行星", "极区可见明亮极光"] },
  mars: { name: "火星", cat: "类地行星", type: "岩石行星", desc: "寒冷干燥的沙漠行星，拥有巨型火山、峡谷与古代河流痕迹。", note: "奥林匹斯山和水手号峡谷展示了火星极端而壮观的地质地貌。", hi: ["红色来自氧化铁尘土", "地表存在古代流水证据"] },
  jupiter: { name: "木星", cat: "外行星", type: "气态巨行星", desc: "太阳系最大的行星，拥有分层云带、快速喷流与巨大的风暴系统。", note: "木星磁层极其庞大，众多卫星使它更像一个微型行星系统。", hi: ["大红斑是长期存在的巨型风暴", "伽利略卫星是重要科研目标"] },
  saturn: { name: "土星", cat: "外行星", type: "气态巨行星", desc: "以明亮壮观的环系闻名，环由大量冰粒和岩屑组成。", note: "土卫六拥有浓厚大气层，并存在液态甲烷与乙烷湖泊。", hi: ["低密度巨行星", "环系主要由水冰构成"] },
  uranus: { name: "天王星", cat: "外行星", type: "冰巨行星", desc: "具有甲烷雾霾与极端倾角的冰巨星，看起来像躺着绕太阳公转。", note: "其内部可能含有高压状态下的水、氨与甲烷深层结构。", hi: ["自转轴倾角约98度", "拥有微弱环系和偏移磁场"] },
  neptune: { name: "海王星", cat: "外行星", type: "冰巨行星", desc: "遥远的深蓝色冰巨星，拥有太阳系中最快的一些行星风。", note: "风暴系统会形成并消散，高层云在大气中高速移动。", hi: ["高层大气风速极高", "海卫一可能是被捕获天体"] },
};

function isZh() { return state.lang === "zh"; }
function uiText(key) { return (UI_STRINGS[state.lang] && UI_STRINGS[state.lang][key]) || UI_STRINGS.en[key] || key; }
function planetText(body) { const z = isZh() ? BODY_ZH[body.key] : null; return z ? { ...body, ...z } : body; }
function statLabelText(label) { return isZh() ? (STAT_LABEL_ZH[label] || label) : label; }
function planetNameText(body) { return isZh() && BODY_ZH[body.key] && BODY_ZH[body.key].name ? BODY_ZH[body.key].name : body.name; }
function isPhoneViewport() { return innerWidth <= 640; }
function syncPanelVisibility() {
  const hasSelection = Boolean(state.selected);
  const mobile = isPhoneViewport();
  if (!hasSelection) {
    el.panel.classList.remove("panel-collapsed-mobile");
    el.panel.style.display = "none";
    if (el.mobileInfoToggle) el.mobileInfoToggle.hidden = true;
    return;
  }
  el.panel.style.display = "";
  const collapsed = mobile && state.panelHidden;
  el.panel.classList.toggle("panel-collapsed-mobile", collapsed);
  if (el.mobileInfoToggle) el.mobileInfoToggle.hidden = !(mobile && collapsed);
}

controls.addEventListener("start", () => {
  state.holdCamera = 0;
});

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const clock = new THREE.Clock();
const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const v3 = new THREE.Vector3();
const overviewTarget = new THREE.Vector3(0, 0, 0);
const overviewCameraPos = new THREE.Vector3(-28, 84, 220);
const colorTmp = new THREE.Color();

function rng(seedStr) {
  let s = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i += 1) {
    s ^= seedStr.charCodeAt(i);
    s = Math.imul(s, 16777619);
  }
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function r(rnd, a, b) {
  return a + (b - a) * rnd();
}
function ctex(canvas, linear = false) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}
function tint(hex, amt) {
  colorTmp.set(hex);
  if (amt > 0) colorTmp.lerp(new THREE.Color(0xffffff), amt);
  if (amt < 0) colorTmp.lerp(new THREE.Color(0x000000), -amt);
  return `#${colorTmp.getHexString()}`;
}
function cvs(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}
function vividCanvas(source, sat = 135, contrast = 114) {
  const out = cvs(source.width, source.height);
  const ctx = out.getContext("2d");
  ctx.filter = `saturate(${sat}%) contrast(${contrast}%)`;
  ctx.drawImage(source, 0, 0);
  return out;
}
function dots(ctx, w, h, rnd, count, colors, a0, a1, s0, s1) {
  for (let i = 0; i < count; i += 1) {
    ctx.globalAlpha = r(rnd, a0, a1);
    ctx.fillStyle = colors[(rnd() * colors.length) | 0];
    ctx.beginPath();
    ctx.arc(rnd() * w, rnd() * h, r(rnd, s0, s1), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function texSun() {
  const rnd = rng("sun");
  const c = cvs(1024, 512);
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, "#fff0b4"); g.addColorStop(0.35, "#ffbc4f"); g.addColorStop(1, "#ff7421");
  x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 220; i += 1) {
    x.strokeStyle = rnd() > 0.5 ? "rgba(255,240,195,0.16)" : "rgba(255,165,70,0.14)";
    x.lineWidth = r(rnd, 1, 3.5);
    const y = rnd() * c.height;
    x.beginPath();
    for (let px = 0; px <= c.width; px += 8) {
      const py = y + Math.sin((px / c.width) * Math.PI * r(rnd, 8, 24) + r(rnd, 0, 6)) * r(rnd, 2, 11);
      px ? x.lineTo(px, py) : x.moveTo(px, py);
    }
    x.stroke();
  }
  dots(x, c.width, c.height, rnd, 9000, ["#ffd58a", "#fff6d4", "#ff9f3f"], 0.03, 0.16, 0.5, 1.8);
  return ctex(vividCanvas(c, 145, 118));
}
function texRocky(key, p) {
  const rnd = rng(key);
  const c = cvs(1024, 512);
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, c.height);
  g.addColorStop(0, p.top); g.addColorStop(0.5, p.mid); g.addColorStop(1, p.bottom);
  x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
  dots(x, c.width, c.height, rnd, 9000, [p.grain1, p.grain2], 0.02, 0.11, 0.6, 2.2);
  for (let i = 0; i < (p.craters || 140); i += 1) {
    const cx = rnd() * c.width, cy = rnd() * c.height, rr = r(rnd, 4, 24);
    const cg = x.createRadialGradient(cx - rr * 0.2, cy - rr * 0.2, rr * 0.2, cx, cy, rr);
    cg.addColorStop(0, "rgba(0,0,0,0)"); cg.addColorStop(0.65, "rgba(0,0,0,0.14)"); cg.addColorStop(0.82, "rgba(255,255,255,0.07)"); cg.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = cg; x.beginPath(); x.arc(cx, cy, rr, 0, Math.PI * 2); x.fill();
  }
  x.globalCompositeOperation = "overlay";
  const og = x.createLinearGradient(0, 0, c.width, c.height);
  og.addColorStop(0, "rgba(255,180,120,0.14)");
  og.addColorStop(0.5, "rgba(120,170,255,0.08)");
  og.addColorStop(1, "rgba(255,120,80,0.14)");
  x.fillStyle = og;
  x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = "source-over";
  return ctex(vividCanvas(c, 150, 120));
}
function texGas(key, palette, storm) {
  const rnd = rng(key);
  const c = cvs(1024, 512);
  const x = c.getContext("2d");
  for (let y = 0; y < c.height; y += 1) {
    const t = y / c.height;
    const wob = Math.sin(t * Math.PI * 13) * 0.04 + Math.cos(t * Math.PI * 5.5) * 0.03;
    const i = Math.floor((((t + wob) % 1) + 1) % 1 * palette.length) % palette.length;
    x.fillStyle = tint(palette[i], Math.sin(t * Math.PI * 9) * 0.12);
    x.fillRect(0, y, c.width, 1);
  }
  for (let i = 0; i < 420; i += 1) {
    x.globalAlpha = r(rnd, 0.04, 0.16);
    x.strokeStyle = rnd() > 0.5 ? "rgba(255,245,215,0.6)" : "rgba(80,60,50,0.45)";
    x.lineWidth = r(rnd, 0.7, 2.2);
    const y = rnd() * c.height;
    x.beginPath();
    for (let px = 0; px <= c.width; px += 12) {
      const py = y + Math.sin((px / c.width) * Math.PI * r(rnd, 3, 15) + r(rnd, 0, 6)) * r(rnd, 1, 6);
      px ? x.lineTo(px, py) : x.moveTo(px, py);
    }
    x.stroke();
  }
  if (storm) {
    x.globalAlpha = storm.a || 0.4;
    x.fillStyle = storm.c;
    x.beginPath();
    x.ellipse(c.width * storm.x, c.height * storm.y, c.width * storm.rx, c.height * storm.ry, 0, 0, Math.PI * 2);
    x.fill();
  }
  x.globalAlpha = 1;
  x.globalCompositeOperation = "overlay";
  const bg = x.createLinearGradient(0, 0, c.width, c.height);
  bg.addColorStop(0, "rgba(255,235,190,0.12)");
  bg.addColorStop(0.45, "rgba(255,170,90,0.08)");
  bg.addColorStop(1, "rgba(120,170,255,0.08)");
  x.fillStyle = bg;
  x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = "source-over";
  return ctex(vividCanvas(c, 155, 122));
}
function texClouds(seed, rgb) {
  const rnd = rng(seed);
  const c = cvs(1024, 512);
  const x = c.getContext("2d");
  for (let i = 0; i < 520; i += 1) {
    x.fillStyle = `rgba(${rgb},${r(rnd, 0.03, 0.16)})`;
    x.beginPath();
    x.ellipse(rnd() * c.width, rnd() * c.height, r(rnd, 8, 42), r(rnd, 2, 12), r(rnd, -0.4, 0.4), 0, Math.PI * 2);
    x.fill();
  }
  return ctex(vividCanvas(c, 140, 108));
}
function texEarthSet() {
  const rnd = rng("earth");
  const w = 1024, h = 512;
  const surf = cvs(w, h), sx = surf.getContext("2d");
  const mask = cvs(w, h), mx = mask.getContext("2d");
  const grad = sx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#1d5bda"); grad.addColorStop(0.45, "#0a3aa8"); grad.addColorStop(1, "#08276c");
  sx.fillStyle = grad; sx.fillRect(0, 0, w, h);
  dots(sx, w, h, rnd, 8000, ["#1c73ff", "#0f57dc", "#4bb5ff"], 0.02, 0.1, 0.6, 1.8);
  mx.fillStyle = "#fff";
  for (let i = 0; i < 18; i += 1) {
    const cx = r(rnd, 0.05, 0.95) * w, cy = r(rnd, 0.12, 0.88) * h, rx = r(rnd, 48, 120), ry = r(rnd, 24, 72);
    mx.beginPath(); mx.ellipse(cx, cy, rx, ry, r(rnd, -0.8, 0.8), 0, Math.PI * 2); mx.fill();
    for (let j = 0; j < 4; j += 1) {
      mx.globalAlpha = r(rnd, 0.35, 0.9);
      mx.beginPath();
      mx.ellipse(cx + r(rnd, -rx * 0.6, rx * 0.6), cy + r(rnd, -ry * 0.6, ry * 0.6), r(rnd, rx * 0.2, rx * 0.6), r(rnd, ry * 0.2, ry * 0.6), r(rnd, -1, 1), 0, Math.PI * 2);
      mx.fill();
    }
    mx.globalAlpha = 1;
  }
  const md = mx.getImageData(0, 0, w, h).data;
  for (let i = 0; i < 6500; i += 1) {
    const x = (rnd() * w) | 0, y = (rnd() * h) | 0, idx = (y * w + x) * 4;
    if (md[idx + 3] < 20) continue;
    sx.globalAlpha = r(rnd, 0.14, 0.6);
    sx.fillStyle = rnd() > 0.7 ? "#d3bd79" : rnd() > 0.4 ? "#4ca65d" : "#2f7e43";
    sx.beginPath(); sx.arc(x, y, r(rnd, 1, 4), 0, Math.PI * 2); sx.fill();
  }
  sx.globalAlpha = 1;
  sx.fillStyle = "rgba(240,250,255,0.9)"; sx.fillRect(0, 0, w, 18); sx.fillRect(0, h - 18, w, 18);
  const lights = cvs(w, h), lx = lights.getContext("2d");
  lx.fillStyle = "black"; lx.fillRect(0, 0, w, h);
  for (let i = 0; i < 3400; i += 1) {
    const x = (rnd() * w) | 0, y = (rnd() * h) | 0, idx = (y * w + x) * 4;
    if (md[idx + 3] < 20 || rnd() < 0.35) continue;
    lx.fillStyle = rnd() > 0.65 ? `rgba(255,210,120,${r(rnd, 0.12, 0.55)})` : `rgba(255,150,70,${r(rnd, 0.08, 0.35)})`;
    lx.beginPath(); lx.arc(x, y, r(rnd, 0.4, 2), 0, Math.PI * 2); lx.fill();
  }
  return { map: ctex(vividCanvas(surf, 150, 118)), clouds: texClouds("earth-clouds", "245,250,255"), lights: ctex(vividCanvas(lights, 170, 125)) };
}
function texRing() {
  const rnd = rng("ring");
  const c = cvs(1024, 128), x = c.getContext("2d");
  for (let y = 0; y < c.height; y += 1) {
    const t = y / (c.height - 1), edge = Math.sin(t * Math.PI);
    const stripe = 0.55 + Math.sin(t * Math.PI * 18) * 0.2 + Math.sin(t * Math.PI * 53) * 0.08;
    x.globalAlpha = Math.max(0, edge * stripe * 0.9);
    x.fillStyle = t > 0.68 ? "#d2c09b" : t > 0.45 ? "#b89c74" : "#ebe2c2";
    x.fillRect(0, y, c.width, 1);
  }
  for (let i = 0; i < 1400; i += 1) {
    x.globalAlpha = r(rnd, 0.02, 0.12);
    x.fillStyle = rnd() > 0.5 ? "#fff7de" : "#977b56";
    x.fillRect(rnd() * c.width, rnd() * c.height, r(rnd, 1, 5), 1);
  }
  x.globalAlpha = 1;
  const t = ctex(c);
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(4, 1);
  return t;
}

const earthMaps = texEarthSet();
const ringMap = texRing();

function starLayer(count, minR, maxR, size, opacity) {
  const g = new THREE.BufferGeometry();
  const p = new Float32Array(count * 3);
  const c = new Float32Array(count * 3);
  const rnd = rng(`${count}-${minR}`);
  const col = new THREE.Color();
  for (let i = 0; i < count; i += 1) {
    const ii = i * 3, rr = r(rnd, minR, maxR), th = rnd() * Math.PI * 2, ph = Math.acos(rnd() * 2 - 1);
    p[ii] = rr * Math.sin(ph) * Math.cos(th);
    p[ii + 1] = rr * Math.cos(ph);
    p[ii + 2] = rr * Math.sin(ph) * Math.sin(th);
    col.setHSL(r(rnd, 0.53, 0.66), r(rnd, 0.2, 0.4), r(rnd, 0.65, 0.95));
    c[ii] = col.r; c[ii + 1] = col.g; c[ii + 2] = col.b;
  }
  g.setAttribute("position", new THREE.BufferAttribute(p, 3));
  g.setAttribute("color", new THREE.BufferAttribute(c, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size, opacity, transparent: true, vertexColors: true, depthWrite: false }));
  scene.add(pts);
  return pts;
}
const stars = [starLayer(6000, 320, 1200, 1, 0.9), starLayer(2500, 220, 700, 1.7, 0.4)];

function orbitLine(radius) {
  const pts = [];
  for (let i = 0; i < 220; i += 1) {
    const a = (i / 220) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  const line = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0x29406a, transparent: true, opacity: 0.42 })
  );
  line.rotation.x = 0.0015;
  scene.add(line);
  return line;
}

const bodies = [
  { key: "sun", name: "Sun", type: "G-Type Main-Sequence Star", cat: "Star", sw: "#f5b44b", radius: 9.4, orbit: 0, os: 0, ss: 0.009, tilt: 7.25, fd: 52, kind: "sun", atmo: 0xffb14d, atmoOp: 0.12,
    desc: "The Sun contains 99.8% of solar-system mass and powers every world through radiation and solar wind.",
    note: "Fusion in the core turns hydrogen into helium, while magnetic storms can affect spacecraft, communications, and power systems near Earth.",
    stats: [["Diameter", "1.39M km"], ["Surface", "5,500 C"], ["Core", "~15M C"], ["Age", "4.6B yrs"], ["Gravity", "274 m/s2"], ["Rotation", "~25 d"]],
    hi: ["Source of light and heat", "Heliosphere extends beyond Pluto"] },
  { key: "mercury", name: "Mercury", type: "Rocky Planet", cat: "Terrestrial", sw: "#b8a392", radius: 1.1, orbit: 18, os: 4.15, ss: 0.008, tilt: 0.03, fd: 16, kind: "rocky",
    rocky: { top: "#c6b39d", mid: "#9b826f", bottom: "#7c685b", grain1: "#d0c1b2", grain2: "#5f4c41", craters: 180 },
    desc: "A cratered, airless world with enormous temperature swings between day and night.",
    note: "Mercury has a weak exosphere and water ice trapped in permanently shadowed polar craters.",
    stats: [["Diameter", "4,879 km"], ["Day", "58.6 Earth d"], ["Year", "88 d"], ["Gravity", "3.7 m/s2"], ["Moons", "0"], ["Mass", "0.055 Earth"]],
    hi: ["Largest iron core fraction", "Closest planet to the Sun"] },
  { key: "venus", name: "Venus", type: "Rocky Planet", cat: "Terrestrial", sw: "#dcae67", radius: 1.65, orbit: 27, os: 1.62, ss: -0.0018, tilt: 177.4, fd: 17, kind: "venus", atmo: 0xffd39b, atmoOp: 0.18,
    desc: "A dense CO2 atmosphere and sulfuric-acid clouds make Venus the hottest planet.",
    note: "Its slow retrograde rotation means the Sun would appear to rise in the west.",
    stats: [["Diameter", "12,104 km"], ["Day", "243 Earth d"], ["Year", "224.7 d"], ["Gravity", "8.87 m/s2"], ["Moons", "0"], ["Surface", "464 C"]],
    hi: ["Runaway greenhouse world", "Pressure ~92x Earth"] },
  { key: "earth", name: "Earth", type: "Ocean World / Rocky Planet", cat: "Terrestrial", sw: "#4d8fff", radius: 1.75, orbit: 36, os: 1, ss: 0.018, tilt: 23.44, fd: 19, kind: "earth", atmo: 0x67b7ff, atmoOp: 0.18,
    desc: "Earth combines liquid water, active geology, and a protective atmosphere suitable for life.",
    note: "A magnetic field shields the planet from charged particles and helps preserve the atmosphere.",
    stats: [["Diameter", "12,742 km"], ["Day", "23h 56m"], ["Year", "365.25 d"], ["Gravity", "9.81 m/s2"], ["Moons", "1"], ["Atmosphere", "N2 / O2"]],
    hi: ["Only known inhabited world", "Visible auroras near polar regions"] , moons:[{ r:0.35, d:3.2, s:6.5, c:0xc5cbd8 }] },
  { key: "mars", name: "Mars", type: "Rocky Planet", cat: "Terrestrial", sw: "#d05f3e", radius: 1.28, orbit: 46, os: 0.53, ss: 0.016, tilt: 25.19, fd: 16, kind: "rocky", atmo: 0xff9b6e, atmoOp: 0.09,
    rocky: { top: "#de8760", mid: "#b95837", bottom: "#8b3f26", grain1: "#f4b286", grain2: "#72311e", craters: 150 },
    desc: "A cold desert world shaped by volcanoes, canyons, dust storms, and ancient rivers.",
    note: "Olympus Mons and Valles Marineris show just how extreme Martian geology can be.",
    stats: [["Diameter", "6,779 km"], ["Day", "24h 37m"], ["Year", "687 d"], ["Gravity", "3.71 m/s2"], ["Moons", "2"], ["Avg Temp", "-63 C"]],
    hi: ["Red color from iron oxides", "Ancient water evidence across the surface"], moons:[{ r:0.18,d:1.9,s:11.5,c:0xa09b95 }, { r:0.12,d:2.5,s:8.2,c:0x8d847c }] },
  { key: "jupiter", name: "Jupiter", type: "Gas Giant", cat: "Outer Planet", sw: "#d7b57d", radius: 5.35, orbit: 66, os: 0.084, ss: 0.04, tilt: 3.13, fd: 38, kind: "jupiter", atmo: 0xf5d19a, atmoOp: 0.08,
    desc: "The largest planet, with fast jet streams, layered clouds, and giant storms like the Great Red Spot.",
    note: "Its huge magnetosphere and many moons make Jupiter a system of worlds, not just one planet.",
    stats: [["Diameter", "139,820 km"], ["Day", "9h 56m"], ["Year", "11.86 yrs"], ["Gravity", "24.79 m/s2"], ["Moons", "95"], ["Mass", "317.8 Earth"]],
    hi: ["Great Red Spot is a long-lived storm", "Galilean moons are major science targets"], moons:[{ r:0.42,d:7.4,s:3.6,c:0xf0d7a2 }, { r:0.36,d:9.3,s:2.6,c:0xdedede }, { r:0.52,d:11.6,s:2.1,c:0xc5b79d }, { r:0.4,d:14,s:1.5,c:0xaeb0be }] },
  { key: "saturn", name: "Saturn", type: "Gas Giant", cat: "Outer Planet", sw: "#edd79f", radius: 4.65, orbit: 88, os: 0.034, ss: 0.037, tilt: 26.73, fd: 44, kind: "saturn", atmo: 0xffe6b0, atmoOp: 0.07,
    ring: { inner:1.42, outer:2.45, rx:Math.PI/2.65, ry:0.32, op:0.55, col:0xd8c49c },
    desc: "Saturn's bright ring system is built from icy particles sculpted by gravity and resonances.",
    note: "Titan, Saturn's largest moon, has a thick atmosphere and lakes of liquid methane and ethane.",
    stats: [["Diameter", "116,460 km"], ["Day", "~10h 33m"], ["Year", "29.45 yrs"], ["Gravity", "10.44 m/s2"], ["Moons", "146"], ["Mass", "95.2 Earth"]],
    hi: ["Lowest density giant planet", "Rings are mostly water ice"], moons:[{ r:0.38,d:7.1,s:2.7,c:0xccb893 }, { r:0.24,d:8.9,s:2.2,c:0xd8d0bb }, { r:0.2,d:10.7,s:1.6,c:0x9fa6b8 }] },
  { key: "uranus", name: "Uranus", type: "Ice Giant", cat: "Outer Planet", sw: "#8bdde2", radius: 3.25, orbit: 108, os: 0.012, ss: 0.029, tilt: 97.77, fd: 28, kind: "uranus", atmo: 0xbff9ff, atmoOp: 0.12,
    ring: { inner:1.55, outer:1.95, rx:Math.PI/2.08, ry:0.08, op:0.22, col:0x9fb4c7 },
    desc: "An ice giant with methane haze and an extreme tilt that makes it appear to roll around the Sun.",
    note: "Uranus likely has a deep mantle of water, ammonia, and methane under high pressure.",
    stats: [["Diameter", "50,724 km"], ["Day", "17h 14m"], ["Year", "84 yrs"], ["Gravity", "8.69 m/s2"], ["Moons", "27"], ["Avg Temp", "-195 C"]],
    hi: ["Tilt ~98 degrees", "Faint rings and offset magnetic field"] },
  { key: "neptune", name: "Neptune", type: "Ice Giant", cat: "Outer Planet", sw: "#4f79ff", radius: 3.15, orbit: 126, os: 0.006, ss: 0.031, tilt: 28.32, fd: 28, kind: "neptune", atmo: 0x74a5ff, atmoOp: 0.13,
    desc: "A distant ice giant with deep blue methane clouds and some of the fastest planetary winds known.",
    note: "Storm systems appear and fade over time, while high clouds race through the upper atmosphere.",
    stats: [["Diameter", "49,244 km"], ["Day", "16h 6m"], ["Year", "164.8 yrs"], ["Gravity", "11.15 m/s2"], ["Moons", "14"], ["Avg Temp", "-200 C"]],
    hi: ["Supersonic upper-atmosphere winds", "Triton is likely a captured object"] },
];

function texFor(body) {
  if (body.kind === "sun") return { map: texSun() };
  if (body.kind === "earth") return earthMaps;
  if (body.kind === "venus") return { map: texGas("venus", ["#f7e5bc", "#e8c583", "#cfaa69", "#f2ddb0", "#d9ba7f"]), clouds: texClouds("venus-clouds", "255,227,187") };
  if (body.kind === "jupiter") return { map: texGas("jupiter", ["#efe8d2", "#cdbf99", "#b49365", "#efe6cf", "#d1bf97", "#a68155"], { x:0.69, y:0.63, rx:0.08, ry:0.04, c:"rgba(185,74,42,0.48)", a:0.5 }), clouds: texClouds("jupiter-clouds", "255,236,205") };
  if (body.kind === "saturn") return { map: texGas("saturn", ["#f5e6bc", "#dcbf86", "#b89966", "#efe0b3", "#cbb07d", "#9e8053"]), clouds: texClouds("saturn-clouds", "255,240,215") };
  if (body.kind === "uranus") return { map: texGas("uranus", ["#b9f0f1", "#8fd7dd", "#7cc8cf", "#9fe4e8", "#74c0cc"]), clouds: texClouds("uranus-clouds", "225,255,255") };
  if (body.kind === "neptune") return { map: texGas("neptune", ["#5d86ff", "#3f67eb", "#3150c6", "#6ea4ff", "#4974ff", "#2848b6"], { x:0.41, y:0.55, rx:0.05, ry:0.03, c:"rgba(40,60,130,0.26)", a:0.28 }), clouds: texClouds("neptune-clouds", "210,225,255") };
  return { map: texRocky(body.key, body.rocky) };
}

function label(text) {
  const d = document.createElement("div");
  d.className = "label";
  d.textContent = text;
  document.body.appendChild(d);
  return d;
}

function matFor(body, tex) {
  if (body.key === "sun") return new THREE.MeshBasicMaterial({ map: tex.map, color: 0xffffff });
  return new THREE.MeshStandardMaterial({
    map: tex.map,
    roughness: body.cat === "Terrestrial" ? 0.74 : 0.68,
    metalness: 0.03,
    color: new THREE.Color(body.sw).lerp(new THREE.Color(0xffffff), body.key === "jupiter" || body.key === "saturn" ? 0.62 : 0.42),
    emissive: new THREE.Color(body.sw).multiplyScalar(body.key === "earth" ? 0.12 : 0.08),
  });
}

function makeSystem(body, i) {
  const t = texFor(body);
  const orbit = body.orbit ? orbitLine(body.orbit) : null;
  const pivot = new THREE.Group();
  const anchor = new THREE.Group();
  const tilt = new THREE.Group();
  const spin = new THREE.Group();
  scene.add(pivot); pivot.add(anchor); anchor.add(tilt); tilt.add(spin);
  anchor.position.x = body.orbit;
  tilt.rotation.z = THREE.MathUtils.degToRad(body.tilt || 0);
  if (body.orbit) pivot.rotation.y = (i / bodies.length) * Math.PI * 2;

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(body.radius, 64, 64), matFor(body, t));
  spin.add(mesh);

  if (body.key === "sun") {
    const glow = new THREE.Mesh(new THREE.SphereGeometry(body.radius * 1.26, 48, 48), new THREE.MeshBasicMaterial({ color: 0xffad46, transparent: true, opacity: 0.24, side: THREE.BackSide }));
    const corona = new THREE.Mesh(new THREE.SphereGeometry(body.radius * 1.6, 40, 40), new THREE.MeshBasicMaterial({ color: 0xffca71, transparent: true, opacity: 0.06, side: THREE.BackSide }));
    spin.add(glow); spin.add(corona);
    mesh.userData.sunGlow = glow; mesh.userData.sunCorona = corona;
  }

  const atmos = [], cityLights = [], clouds = [];
  if (body.atmo) {
    const sh = new THREE.Mesh(new THREE.SphereGeometry(body.radius * 1.08, 48, 48), new THREE.MeshPhongMaterial({ color: body.atmo, transparent: true, opacity: (body.atmoOp || 0.1) * 1.35, side: THREE.BackSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    tilt.add(sh); atmos.push(sh);
  }
  if (t.clouds && body.key !== "sun") {
    const cm = new THREE.Mesh(new THREE.SphereGeometry(body.radius * (body.key === "venus" ? 1.01 : 1.03), 48, 48), new THREE.MeshStandardMaterial({ map: t.clouds, color: 0xffffff, transparent: true, opacity: body.key === "venus" ? 0.38 : 0.28, roughness: 0.95, metalness: 0, depthWrite: false, emissive: new THREE.Color(0xbfd7ff).multiplyScalar(0.03) }));
    tilt.add(cm); atmos.push(cm); clouds.push(cm);
  }
  if (t.lights) {
    const lm = new THREE.Mesh(new THREE.SphereGeometry(body.radius * 1.015, 48, 48), new THREE.MeshBasicMaterial({ map: t.lights, color: 0xffd089, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
    spin.add(lm); cityLights.push(lm);
  }

  let ring = null;
  if (body.ring) {
    ring = new THREE.Mesh(new THREE.RingGeometry(body.radius * body.ring.inner, body.radius * body.ring.outer, 128), new THREE.MeshBasicMaterial({ map: ringMap, color: body.ring.col, side: THREE.DoubleSide, transparent: true, opacity: body.ring.op, depthWrite: false }));
    ring.rotation.x = body.ring.rx; ring.rotation.y = body.ring.ry;
    tilt.add(ring);
  }

  const shell = new THREE.Mesh(new THREE.SphereGeometry(body.radius * 1.12, 32, 32), new THREE.MeshBasicMaterial({ color: body.key === "sun" ? 0xffb64a : 0x60c6ff, transparent: true, opacity: 0, side: THREE.BackSide, depthWrite: false }));
  tilt.add(shell);

  const moons = [];
  (body.moons || []).forEach((m, idx) => {
    const p = new THREE.Group(); p.rotation.y = (idx / (body.moons.length || 1)) * Math.PI * 2;
    const a = new THREE.Group(); a.position.x = m.d;
    const mm = new THREE.Mesh(new THREE.SphereGeometry(m.r, 18, 18), new THREE.MeshStandardMaterial({ color: m.c, roughness: 0.95, metalness: 0 }));
    const mo = new THREE.Mesh(new THREE.RingGeometry(m.d - 0.015, m.d + 0.015, 96), new THREE.MeshBasicMaterial({ color: 0x40618f, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false }));
    mo.rotation.x = Math.PI / 2; mo.visible = false;
    a.add(mm); p.add(a); tilt.add(p); tilt.add(mo);
    moons.push({ pivot: p, orbitLine: mo, angle: p.rotation.y, speed: m.s });
  });

  const lab = label(planetNameText(body));
  const system = { body, mesh, orbit, pivot, spin, shell, atmos, cityLights, clouds, moons, label: lab, angle: pivot.rotation.y };
  mesh.userData.system = system;
  return system;
}

const systems = bodies.map(makeSystem);
const byKey = new Map(systems.map((s) => [s.body.key, s]));
const pickables = systems.map((s) => s.mesh);

function esc(s) { return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }
function statHTML([k, v]) { return `<div class="planet-stat"><span class="value">${v}</span><span class="label">${k}</span></div>`; }
function renderPanel(sys) {
  const b = planetText(sys.body);
  el.panel.style.display = "";
  el.panel.innerHTML =     `
    <div class="panel-topline">
      <div class="panel-kicker">${uiText("panelKicker")}</div>
      <div class="panel-chip" style="--chip-color:${b.sw}">${b.cat}</div>
      <button id="mobilePanelClose" class="panel-close-btn" type="button" aria-label="Close information panel">&times;</button>
    </div>
    <h2 class="planet-name">${b.name}</h2>
    <p class="planet-type">${b.type}</p>
    <p class="planet-description">${esc(b.desc)}</p>
    <div class="planet-grid">${b.stats.map(([k, v]) => statHTML([statLabelText(k), v])).join("")}</div>
    <section class="panel-section"><h3>${uiText("notes")}</h3><p>${esc(b.note)}</p></section>
    <section class="panel-section"><h3>${uiText("highlights")}</h3><ul class="panel-list">${b.hi.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>`; 
  const closeBtn = el.panel.querySelector("#mobilePanelClose");
  if (closeBtn) closeBtn.addEventListener("click", () => {
    if (!isPhoneViewport()) return;
    state.panelHidden = true;
    syncPanelVisibility();
  });
  syncPanelVisibility();
}

function renderOverviewPanel() {
  el.panel.innerHTML = "";
  state.panelHidden = false;
  syncPanelVisibility();
}

const tabBtns = new Map();
for (const s of systems) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "planet-chip-btn";
  b.dataset.key = s.body.key;
  b.style.setProperty("--swatch", s.body.sw);
  b.innerHTML = `<span class="planet-chip-swatch"></span><span class="planet-chip-name">${planetNameText(s.body)}</span>`;
  b.addEventListener("click", () => {
    if (state.selected === s.body.key) {
      clearSelectionToOverview();
      return;
    }
    select(s.body.key);
  });
  el.tabs.appendChild(b);
  tabBtns.set(s.body.key, b);
}

function updateLanguageUI() {
  document.documentElement.lang = isZh() ? "zh-Hans" : "en";
  if (el.title) el.title.textContent = uiText("title");
  if (el.subtitle) el.subtitle.textContent = uiText("subtitle");
  if (el.orbits) el.orbits.textContent = uiText("orbits");
  if (el.labels) el.labels.textContent = uiText("labels");
  if (el.timeLabel) el.timeLabel.textContent = uiText("time");
  if (el.leftRail) el.leftRail.setAttribute("aria-label", uiText("leftRailAria"));
  if (el.planetStrip) el.planetStrip.setAttribute("aria-label", uiText("planetStripAria"));
  if (el.bootWarning && location.protocol === "file:") el.bootWarning.innerHTML = uiText("bootWarning");
  if (el.langToggle) {
    el.langToggle.textContent = isZh() ? "EN" : "中文";
    el.langToggle.setAttribute("aria-label", isZh() ? "切换到英文" : "Switch to Chinese");
  }
  for (const s of systems) s.label.textContent = planetNameText(s.body);
  for (const [key, btn] of tabBtns) {
    const sys = byKey.get(key);
    const nameEl = btn.querySelector(".planet-chip-name");
    if (sys && nameEl) nameEl.textContent = planetNameText(sys.body);
  }
  if (state.selected) {
    const sys = byKey.get(state.selected);
    if (sys) renderPanel(sys);
  } else {
    syncPanelVisibility();
  }
}
function btnState(btn, on) { btn.classList.toggle("is-active", on); }
function updateSpeed() { el.speedReadout.textContent = `${state.speed.toFixed(2)}x`; }
function applyToggleVisuals() {
  for (const s of systems) {
    if (s.orbit) s.orbit.visible = state.orbits;
    for (const m of s.moons) m.orbitLine.visible = state.orbits && state.selected === s.body.key;
    s.atmos.forEach((m) => { m.visible = state.atmosphere; });
    s.cityLights.forEach((m) => { m.visible = state.cityLights; });
  }
  btnState(el.orbits, state.orbits);
  btnState(el.labels, state.labels);
}
function updateTabs() {
  for (const [k, b] of tabBtns) b.classList.toggle("is-active", k === state.selected);
}
function select(key) {
  const s = byKey.get(key);
  if (!s) return;
  state.selected = key;
  state.holdCamera = 0.9;
  state.panelHidden = false;
  updateTabs();
  renderPanel(s);
  applyToggleVisuals();
}

function clearSelectionToOverview() {
  state.selected = null;
  state.holdCamera = 0.9;
  state.panelHidden = false;
  updateTabs();
  applyToggleVisuals();
  renderOverviewPanel();
}

function projectLabel(s) {
  s.mesh.getWorldPosition(v1);
  v1.project(camera);
  const on = v1.z > -1 && v1.z < 1 && v1.x > -1.2 && v1.x < 1.2 && v1.y > -1.2 && v1.y < 1.2;
  s.label.style.display = state.labels && on ? "block" : "none";
  if (!state.labels || !on) return;
  const x = (v1.x * 0.5 + 0.5) * innerWidth;
  const y = (-v1.y * 0.5 + 0.5) * innerHeight;
  s.label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -150%)`;
  s.label.style.opacity = s.body.key === state.selected ? "1" : "0.85";
}

function updateCamera(dt) {
  const s = byKey.get(state.selected);
  if (!s) {
    if (state.holdCamera > 0) {
      controls.target.lerp(overviewTarget, Math.min(1, dt * 3.2));
      camera.position.lerp(overviewCameraPos, Math.min(1, dt * 2.2));
    }
    return;
  }
  s.mesh.getWorldPosition(v1);
  const rad = s.body.radius, dist = s.body.fd || Math.max(18, rad * 8);
  const off = s.body.key === "saturn" ? v2.set(rad * 4, rad * 1.4, rad * 7.8) : s.body.key === "sun" ? v2.set(rad * 2.8, rad * 0.9, rad * 4.5) : v2.set(rad * 4.6, rad * 1.55, rad * 7.2);
  off.normalize().multiplyScalar(dist);
  controls.target.lerp(v1, Math.min(1, dt * 3.5));
  if (state.holdCamera > 0) {
    camera.position.lerp(v3.copy(v1).add(off), Math.min(1, dt * 2.4));
  }
}

function onPick(e) {
  if (isPhoneViewport()) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(pickables, false)[0];
  if (hit?.object?.userData?.system) {
    select(hit.object.userData.system.body.key);
  }
}

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  if (!isPhoneViewport()) state.panelHidden = false;
  syncPanelVisibility();
}

el.speed.addEventListener("input", (e) => { state.speed = Number(e.target.value); updateSpeed(); });
el.speedReadout.addEventListener("click", () => { state.speed = 1; el.speed.value = "1"; updateSpeed(); });
el.orbits.addEventListener("click", () => { state.orbits = !state.orbits; applyToggleVisuals(); });
el.labels.addEventListener("click", () => { state.labels = !state.labels; applyToggleVisuals(); });
if (el.langToggle) el.langToggle.addEventListener("click", () => { state.lang = state.lang === "en" ? "zh" : "en"; updateLanguageUI(); });
if (el.mobileInfoToggle) el.mobileInfoToggle.addEventListener("click", () => { state.panelHidden = false; syncPanelVisibility(); });
renderer.domElement.addEventListener("pointerdown", onPick);
addEventListener("resize", resize);

function animate() {
  const dt = Math.min(clock.getDelta(), 0.033);
  const t = clock.elapsedTime;
  state.holdCamera = Math.max(0, state.holdCamera - dt);

  stars[0].rotation.y += dt * 0.002; stars[1].rotation.y += dt * 0.004;
  stars[1].rotation.x += dt * 0.001;

  for (const s of systems) {
    if (s.body.orbit) {
      s.angle += dt * s.body.os * 0.24 * state.speed;
      s.pivot.rotation.y = s.angle;
    }
    s.spin.rotation.y += dt * s.body.ss * 14 * state.speed;
    s.clouds.forEach((m, i) => { m.rotation.y += dt * (0.08 + i * 0.02) * state.speed; });
    s.moons.forEach((m) => { m.angle += dt * m.speed * 0.22 * state.speed; m.pivot.rotation.y = m.angle; });

    const selected = s.body.key === state.selected;
    s.shell.material.opacity = selected ? (s.body.key === "sun" ? 0.22 : 0.14) + Math.sin(t * 2.4) * 0.035 : 0;
    s.shell.scale.setScalar(1 + (selected ? 0.03 + Math.sin(t * 2.1) * 0.008 : 0));

    if (s.body.key === "sun") {
      const g = s.mesh.userData.sunGlow, c = s.mesh.userData.sunCorona;
      if (g) g.scale.setScalar(1 + Math.sin(t * 2.2) * 0.02);
      if (c) c.scale.setScalar(1 + Math.sin(t * 1.3) * 0.03);
    }

    projectLabel(s);
  }

  updateCamera(dt);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

updateSpeed();
applyToggleVisuals();
updateTabs();
updateLanguageUI();
renderOverviewPanel();
animate();










