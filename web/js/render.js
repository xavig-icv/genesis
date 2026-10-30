// El dibuix del món amb WebGL2: el cel, l'oceà, una columna per cel·la (de lluny), el tauler de cada cel·la al cim de
// la seva columna i els poliedres de les instruccions (de prop), i l'atmosfera del planeta. La GPU llegeix els mapes de
// dos fotogrames (A i B) i hi interpola, de manera que el temps flueix entre els fotogrames. Els colors són els del
// tema (setTheme, amb les fitxes de tema.js).
import { compile, intTexture, updateIntTexture } from './gl.js';
import { GLSL_GEO, W, H, LON, LAT } from './geo.js';
import { SHAPES } from './formes.js';

const HEADER = `#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
`;
// L'alçada d'una columna segons les instruccions de la cel·la (de 0 a 64). Els programes a l'atzar en tenen unes 2,5
const HEIGHT = `
uniform float uHeight;
float heightOf(float k) { return 0.06 + uHeight * k / 64.0; }
`;
const FOG = `
uniform vec3 uEye;
uniform vec3 uFogColor;
uniform float uFog;
vec3 fogged(vec3 col, vec3 p) {
  float d = length(p - uEye) * uFog;
  return mix(col, uFogColor, 1.0 - exp(-d * d));
}
`;

const COLUMN_VS = HEADER + GLSL_GEO + HEIGHT + `
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
uniform mat4 uViewProj;
uniform usampler2D uFamA, uFamB, uKA, uKB;
uniform sampler2D uPalA, uPalB;
uniform float uT;
uniform vec3 uCellLo, uCellHi;
out vec3 vColor;
out vec3 vNormal;
out vec3 vWorld;
out vec2 vUV;
out float vTop;
flat out int vCell;
// una cel·la sense família, de buida a densa en instruccions
vec3 soil(float k) { return mix(uCellLo, uCellHi, clamp(k / 24.0, 0.0, 1.0)); }
void main() {
  int c = gl_InstanceID;
  ivec2 cell = ivec2(c % int(W), c / int(W));
  uint fa = texelFetch(uFamA, cell, 0).r, fb = texelFetch(uFamB, cell, 0).r;
  float ka = float(texelFetch(uKA, cell, 0).r), kb = float(texelFetch(uKB, cell, 0).r);
  vec3 ca = fa > 0u ? texelFetch(uPalA, ivec2(int(fa), 0), 0).rgb : soil(ka);
  vec3 cb = fb > 0u ? texelFetch(uPalB, ivec2(int(fb), 0), 0).rgb : soil(kb);
  vColor = mix(ca, cb, uT);
  float h = mix(heightOf(ka), heightOf(kb), uT);
  vec2 m = vec2(cell) + aPos.xz;
  vec3 p = toWorld(m, aPos.y * h);
  vNormal = frameAt(m) * aNormal;
  vWorld = p;
  vUV = aPos.xz;
  vTop = aNormal.y;
  vCell = c;
  gl_Position = uViewProj * vec4(p, 1.0);
}
`;
const COLUMN_FS = HEADER + FOG + `
uniform vec3 uSun;
uniform float uCodeMix;
uniform float uGridMix;
uniform float uPlanet;
uniform int uHover;
uniform vec3 uStage;
uniform float uBoardTint;
uniform vec4 uGround;
uniform vec3 uHoverOutline, uHoverHalo;
uniform float uShade;
in vec3 vColor;
in vec3 vNormal;
in vec3 vWorld;
in vec2 vUV;
in float vTop;
flat in int vCell;
out vec4 outColor;
// 1 sobre una línia d'amplada w (en les unitats de d) i 0 fora, amb la vora suavitzada
float line(float d, float w) { return 1.0 - smoothstep(w * 0.5, w * 1.5, d); }
void main() {
  vec3 n = normalize(vNormal), base = vColor;
  bool top = vTop > 0.5;
  vec2 px = fwidth(vUV);
  if (top && uCodeMix > 0.0) {
    // de prop, el tauler: el color de la cel·la tenyit amb l'escenari, perquè els sòlids hi destaquin, i una
    // quadrícula de 8 × 8, un quadre per byte, com a la interfície
    vec3 board = mix(uStage, base, uBoardTint);
    vec2 f = fract(vUV * 8.0);
    float e = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)) / 8.0;
    board = mix(board, mix(board, base, 0.45), line(e, max(px.x, px.y) * 0.9));
    base = mix(base, board, uCodeMix);
  } else if (!top && uCodeMix > 0.0) base = mix(base, mix(uStage, base, uBoardTint), uCodeMix);
  // la llum: al tema clar, més suau (uShade < 1), perquè els costats no s'enfosqueixin com sobre el fosc
  float light = 0.3 + 0.8 * max(dot(n, uSun), 0.0);
  if (!top) light *= 0.72;
  light = mix(1.0, light, uShade);
  vec3 col = base * light;
  if (top) {
    // de mig a prop, la vora de cada cel·la, del color de l'escenari
    float e = min(min(vUV.x, 1.0 - vUV.x), min(vUV.y, 1.0 - vUV.y));
    if (uGridMix > 0.0) col = mix(col, mix(col, uStage, 0.6), line(e, max(px.x, px.y) * 1.2 + 0.02) * uGridMix);
    // al pla, la graella de terra, cada 32 cel·les
    vec2 m = vec2(float(vCell % 512), float(vCell / 512)) + vUV;
    vec2 g = abs(fract(m / 32.0 + 0.5) - 0.5) * 32.0;
    float gr = max(line(g.x, fwidth(m.x)), line(g.y, fwidth(m.y)));
    col = mix(col, uGround.rgb, uGround.a * gr * (1.0 - uPlanet));
    // la cel·la sota el punter: una vora en tinta, amb un halo perquè es vegi sobre qualsevol color
    if (vCell == uHover) {
      float w = max(px.x, px.y);
      col = e < w * 2.0 ? uHoverOutline : (e < w * 3.0 ? uHoverHalo : col);
    }
  }
  outColor = vec4(fogged(col, vWorld), 1.0);
}
`;

