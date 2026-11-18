// 引擎烟雾测试：node --experimental-vm-modules 不需要，直接跑 ESM
import { computeLighting, zoneStats, isLampOn, cctToRgb, collectEdges, nearestSnap, suggestLamp } from '../src/engine.js'
import { LAMP_CATALOG } from '../src/model.js'

let pass = 0, fail = 0
const ok = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.error(`  ✗ ${name} ${extra}`) }
}

const lamp = (type, x, y, extra = {}) => ({
  id: `T${Math.random().toString(36).slice(2, 7)}`,
  type, x, y,
  cct: 3000, power: LAMP_CATALOG[type].defaultPower,
  height: LAMP_CATALOG[type].defaultHeight,
  radius: LAMP_CATALOG[type].defaultRadius,
  beam: LAMP_CATALOG[type].defaultBeam,
  dir: Math.PI / 2, mode: 'auto', ...extra,
})

console.log('1) 单灯正下方照度为正且随距离衰减')
{
  const l = lamp('garden', 500, 330)
  const r = computeLighting([l], 0.5)
  const center = r.grid[33 * r.nx + 50]
  const far = r.grid[5 * r.nx + 5]
  ok('中心照度 > 10lx', center > 10, `got ${center.toFixed(2)}`)
  ok('远处照度 < 中心', far < center, `far=${far.toFixed(2)} center=${center.toFixed(2)}`)
  ok('所有网格照度为有限数', r.grid.every((v) => Number.isFinite(v) && v >= 0))
}

console.log('2) 多灯叠加 > 单灯')
{
  const l1 = lamp('garden', 500, 330)
  const l2 = lamp('garden', 500, 330)
  const one = computeLighting([l1], 0.5).grid[33 * 100 + 50]
  const two = computeLighting([l1, l2], 0.5).grid[33 * 100 + 50]
  ok('双灯约为单灯两倍(±15%)', two > one * 1.7 && two < one * 2.15, `${one.toFixed(1)} vs ${two.toFixed(1)}`)
}

console.log('3) 软阴影：树后照度低于无遮挡，半影随距离展宽')
{
  // 受控场景：常开朝下灯在树 t4(400,500,r32) 正上方，避免时间调度与方向余弦干扰
  const l = { ...lamp('garden', 400, 440, { beam: 150, radius: 25, power: 60, height: 3 }), mode: 'on' }
  const r = computeLighting([l], 0.99)
  ok('阴影场景计算稳定', r.grid.every((v) => Number.isFinite(v)))
  ok('activeCount 正确', r.activeCount === 1)
  // y=545 行：树轴 ix=40(x405)，同锥开阔点 ix=46(x465)
  const underTree = r.grid[54 * r.nx + 40]
  const openSide = r.grid[54 * r.nx + 46]
  ok('树后照度显著低于同锥开阔处', underTree < openSide * 0.8,
    `under=${underTree.toFixed(2)} open=${openSide.toFixed(2)}`)
  // 半影：同一轴线上，近树影中心与远处半影区的照度梯度平滑(无突变)
  const near = r.grid[52 * r.nx + 40], mid = r.grid[56 * r.nx + 40], far = r.grid[60 * r.nx + 40]
  ok('轴线照度沿距离单调变化且有限', [near, mid, far].every(Number.isFinite) && near >= mid && mid >= far,
    `${near.toFixed(1)} > ${mid.toFixed(1)} > ${far.toFixed(1)}`)
}

console.log('3b) 帐篷顶挡光（阴影落在灯→帐篷的另一侧）')
{
  const l = { ...lamp('garden', 120, 70, { beam: 120, radius: 15, power: 40, height: 3 }), mode: 'on' }
  const r = computeLighting([l], 0.99)
  const behind = r.grid[16 * r.nx + 12] // (125,165) 帐篷正后方
  const open = r.grid[16 * r.nx + 6]   // (65,165) 同锥开阔
  ok('帐篷后照度显著降低', behind < open * 0.5, `behind=${behind.toFixed(2)} open=${open.toFixed(2)}`)
}

