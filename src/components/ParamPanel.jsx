import { PARAM_LABELS } from '../lib/rules'

const NUM_FIELDS = [
  { key: 'streetLength', min: 12, max: 300, step: 1, unit: 'm' },
  { key: 'depth', min: 4, max: 30, step: 0.5, unit: 'm' },
  { key: 'floors', min: 1, max: 4, step: 1, unit: '层' },
  { key: 'eaveHeight', min: 3, max: 16, step: 0.1, unit: 'm' },
  { key: 'windowBays', min: 2, max: 8, step: 1, unit: '列' },
  { key: 'latticeDensity', min: 0.05, max: 1, step: 0.05, unit: '' },
  { key: 'roofPitch', min: 15, max: 45, step: 1, unit: '°' },
]

export default function ParamPanel({ params, onChange, onGenerate, onRandomSeed, buildingCount }) {
  return (
    <section className="panel">
      <h2>生成参数</h2>
      {NUM_FIELDS.map((f) => (
        <label className="field" key={f.key}>
          <span>
            {PARAM_LABELS[f.key]}
            <em>
              {params[f.key]}
              {f.unit}
            </em>
          </span>
          <input
            type="range"
            min={f.min}
            max={f.max}
            step={f.step}
            value={params[f.key]}
            onChange={(e) => onChange({ ...params, [f.key]: Number(e.target.value) })}
          />
        </label>
      ))}
      <label className="field">
        <span>
          种子<em>{params.seed}</em>
        </span>
        <div className="seed-row">
          <input
            type="text"
            value={params.seed}
            onChange={(e) => onChange({ ...params, seed: e.target.value })}
            placeholder="手填种子"
          />
          <button type="button" onClick={onRandomSeed} title="随机种子">
            🎲
          </button>
        </div>
      </label>
      <button className="primary" onClick={onGenerate}>
        按规则生成 / 重新生成
      </button>
      <p className="note">同参数+同种子结果完全一致;已锁定的 {buildingCount} 栋在重新生成时保持不动。</p>
    </section>
  )
}