const SHAPE_VS = HEADER + GLSL_GEO + HEIGHT + `
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in uvec2 aInst;
uniform mat4 uViewProj;
uniform usampler2D uKA, uKB;
uniform float uT;
uniform float uScale;
out vec3 vNormal;
out vec3 vWorld;
void main() {
  int c = int(aInst.x), i = int(aInst.y);
  ivec2 cell = ivec2(c % int(W), c / int(W));
  float h = mix(heightOf(float(texelFetch(uKA, cell, 0).r)), heightOf(float(texelFetch(uKB, cell, 0).r)), uT);
  vec2 m = vec2(cell) + (vec2(float(i % 8), float(i / 8)) + 0.5) / 8.0;
  mat3 fr = frameAt(m);
  vec3 p = toWorld(m, h) + fr * (aPos * uScale);
  vNormal = fr * aNormal;
  vWorld = p;
  gl_Position = uViewProj * vec4(p, 1.0);
}
`;
const SHAPE_FS = HEADER + FOG + `
uniform vec3 uSun;
uniform vec3 uColor;
in vec3 vNormal;
in vec3 vWorld;
out vec4 outColor;
void main() {
  vec3 n = normalize(vNormal), v = normalize(uEye - vWorld);
  float diff = max(dot(n, uSun), 0.0), spec = pow(max(dot(reflect(-uSun, n), v), 0.0), 24.0);
  vec3 col = uColor * (0.35 + 0.75 * diff) + vec3(0.35) * spec;
  outColor = vec4(fogged(col, vWorld), 1.0);
}
`;

