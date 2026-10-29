// On és cada cel·la a l'espai 3D, al pla i al planeta. El món té vores dures (fase2/world.js): al planeta és un
// continent de 120° × 60° sobre una esfera, envoltat d'oceà, i les vores són la costa. El pla és tangent a l'esfera
// al centre del continent, i un paràmetre de 0 (pla) a 1 (planeta) passa de l'un a l'altre.
//
// Les coordenades del mapa (u, v) són en cel·les: u de 0 a W d'oest a est, v de 0 a H de nord a sud. Una cel·la fa
// una unitat, també al centre del planeta. L'eix y és amunt.
import { v3 } from './mat4.js';

export const W = 512, H = 256;
export const LON = (2 * Math.PI) / 3, LAT = Math.PI / 3;
export const R = W / LON;

export function sphereDir(u, v) {
  const lon = (u / W - 0.5) * LON, lat = (0.5 - v / H) * LAT;
  return [Math.cos(lat) * Math.sin(lon), Math.cos(lat) * Math.cos(lon), -Math.sin(lat)];
}

export function toWorld(u, v, h, planet) {
  const flat = [u - W / 2, h, v - H / 2];
  if (!planet) return flat;
  const d = sphereDir(u, v), sphere = [(R + h) * d[0], (R + h) * d[1] - R, (R + h) * d[2]];
  return v3.mix(flat, sphere, planet);
}

// La base local d'un punt del mapa: l'est, l'amunt i el sud
export function frameAt(u, v, planet) {
  const lon = (u / W - 0.5) * LON, lat = (0.5 - v / H) * LAT;
  const east = v3.normalize(v3.mix([1, 0, 0], [Math.cos(lon), -Math.sin(lon), 0], planet));
  const up = v3.normalize(v3.mix([0, 1, 0], sphereDir(u, v), planet));
  const south = v3.normalize(v3.mix([0, 0, 1], [Math.sin(lat) * Math.sin(lon), Math.sin(lat) * Math.cos(lon), Math.cos(lat)], planet));
  return { east, up, south };
}

// El punt del mapa (u, v) on un raig toca el terra (h = 0): al pla, el pla y = 0; al planeta, l'esfera. Amb el pas
// d'un a l'altre a mig camí, es fa servir el més proper dels dos. null si el raig no hi arriba
export function pick(origin, dir, planet) {
  if (planet < 0.5) {
    if (Math.abs(dir[1]) < 1e-9) return null;
    const t = -origin[1] / dir[1];
    if (t <= 0) return null;
    const p = v3.add(origin, v3.scale(dir, t));
    return [p[0] + W / 2, p[2] + H / 2];
  }
  const c = [0, -R, 0], oc = v3.sub(origin, c), b = v3.dot(oc, dir), disc = b * b - (v3.dot(oc, oc) - R * R);
  if (disc < 0) return null;
  const t = -b - Math.sqrt(disc);
  if (t <= 0) return null;
  const p = v3.normalize(v3.sub(v3.add(origin, v3.scale(dir, t)), c));
  // de la direcció a la latitud i la longitud (vegeu sphereDir)
  const lat = Math.asin(-p[2]), lon = Math.atan2(p[0], p[1]);
  return [(lon / LON + 0.5) * W, (0.5 - lat / LAT) * H];
}

// El mateix, en GLSL, perquè la GPU i la CPU posin cada cel·la al mateix lloc
export const GLSL_GEO = `
const float W = ${W.toFixed(1)};
const float H = ${H.toFixed(1)};
const float LON = ${LON.toFixed(9)};
const float LAT = ${LAT.toFixed(9)};
const float R = ${R.toFixed(9)};
uniform float uPlanet;
vec3 sphereDir(vec2 m) {
  float lon = (m.x / W - 0.5) * LON, lat = (0.5 - m.y / H) * LAT;
  return vec3(cos(lat) * sin(lon), cos(lat) * cos(lon), -sin(lat));
}
vec3 toWorld(vec2 m, float h) {
  vec3 onPlane = vec3(m.x - W * 0.5, h, m.y - H * 0.5);
  vec3 onSphere = (R + h) * sphereDir(m) - vec3(0.0, R, 0.0);
  return mix(onPlane, onSphere, uPlanet);
}
mat3 frameAt(vec2 m) {
  float lon = (m.x / W - 0.5) * LON, lat = (0.5 - m.y / H) * LAT;
  vec3 east = normalize(mix(vec3(1.0, 0.0, 0.0), vec3(cos(lon), -sin(lon), 0.0), uPlanet));
  vec3 up = normalize(mix(vec3(0.0, 1.0, 0.0), sphereDir(m), uPlanet));
  vec3 south = normalize(mix(vec3(0.0, 0.0, 1.0), vec3(sin(lat) * sin(lon), sin(lat) * cos(lon), cos(lat)), uPlanet));
  return mat3(east, up, south);
}
`;
