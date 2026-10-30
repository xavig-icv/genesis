// Els poliedres de les instruccions del BFF (fase1/bff.js): un sòlid diferent per a cada instrucció, que en recorda
// el signe vist des de dalt. Cada forma és dins d'una casella d'1 × 1, amb la base a y = 0 (x cap a l'est, z cap al
// sud), i es dibuixa amb ombrejat pla: per a cada vèrtex, la posició i la normal de la seva cara.
//
// Les classes de byte són les de eines/web-dades.mjs: 0 dada (sense forma), 1 el zero, i de 2 a 11 les instruccions
// <>{}-+.,[] en aquest ordre.

export const OPCODES = '<>{}-+.,[]';
// El glif de cada classe de byte, com es mostra (la resta, amb el signe de menys tipogràfic), i la seva classe CSS
// (estil.css): el color és el del tema, per tipus d'instrucció. Els dos caps es distingeixen: el 0 (< >) i l'1 ({ })
export const glyphOf = (cls) => (cls === 0 ? '·' : cls === 1 ? '0' : '<>{}−+.,[]'[cls - 2]);
export const CLASS_GLYPH = ['g-d', 'g-z', 'g-h0', 'g-h0', 'g-h1', 'g-h1', 'g-ar', 'g-ar', 'g-cp', 'g-cp', 'g-lp', 'g-lp'];
// La classe d'un caràcter d'un motiu (el nucli d'una família): 0 si no és cap instrucció
export const classOfChar = (ch) => (OPCODES.includes(ch) ? OPCODES.indexOf(ch) + 2 : ch === '0' ? 1 : 0);
// El que fa cada instrucció (fase1/bff.js), en poques paraules
export const CLASS_NAMES = {
  ca: [null, '0 zero: fa sortir dels bucles', '< cap 0 a l’esquerra', '> cap 0 a la dreta', '{ cap 1 a l’esquerra', '} cap 1 a la dreta',
    '− resta 1 al byte del cap 0', '+ suma 1 al byte del cap 0', '. copia del cap 0 al cap 1', ', copia del cap 1 al cap 0',
    '[ si el cap 0 llegeix 0, salta al ]', '] si no és 0, torna al ['],
  en: [null, '0 zero: ends loops', '< head 0 left', '> head 0 right', '{ head 1 left', '} head 1 right',
    '− subtract 1 at head 0', '+ add 1 at head 0', '. copy head 0 to head 1', ', copy head 1 to head 0',
    '[ if head 0 reads 0, jump past ]', '] if not 0, jump back to ['],
};

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a) || 1; return a.map((x) => x / l); };
const avg = (ps) => ps.reduce((s, p) => [s[0] + p[0] / ps.length, s[1] + p[1] / ps.length, s[2] + p[2] / ps.length], [0, 0, 0]);

// Un sòlid convex, cara a cara: cada cara, un polígon convex. La normal i l'ordre dels vèrtexs miren enfora
function convex(faces, out) {
  const center = avg(faces.flat());
  for (let f of faces) {
    let n = norm(cross(sub(f[1], f[0]), sub(f[2], f[0])));
    const out_ = sub(avg(f), center);
    if (n[0] * out_[0] + n[1] * out_[1] + n[2] * out_[2] < 0) { f = [...f].reverse(); n = n.map((x) => -x); }
    for (let i = 1; i + 1 < f.length; i++) for (const p of [f[0], f[i], f[i + 1]]) out.push(...p, ...n);
  }
}
// Un prisma: un polígon del pla xz, de y0 a y1
function prism(poly, y0, y1, out) {
  const bottom = poly.map(([x, z]) => [x, y0, z]), top = poly.map(([x, z]) => [x, y1, z]);
  const sides = poly.map((_, i) => { const j = (i + 1) % poly.length; return [bottom[i], bottom[j], top[j], top[i]]; });
  convex([bottom, top, ...sides], out);
}
const box = (x0, x1, z0, z1, y0, y1, out) => prism([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], y0, y1, out);
const mirror = (data) => {
  const out = [];
  for (let i = 0; i < data.length; i += 18) {
    // es capgira x, i cada triangle canvia d'ordre perquè la cara continuï mirant enfora
    for (const k of [0, 2, 1]) { const o = i + k * 6; out.push(-data[o], data[o + 1], data[o + 2], -data[o + 3], data[o + 4], data[o + 5]); }
  }
  return out;
};

function icosahedron(r, cy, out) {
  const t = (1 + Math.sqrt(5)) / 2;
  const v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]]
    .map((p) => norm(p).map((x, i) => x * r + (i === 1 ? cy : 0)));
  const f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  convex(f.map((tri) => tri.map((i) => v[i])), out);
}

function build() {
  const s = [];
  const zero = []; icosahedron(0.22, 0.22, zero);
  // < i >: una falca, la punta cap a on es mou el cap 0
  const lt = []; prism([[-0.45, 0], [0.4, -0.38], [0.4, 0.38]], 0, 0.5, lt);
  // { i }: una piràmide ajaguda, la punta cap a on es mou el cap 1
  const lb = [];
  const base = [[0.4, 0, -0.38], [0.4, 0, 0.38], [0.4, 0.76, 0.38], [0.4, 0.76, -0.38]], apex = [-0.45, 0.38, 0];
  convex([base, ...base.map((p, i) => [p, base[(i + 1) % 4], apex])], lb);
  // − i +: una barra i una creu
  const minus = []; box(-0.42, 0.42, -0.14, 0.14, 0, 0.22, minus);
  const plus = []; box(-0.42, 0.42, -0.14, 0.14, 0, 0.22, plus); box(-0.14, 0.14, -0.42, 0.42, 0, 0.22, plus);
  // . i ,: un octàedre i un tetràedre (les dues còpies, en sentits contraris)
  const dot = [];
  const c = 0.42, r = 0.4, oct = [[r, c, 0], [-r, c, 0], [0, c + r, 0], [0, c - r, 0], [0, c, r], [0, c, -r]];
  convex([[0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2], [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5]].map((t) => t.map((i) => oct[i])), dot);
  const comma = [];
  const tb = [0, 1, 2].map((i) => [0.42 * Math.cos((i * 2 * Math.PI) / 3 + Math.PI / 2), 0, 0.42 * Math.sin((i * 2 * Math.PI) / 3 + Math.PI / 2)]), ta = [0, 0.75, 0];
  convex([tb, [tb[0], tb[1], ta], [tb[1], tb[2], ta], [tb[2], tb[0], ta]], comma);
  // [ i ]: el claudàtor, vist des de dalt
  const open = [];
  box(-0.42, -0.24, -0.44, 0.44, 0, 0.45, open); box(-0.42, 0.3, -0.44, -0.28, 0, 0.45, open); box(-0.42, 0.3, 0.28, 0.44, 0, 0.45, open);
  s[1] = zero; s[2] = lt; s[3] = mirror(lt); s[4] = lb; s[5] = mirror(lb); s[6] = minus; s[7] = plus;
  s[8] = dot; s[9] = comma; s[10] = open; s[11] = mirror(open);
  return s.map((d) => (d ? { data: new Float32Array(d), count: d.length / 6 } : null));
}

export const SHAPES = build();