// L'oceà: una malla de tota l'esfera (al pla, un pla gran al voltant del món)
const OCEAN_VS = HEADER + GLSL_GEO + `
layout(location = 0) in vec2 aMap;
uniform mat4 uViewProj;
out vec3 vWorld;
out vec3 vNormal;
void main() {
  vec3 p = toWorld(aMap, -0.04);
  vWorld = p;
  vNormal = frameAt(aMap)[1];
  gl_Position = uViewProj * vec4(p, 1.0);
}
`;
const OCEAN_FS = HEADER + FOG + `
uniform vec3 uSun;
uniform float uTime;
uniform float uPlanet;
uniform vec3 uDeep, uShallow, uAtmos;
uniform float uSpec;
in vec3 vWorld;
in vec3 vNormal;
out vec4 outColor;
void main() {
  vec3 n = normalize(vNormal);
  // onades suaus: dues ones que es creuen, només a la normal
  float a = sin(vWorld.x * 0.21 + uTime * 0.6) * 0.5 + sin(vWorld.z * 0.17 - uTime * 0.45 + vWorld.x * 0.05) * 0.5;
  n = normalize(n + 0.05 * vec3(cos(vWorld.x * 0.21 + uTime * 0.6), 0.0, cos(vWorld.z * 0.17 - uTime * 0.45)));
  vec3 v = normalize(uEye - vWorld);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);
  float spec = pow(max(dot(reflect(-uSun, n), v), 0.0), 80.0);
  vec3 col = mix(uDeep, uShallow, 0.5 + 0.5 * a * 0.3) * (0.55 + 0.45 * max(dot(n, uSun), 0.0));
  col += uAtmos * fres * 0.35 + vec3(1.0) * spec * uSpec;
  // al pla, el món és sobre l'escenari: l'oceà només es veu al planeta
  outColor = vec4(mix(uFogColor, fogged(col, vWorld), uPlanet), 1.0);
}
`;

// Les estrelles: punts en una esfera molt gran
const STAR_VS = HEADER + `
layout(location = 0) in vec4 aStar;
uniform mat4 uViewProj;
uniform vec3 uEye;
uniform float uPlanet;
uniform float uPixel;
out float vBright;
void main() {
  vec3 dir = aStar.xyz;
  // al pla, només les de sobre l'horitzó
  vBright = aStar.w * mix(smoothstep(-0.02, 0.12, dir.y), 1.0, uPlanet);
  gl_Position = uViewProj * vec4(uEye + dir * 20000.0, 1.0);
  gl_Position.z = gl_Position.w * 0.99999;
  gl_PointSize = (1.0 + 1.8 * aStar.w) * uPixel;
}
`;
const STAR_FS = HEADER + `
uniform vec3 uFogColor;
in float vBright;
out vec4 outColor;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float a = smoothstep(1.0, 0.0, dot(q, q)) * vBright;
  outColor = vec4(mix(uFogColor, vec3(0.957, 0.953, 0.937), a * 0.8), 1.0);
}
`;

// L'atmosfera del planeta: una esfera una mica més gran, amb una lluïssor a la vora
const ATMO_VS = HEADER + GLSL_GEO + `
layout(location = 0) in vec2 aMap;
uniform mat4 uViewProj;
out vec3 vWorld;
out vec3 vNormal;
void main() {
  vec3 d = sphereDir(aMap);
  vec3 p = d * R * 1.035 - vec3(0.0, R, 0.0);
  vWorld = p;
  vNormal = d;
  gl_Position = uViewProj * vec4(p, 1.0);
}
`;
const ATMO_FS = HEADER + `
uniform vec3 uEye;
uniform vec3 uSun;
uniform float uPlanet;
uniform vec3 uAtmos;
in vec3 vWorld;
in vec3 vNormal;
out vec4 outColor;
void main() {
  vec3 n = normalize(vNormal), v = normalize(uEye - vWorld);
  float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  float day = 0.35 + 0.65 * max(dot(n, uSun), 0.0);
  float a = clamp(rim * day * uPlanet * 0.9, 0.0, 1.0);
  outColor = vec4(uAtmos * a, a);
}
`;