console.log('3c) 围栏挡光：矮灯被挡、高灯可越过')
{
  const low = { ...lamp('garden', 100, 300, { beam: 120, radius: 12, power: 40, height: 2 }), mode: 'on' }
  const high = { ...low, height: 5, id: low.id + 'h' }
  const rl = computeLighting([low], 0.99)
  const rh = computeLighting([high], 0.99)
  const lowOut = rl.grid[30 * rl.nx + 1], lowIn = rl.grid[30 * rl.nx + 5]
  const highOut = rh.grid[30 * rh.nx + 1]
  ok('矮灯围栏外侧低于内侧', lowOut < lowIn * 0.75, `out=${lowOut.toFixed(2)} in=${lowIn.toFixed(2)}`)
  ok('高灯越过围栏，外侧照度高于矮灯', highOut > lowOut, `high=${highOut.toFixed(2)} low=${lowOut.toFixed(2)}`)
}

console.log('4) 时间联动：熄灯时刻灯具全部关闭')
{
  const l = lamp('garden', 500, 330)
  ok('t=1 自动灯关闭', isLampOn(l, 1) === false)
  ok('t=0.5 自动灯开启', isLampOn(l, 0.5) === true)
  ok('常开灯在 t=1 仍开启', isLampOn({ ...l, mode: 'on' }, 1) === true)
  const night = computeLighting([l], 1)
  ok('熄灯后仅剩环境光(<1lx)', night.grid.every((v) => v < 1), `max=${Math.max(...night.grid).toFixed(2)}`)
  const evening = computeLighting([l], 0)
  ok('傍晚部分灯可能关闭但不报错', evening.activeCount <= 1)
}

console.log('5) 区域统计与暗区')
{
  const l = lamp('garden', 500, 330, { radius: 6, power: 15 })
  const r = computeLighting([l], 0.99)
  const stats = zoneStats(r.grid, r.nx, r.ny)
  ok('统计覆盖全部7个区域', stats.length === 7, `got ${stats.length}`)
  ok('平均照度为有限正数', stats.every((s) => Number.isFinite(s.avg) && s.avg >= 0))
  const dark = stats.find((s) => s.darkRatio > 0)
  ok('存在暗区区域(小功率灯)', !!dark)
}

console.log('6) 吸附：边线附近返回吸附点')
{
  const edges = collectEdges()
  ok('收集到吸附边线', edges.length > 30, `got ${edges.length}`)
  // 帐篷位 A 第一个 pad 上边 y=100, x 90..150
  const s = nearestSnap(120, 104, edges, false)
  ok('距边线4单位被吸附', s.d < 6 && Math.abs(s.cy - 100) < 0.01, `d=${s.d.toFixed(2)} cy=${s.cy}`)
  const wall = nearestSnap(100, 60, edges, true)
  ok('壁灯只吸围栏/外墙', wall.edge.kind === 'fence' || wall.edge.kind === 'zone')
}

console.log('7) 暗区点击补灯建议')
{
  const l = lamp('garden', 500, 330, { radius: 5, power: 80 })
  const r = computeLighting([l], 0.5)
  const edges = collectEdges()
  const sg = suggestLamp(r.grid, r.nx, 60, 60, [l], edges)
  ok('暗区返回建议', sg !== null && sg.nearestLamp && sg.suggestion)
  const bright = suggestLamp(r.grid, r.nx, 500, 330, [l], edges)
  ok('亮处点击返回 null', bright === null, `got ${JSON.stringify(bright && bright.suggestion)}`)
}

console.log('8) 色温映射')
{
  const warm = cctToRgb(2700), cool = cctToRgb(6500)
  ok('2700K 偏暖(R>B)', warm[0] > warm[2])
  ok('6500K 近白且蓝通道远高于暖光', cool[2] > warm[2] && cool[0] >= cool[2] - 10,
    `cool=${cool} warm=${warm}`)
}

console.log('9) 性能：20 盏灯全画布重算 < 200ms（滑杆实时联动要求）')
{
  const many = Array.from({ length: 20 }, (_, i) =>
    lamp(i % 4 === 0 ? 'flood' : 'garden', 80 + (i % 5) * 180, 100 + Math.floor(i / 5) * 140))
  const t0 = process.hrtime.bigint()
  const r = computeLighting(many, 0.5)
  const ms = Number(process.hrtime.bigint() - t0) / 1e6
  ok(`重算耗时 ${ms.toFixed(1)}ms`, ms < 200)
  ok('20 盏灯全部计入', r.activeCount === 20)
}

console.log(`\n结果: ${pass} 通过, ${fail} 失败`)
process.exit(fail ? 1 : 0)
