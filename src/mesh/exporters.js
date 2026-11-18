// 导出 glb / obj，材质名与网格名带色卡名
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { PALETTE, paletteName } from '../state/palette';

// 体素坐标 → 世界毫米坐标（与视口一致：体素 y→世界 z，体素 z→世界 y，整体居中）
function buildColorGroups(model, dec) {
  const s = model.cellMm;
  const cx = model.nx / 2, cy = model.ny / 2, cz = model.nz / 2;
  const groups = new Map();
  dec.tris.forEach((t, i) => {
    const c = dec.triColors[i];
    let arr = groups.get(c);
    if (!arr) groups.set(c, (arr = []));
    for (const v of t) {
      const x = dec.positions[v * 3], y = dec.positions[v * 3 + 1], z = dec.positions[v * 3 + 2];
      arr.push((x - cx) * s, (z - cz) * s, (y - cy) * s);
    }
  });
  return groups;
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function exportGLB(model, dec) {
  const groups = buildColorGroups(model, dec);
  const root = new THREE.Group();
  root.name = model.name;
  for (const [c, arr] of groups) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    geo.computeVertexNormals();
    const pal = PALETTE[c] || { name: '色' + c, hex: '#999999' };
    const mat = new THREE.MeshStandardMaterial({
      name: pal.name,
      color: new THREE.Color(pal.hex),
      roughness: 0.55,
      metalness: 0.05,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = model.name + '_' + pal.name;
    root.add(mesh);
  }
  new GLTFExporter().parse(
    root,
    (buf) => download(new Blob([buf], { type: 'model/gltf-binary' }), `${model.name}_${model.cellMm}mm.glb`),
    (err) => console.error('GLB 导出失败', err),
    { binary: true }
  );
}

export function exportOBJ(model, dec) {
  const groups = buildColorGroups(model, dec);
  let out = `# 宠物咬胶体素模型\n# 模型: ${model.name}  栅格: ${model.cellMm}mm\n`;
  let vi = 1;
  for (const [c, arr] of groups) {
    out += `o ${model.name}_${paletteName(c)}\nusemtl ${paletteName(c)}\n`;
    for (let i = 0; i < arr.length; i += 3)
      out += `v ${arr[i].toFixed(3)} ${arr[i + 1].toFixed(3)} ${arr[i + 2].toFixed(3)}\n`;
    for (let i = 0; i < arr.length; i += 9) {
      out += `f ${vi} ${vi + 1} ${vi + 2}\n`;
      vi += 3;
    }
  }
  download(new Blob([out], { type: 'text/plain;charset=utf-8' }), `${model.name}_${model.cellMm}mm.obj`);
}