// La columna d'una cel·la: una capsa d'1 × 1 de base i d'alçada 1, sense la cara de sota (5 cares, 20 vèrtexs)
function columnGeometry() {
  const v = [], idx = [];
  const face = (pts, n) => { const b = v.length / 6; for (const p of pts) v.push(...p, ...n); idx.push(b, b + 1, b + 2, b, b + 2, b + 3); };
  face([[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]], [0, 1, 0]);
  face([[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]], [0, 0, 1]);
  face([[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]], [0, 0, -1]);
  face([[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]], [1, 0, 0]);
  face([[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]], [-1, 0, 0]);
  return { vertices: new Float32Array(v), indices: new Uint16Array(idx) };
}
// Una malla de l'esfera sencera en coordenades del mapa (u, v)
function sphereGrid(nLon, nLat) {
  const v = [], idx = [];
  for (let j = 0; j <= nLat; j++) {
    const lat = (-0.5 + j / nLat) * Math.PI * 0.985;
    for (let i = 0; i <= nLon; i++) {
      const lon = (-0.5 + i / nLon) * 2 * Math.PI;
      v.push((lon / LON + 0.5) * W, (0.5 - lat / LAT) * H);
    }
  }
  for (let j = 0; j < nLat; j++) for (let i = 0; i < nLon; i++) {
    const a = j * (nLon + 1) + i, b = a + nLon + 1;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  return { vertices: new Float32Array(v), indices: new Uint32Array(idx) };
}

// starCount: les estrelles del tema fosc (el planeta de la portada en té més)
export function createRenderer(canvas, { starCount = 2600 } = {}) {
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;
  const P = {
    column: compile(gl, COLUMN_VS, COLUMN_FS),
    shape: compile(gl, SHAPE_VS, SHAPE_FS),
    ocean: compile(gl, OCEAN_VS, OCEAN_FS),
    star: compile(gl, STAR_VS, STAR_FS),
    atmo: compile(gl, ATMO_VS, ATMO_FS),
  };
  const n = W * H;

  // les columnes
  const col = columnGeometry();
  const colVao = gl.createVertexArray();
  gl.bindVertexArray(colVao);
  const colVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colVbo);
  gl.bufferData(gl.ARRAY_BUFFER, col.vertices, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
  const colIbo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, colIbo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, col.indices, gl.STATIC_DRAW);

  // els poliedres: una VAO per forma, amb el buffer d'instàncies comú (cel·la, byte)
  const instBuf = gl.createBuffer();
  const shapes = SHAPES.map((s) => {
    if (!s) return null;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, s.data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
    gl.enableVertexAttribArray(2); gl.vertexAttribIPointer(2, 2, gl.UNSIGNED_INT, 8, 0); gl.vertexAttribDivisor(2, 1);
    return { vao, count: s.count, start: 0, n: 0 };
  });

  // l'oceà i l'atmosfera, la mateixa malla
  const grid = sphereGrid(192, 96);
  const gridVao = gl.createVertexArray();
  gl.bindVertexArray(gridVao);
  const gridVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, gridVbo);
  gl.bufferData(gl.ARRAY_BUFFER, grid.vertices, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
  const gridIbo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gridIbo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, grid.indices, gl.STATIC_DRAW);

  // les estrelles, amb una llavor fixa perquè el cel sigui sempre el mateix (les primeres 2.600 no depenen de quantes n'hi ha)
  let s = 20261029;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const stars = new Float32Array(starCount * 4);
  for (let i = 0; i < starCount; i++) {
    const z = rnd() * 2 - 1, a = rnd() * 2 * Math.PI, r = Math.sqrt(1 - z * z);
    stars.set([r * Math.cos(a), z, r * Math.sin(a), Math.pow(rnd(), 3)], i * 4);
  }
  const starVao = gl.createVertexArray();
  gl.bindVertexArray(starVao);
  const starVbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, starVbo);
  gl.bufferData(gl.ARRAY_BUFFER, stars, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);
  gl.bindVertexArray(null);

  // els mapes dels dos fotogrames, les seves paletes i el codi
  const famA = intTexture(gl, gl.R8UI, gl.RED_INTEGER, gl.UNSIGNED_BYTE, W, H);
  const famB = intTexture(gl, gl.R8UI, gl.RED_INTEGER, gl.UNSIGNED_BYTE, W, H);
  const kA = intTexture(gl, gl.R8UI, gl.RED_INTEGER, gl.UNSIGNED_BYTE, W, H);
  const kB = intTexture(gl, gl.R8UI, gl.RED_INTEGER, gl.UNSIGNED_BYTE, W, H);
  const palTex = () => {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    for (const p of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, p, gl.NEAREST);
    return t;
  };
  const palA = palTex(), palB = palTex();
  // el tema: els colors de l'escenari, de les cel·les i dels sòlids (tema.js, readStageTokens)
  let theme = null;
  const rgb = (c) => c.slice(0, 3);

  const state = { hasCode: false, instances: 0 };

  return {
    gl,
    // els mapes de dos fotogrames: el de la família de cada cel·la, el de les instruccions i la paleta
    setFrames(a, b) {
      updateIntTexture(gl, famA, gl.RED_INTEGER, gl.UNSIGNED_BYTE, W, H, a.fam);
      updateIntTexture(gl, kA, gl.RED_INTEGER, gl.UNSIGNED_BYTE, W, H, a.k);
      updateIntTexture(gl, famB, gl.RED_INTEGER, gl.UNSIGNED_BYTE, W, H, b.fam);
      updateIntTexture(gl, kB, gl.RED_INTEGER, gl.UNSIGNED_BYTE, W, H, b.k);
      for (const [t, p] of [[palA, a.palette], [palB, b.palette]]) {
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 256, 1, gl.RGBA, gl.UNSIGNED_BYTE, p);
      }
    },
    // si hi ha el codi d'una època (els sòlids, de prop, surten de setInstances)
    setCode(bytes) { state.hasCode = !!bytes; },
    setTheme(tokens) { theme = tokens; },
    get theme() { return theme; },
    // els poliedres d'una finestra de cel·les: les instruccions i els zeros, agrupats per forma
    setInstances(bytes, x0, y0, x1, y1) {
      if (!bytes) { state.instances = 0; for (const s of shapes) if (s) s.n = 0; return 0; }
      const lists = shapes.map(() => []);
      for (let y = Math.max(0, y0); y < Math.min(H, y1); y++) {
        for (let x = Math.max(0, x0); x < Math.min(W, x1); x++) {
          const c = y * W + x, base = c * 64;
          for (let i = 0; i < 64; i++) { const k = bytes[base + i]; if (k) lists[k].push(c, i); }
        }
      }
      const total = lists.reduce((s, l) => s + l.length, 0) / 2;
      const all = new Uint32Array(total * 2);
      let off = 0;
      shapes.forEach((s, k) => { if (!s) return; s.start = off / 2; s.n = lists[k].length / 2; all.set(lists[k], off); off += lists[k].length; });
      gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
      gl.bufferData(gl.ARRAY_BUFFER, all, gl.DYNAMIC_DRAW);
      state.instances = total;
      return total;
    },
    resize(width, height) { canvas.width = width; canvas.height = height; gl.viewport(0, 0, width, height); },
    draw(v) {
      const fogColor = rgb(theme.background);
      gl.clearColor(...fogColor, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      const common = (p) => {
        gl.useProgram(p.program);
        gl.uniformMatrix4fv(p.u.uViewProj, false, v.viewProj);
        if (p.u.uEye) gl.uniform3fv(p.u.uEye, v.eye);
        if (p.u.uPlanet) gl.uniform1f(p.u.uPlanet, v.planet);
        if (p.u.uSun) gl.uniform3fv(p.u.uSun, v.sun);
        if (p.u.uFogColor) gl.uniform3fv(p.u.uFogColor, fogColor);
        if (p.u.uFog) gl.uniform1f(p.u.uFog, v.fog);
        if (p.u.uHeight) gl.uniform1f(p.u.uHeight, v.height);
      };
      // 1. les estrelles, només al tema fosc
      if (theme.stars) {
        gl.depthMask(false);
        common(P.star);
        gl.uniform1f(P.star.u.uPixel, v.pixel);
        gl.bindVertexArray(starVao);
        gl.drawArrays(gl.POINTS, 0, stars.length / 4);
        gl.depthMask(true);
      }
      // 2. l'oceà
      common(P.ocean);
      gl.uniform1f(P.ocean.u.uTime, v.time);
      gl.uniform3fv(P.ocean.u.uDeep, rgb(theme.oceanDeep));
      gl.uniform3fv(P.ocean.u.uShallow, rgb(theme.oceanShallow));
      gl.uniform3fv(P.ocean.u.uAtmos, rgb(theme.atmosphere));
      gl.uniform1f(P.ocean.u.uSpec, theme.stars ? 0.6 : 0.3);
      gl.bindVertexArray(gridVao);
      gl.drawElements(gl.TRIANGLES, grid.indices.length, gl.UNSIGNED_INT, 0);
      // 3. les columnes
      const bindMaps = (p) => {
        const units = [['uFamA', famA], ['uFamB', famB], ['uKA', kA], ['uKB', kB], ['uPalA', palA], ['uPalB', palB]];
        units.forEach(([name, t], i) => { if (p.u[name] === undefined) return; gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(p.u[name], i); });
        gl.uniform1f(p.u.uT, v.t);
      };
      common(P.column);
      bindMaps(P.column);
      gl.uniform1f(P.column.u.uCodeMix, state.hasCode ? v.codeMix : 0);
      gl.uniform1f(P.column.u.uGridMix, v.gridMix);
      gl.uniform1i(P.column.u.uHover, v.hover ?? -1);
      gl.uniform3fv(P.column.u.uCellLo, rgb(theme.cellLow));
      gl.uniform3fv(P.column.u.uCellHi, rgb(theme.cellHigh));
      gl.uniform3fv(P.column.u.uStage, fogColor);
      gl.uniform1f(P.column.u.uBoardTint, theme.boardTint);
      gl.uniform4fv(P.column.u.uGround, theme.grid);
      gl.uniform3fv(P.column.u.uHoverOutline, rgb(theme.hoverOutline));
      gl.uniform3fv(P.column.u.uHoverHalo, rgb(theme.hoverHalo));
      gl.uniform1f(P.column.u.uShade, theme.stars ? 1 : 0.6);
      gl.enable(gl.CULL_FACE);
      gl.cullFace(gl.BACK);
      gl.bindVertexArray(colVao);
      gl.drawElementsInstanced(gl.TRIANGLES, col.indices.length, gl.UNSIGNED_SHORT, 0, n);
      gl.disable(gl.CULL_FACE);
      // 4. els poliedres
      if (state.instances && v.codeMix > 0.01) {
        common(P.shape);
        bindMaps(P.shape);
        gl.uniform1f(P.shape.u.uScale, 0.115 * Math.min(1, v.codeMix * 1.5));
        shapes.forEach((s, k) => {
          if (!s || !s.n) return;
          gl.bindVertexArray(s.vao);
          gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
          gl.vertexAttribIPointer(2, 2, gl.UNSIGNED_INT, 8, s.start * 8);
          gl.uniform3fv(P.shape.u.uColor, rgb(theme.lit[k]));
          gl.drawArraysInstanced(gl.TRIANGLES, 0, s.count, s.n);
        });
      }
      // 5. l'atmosfera, només al planeta
      if (v.planet > 0.01) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
        common(P.atmo);
        gl.uniform3fv(P.atmo.u.uAtmos, rgb(theme.atmosphere));
        gl.bindVertexArray(gridVao);
        gl.drawElements(gl.TRIANGLES, grid.indices.length, gl.UNSIGNED_INT, 0);
        gl.depthMask(true);
        gl.disable(gl.BLEND);
      }
      gl.bindVertexArray(null);
    },
  };
}
