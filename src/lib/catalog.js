// 器材型号目录 —— 尺寸单位:米。每个类型提供多个型号，更换型号时三维尺寸同步变化。
export const EQUIP_CATALOG = [
  {
    type: 'pool',
    label: '泳池',
    water: true,
    models: [
      { id: 'PL-S2', name: 'PL-S2 小型训练池', L: 2.0, W: 1.5, H: 1.1, depth: 0.9 },
      { id: 'PL-M3', name: 'PL-M3 标准康复池', L: 3.0, W: 2.0, H: 1.2, depth: 1.0 },
      { id: 'PL-L4', name: 'PL-L4 大型游训池', L: 4.0, W: 2.5, H: 1.4, depth: 1.2 }
    ]
  },
  {
    type: 'ramp',
    label: '缓坡道',
    water: false,
    models: [
      { id: 'RP-15', name: 'RP-15 入门坡道', L: 1.2, W: 0.8, H: 0.15, slope: 0.125 },
      { id: 'RP-25', name: 'RP-25 通用坡道', L: 2.0, W: 1.0, H: 0.25, slope: 0.125 },
      { id: 'RP-40', name: 'RP-40 入水坡道', L: 3.0, W: 1.2, H: 0.4, slope: 0.133 }
    ]
  },
  {
    type: 'treadmill',
    label: '水下跑台',
    water: true,
    models: [
      { id: 'TM-12', name: 'TM-12 迷你跑台', L: 1.2, W: 0.7, H: 0.9, depth: 0.6 },
      { id: 'TM-20', name: 'TM-20 标准跑台', L: 2.0, W: 0.9, H: 1.0, depth: 0.75 },
      { id: 'TM-28', name: 'TM-28 大型跑台', L: 2.8, W: 1.1, H: 1.1, depth: 0.85 }
    ]
  },
  {
    type: 'mat',
    label: '防滑垫',
    water: false,
    models: [
      { id: 'MT-10', name: 'MT-10 小防滑垫', L: 1.0, W: 1.0, H: 0.02 },
      { id: 'MT-20', name: 'MT-20 标准防滑垫', L: 2.0, W: 1.2, H: 0.02 },
      { id: 'MT-30', name: 'MT-30 长条防滑垫', L: 3.0, W: 1.0, H: 0.02 }
    ]
  },
  {
    type: 'fence',
    label: '围栏',
    water: false,
    models: [
      { id: 'FE-10', name: 'FE-10 单格围栏', L: 1.0, W: 0.05, H: 1.0 },
      { id: 'FE-20', name: 'FE-20 双格围栏', L: 2.0, W: 0.05, H: 1.1 },
      { id: 'FE-30', name: 'FE-30 加长围栏', L: 3.0, W: 0.06, H: 1.2 }
    ]
  },
  {
    type: 'post',
    label: '栓柱',
    water: false,
    models: [
      { id: 'PS-08', name: 'PS-08 矮栓柱', L: 0.12, W: 0.12, H: 0.8 },
      { id: 'PS-12', name: 'PS-12 标准栓柱', L: 0.15, W: 0.15, H: 1.2 }
    ]
  }
]

const TYPE_INDEX = Object.fromEntries(EQUIP_CATALOG.map(c => [c.type, c]))

export function getTypeDef(type) {
  return TYPE_INDEX[type]
}

export function getModel(type, modelId) {
  const def = TYPE_INDEX[type]
  if (!def) return null
  return def.models.find(m => m.id === modelId) || def.models[0]
}

export function defaultModelId(type) {
  return TYPE_INDEX[type].models[0].id
}

export function modelOptions(type) {
  return TYPE_INDEX[type].models.map(m => ({ id: m.id, name: m.name }))
}

// 实际占地尺寸(考虑缩放)
export function footprint(model, scale = 1) {
  return { L: model.L * scale, W: model.W * scale, H: model.H * scale }
}

// 水面面积(米²)，仅带 water 标记的器材计入
export function waterArea(model, scale = 1) {
  const def = TYPE_INDEX[Object.keys(TYPE_INDEX).find(t => {
    const d = TYPE_INDEX[t]
    return d.water && d.models.some(m => m.id === model.id)
  })]
  if (!def || !def.water) return 0
  return model.L * model.W * scale * scale
}
