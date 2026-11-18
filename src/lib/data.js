// 世界布局与模拟数据生成
// 世界坐标单位约为"米",整张图约 300 x 210

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20261119)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]

export const STATUS = {
  empty:     { label: '空置',     color: [0.78, 0.80, 0.84, 1], css: '#c7ccd4', badge: '' },
  occupied:  { label: '在住',     color: [0.30, 0.56, 0.94, 1], css: '#4d8ff0', badge: '🐾' },
  isolation: { label: '隔离观察', color: [0.95, 0.55, 0.18, 1], css: '#f28c2e', badge: '⛔' },
  adoptable: { label: '待领养',   color: [0.22, 0.72, 0.45, 1], css: '#38b873', badge: '⭐' },
}

export const ROOM_COLORS = {
  isolation: [0.85, 0.30, 0.30, 0.85],
  medical:   [0.30, 0.75, 0.75, 0.85],
  wash:      [0.55, 0.55, 0.95, 0.85],
}
export const ROOM_LABEL = { isolation: '隔离间', medical: '医疗间', wash: '洗消间' }

const DOGS = ['中华田园犬', '金毛', '拉布拉多', '泰迪', '柯基', '哈士奇']
const CATS = ['中华田园猫', '英国短毛猫', '美国短毛猫', '布偶猫', '橘猫', '暹罗猫']
export const BREEDS = { 犬: DOGS, 猫: CATS }
const NAMES = ['小白', '旺财', '咪咪', '豆豆', '花花', '小黑', '球球', '毛毛', '阿福', '可乐', '年糕', '布丁', '多多', '米粒', '跳跳']

const DAY = 86400000
export const todayStr = () => new Date().toISOString().slice(0, 10)

export function genAnimal(status, species) {
  const cat = species ? species === '猫' : rand() < 0.5
  const intake = Date.now() - Math.floor(rand() * 60) * DAY
  return {
    name: pick(NAMES),
    species: cat ? '猫' : '犬',
    breed: cat ? pick(CATS) : pick(DOGS),
    emoji: cat ? '🐱' : '🐶',
    gender: rand() < 0.5 ? '公' : '母',
    intakeDate: new Date(intake).toISOString().slice(0, 10),
    obsDue: status === 'isolation' ? new Date(Date.now() + (1 + Math.floor(rand() * 9) - 3) * DAY).toISOString().slice(0, 10) : null,
  }
}

export function buildWorld() {
  // 4 个收容区,每区 24 列 x 14 行 = 336 个笼位,共 1344 个
  const zones = [
    { id: 'A', name: 'A 区 · 犬舍一', x: 20,  y: 20, w: 119, h: 55, color: [0.85, 0.90, 1.00, 0.9] },
    { id: 'B', name: 'B 区 · 猫舍',   x: 160, y: 20, w: 119, h: 55, color: [0.88, 1.00, 0.90, 0.9] },
    { id: 'C', name: 'C 区 · 犬舍二', x: 20,  y: 96, w: 119, h: 55, color: [1.00, 0.95, 0.85, 0.9] },
    { id: 'D', name: 'D 区 · 混养区', x: 160, y: 96, w: 119, h: 55, color: [0.95, 0.88, 1.00, 0.9] },
  ]

  const cages = []
  for (const z of zones) {
    for (let r = 0; r < 14; r++) {
      for (let c = 0; c < 24; c++) {
        const code = `${z.id}-${String(r + 1).padStart(2, '0')}${String(c + 1).padStart(2, '0')}`
        const p = rand()
        const status = p < 0.25 ? 'empty' : p < 0.72 ? 'occupied' : p < 0.87 ? 'adoptable' : 'isolation'
        const cage = {
          code, zone: z.id,
          x: z.x + 1 + c * 5, y: z.y + 1 + r * 4, w: 4, h: 3,
          status, animal: null,
        }
        if (status !== 'empty') {
          const species = z.id === 'B' ? '猫' : (z.id === 'A' || z.id === 'C') ? '犬' : null
          cage.animal = genAnimal(status, species)
        }
        cages.push(cage)
      }
    }
  }

  const corridors = [
    { id: 'cor-v', x: 139, y: 20,  w: 21,  h: 131, label: '中央竖通道' },
    { id: 'cor-h', x: 20,  y: 75,  w: 259, h: 21,  label: '中央横通道' },
    { id: 'cor-b', x: 20,  y: 151, w: 259, h: 21,  label: '南侧通道' },
  ]

  const rooms = [
    { id: 'iso-1',  type: 'isolation', label: '隔离间 1', x: 20,  y: 172, w: 22, h: 24 },
    { id: 'iso-2',  type: 'isolation', label: '隔离间 2', x: 44,  y: 172, w: 22, h: 24 },
    { id: 'iso-3',  type: 'isolation', label: '隔离间 3', x: 68,  y: 172, w: 22, h: 24 },
    { id: 'med-1',  type: 'medical',   label: '医疗间',   x: 100, y: 172, w: 30, h: 24 },
    { id: 'wash-1', type: 'wash',      label: '洗消间',   x: 140, y: 172, w: 30, h: 24 },
  ]

  const cameras = []
  let ci = 1
  for (let y = 28; y < 150; y += 20) cameras.push({ id: `CAM-${String(ci++).padStart(2, '0')}`, x: 149.5, y })
  for (let x = 30; x < 270; x += 24) cameras.push({ id: `CAM-${String(ci++).padStart(2, '0')}`, x, y: 85.5 })
  cameras.push({ id: `CAM-${String(ci++).padStart(2, '0')}`, x: 31,  y: 184 })
  cameras.push({ id: `CAM-${String(ci++).padStart(2, '0')}`, x: 115, y: 184 })
  cameras.push({ id: `CAM-${String(ci++).padStart(2, '0')}`, x: 155, y: 184 })

  return { zones, cages, corridors, rooms, cameras }
}
